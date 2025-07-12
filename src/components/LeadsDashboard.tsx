'use client';

import { useState, useEffect } from 'react';
import { Lead, leadStatusLabels, leadStatusColors, emailStatusLabels, emailStatusColors } from '@/types/database';
import { leadsApi } from '@/lib/leads';
import { auth } from '@/lib/supabase';
import EmailGenerator from './EmailGenerator';
import KPIChart from './KPIChart';
import CSVUpload from './CSVUpload';

interface LeadsDashboardProps {
    user: any;
    onLogout: () => void;
}

export default function LeadsDashboard({ user, onLogout }: LeadsDashboardProps) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEmailGenerator, setShowEmailGenerator] = useState(false);
    const [showCSVUpload, setShowCSVUpload] = useState(false);
    const [stats, setStats] = useState<any>({});

    const [newLead, setNewLead] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        status: 'pending' as const
    });

    // デモモードの判定
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-project-url' ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';

    // デモユーザーの情報
    const demoUser = {
        id: 'demo-user',
        email: 'demo@example.com'
    };

    const currentUser = isDemo ? demoUser : user;

    useEffect(() => {
        loadLeads();
        loadStats();

        // リアルタイム更新: 30秒ごとにデータを再読み込み
        const interval = setInterval(() => {
            loadLeads();
            loadStats();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadLeads = async () => {
        try {
            console.log('🔄 リードデータの読み込み開始...', { userId: currentUser.id });

            const { data, error } = await leadsApi.getLeads(currentUser.id);

            if (error) {
                console.error('❌ リードの読み込みエラー:', error);
                setError('リードの読み込みに失敗しました。');
            } else {
                console.log('✅ リードデータの読み込み完了:', {
                    取得件数: data?.length || 0,
                    データサンプル: data?.slice(0, 3).map(l => ({ id: l.id, company: l.company_name, status: l.status })) || []
                });
                setLeads(data || []);
            }
        } catch (err) {
            console.error('❌ リードの読み込み例外:', err);
            setError('リードの読み込みに失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const { data, error } = await leadsApi.getLeadStats(currentUser.id);
            if (!error) {
                setStats(data || {});
            }
        } catch (err) {
            console.error('統計データの読み込みに失敗しました:', err);
        }
    };

    const handleAddLead = async (e: React.FormEvent) => {
        e.preventDefault();

        // 重複送信を防ぐ
        if (loading) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data, error } = await leadsApi.createLead({
                ...newLead,
                user_id: currentUser.id
            });

            if (error) {
                setError('リードの作成に失敗しました。');
            } else {
                setLeads([data!, ...leads]);
                setNewLead({
                    company_name: '',
                    contact_name: '',
                    email: '',
                    status: 'pending'
                });
                setShowAddForm(false);
                loadStats();

                // 新規リード追加完了（自動送信しない）
                console.log(`✅ 新規リード追加完了: ${data!.email}`);
            }
        } catch (err) {
            setError('リードの作成に失敗しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkSendEmail = async () => {
        const pendingLeads = leads.filter(lead => lead.status === 'pending');

        if (pendingLeads.length === 0) {
            alert('送信対象のリードがありません。');
            return;
        }

        if (!confirm(`${pendingLeads.length}件のリードにメールを送信しますか？`)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            let successCount = 0;
            let failCount = 0;

            for (const lead of pendingLeads) {
                try {
                    // メール内容を生成
                    const subject = `${lead.company_name}様へのご提案`;
                    const html = `
                        <p>お世話になっております。</p>
                        <p>${lead.contact_name}様</p>
                        <p>この度は貴重なお時間をいただき、ありがとうございます。</p>
                        <p>弊社サービスについてご提案させていただきたく、ご連絡いたします。</p>
                        <p>何かご不明な点がございましたら、お気軽にお問い合わせください。</p>
                        <p>よろしくお願いいたします。</p>
                    `;

                    console.log(`📧 一括メール送信開始: ${lead.email}`);

                    const response = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            to: lead.email,
                            subject: subject,
                            html: html,
                        }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        console.log(`✅ 一括メール送信成功: ${lead.email}`);
                        successCount++;
                    } else {
                        console.error(`❌ 一括メール送信失敗: ${lead.email}`, result.error);
                        failCount++;
                    }

                    // 送信間隔を1秒空ける（Amazon SES制限対策）
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    console.error(`メール送信エラー: ${lead.email}`, err);
                    failCount++;
                }
            }

            // 結果表示
            if (failCount === 0) {
                alert(`✅ ${successCount}件のメール送信が完了しました！`);
            } else {
                alert(`⚠️ ${successCount}件成功、${failCount}件失敗でメール送信が完了しました。`);
            }

            // データを再読み込み
            loadLeads();
            loadStats();
        } catch (error) {
            console.error('一括送信中にエラー:', error);
            setError('一括送信中にエラーが発生しました。');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
        try {
            const { data, error } = await leadsApi.updateLead(leadId, { status: newStatus });
            if (error) {
                setError('ステータスの更新に失敗しました。');
            } else {
                setLeads(leads.map(lead =>
                    lead.id === leadId ? { ...lead, status: newStatus } : lead
                ));
                loadStats();
            }
        } catch (err) {
            setError('ステータスの更新に失敗しました。');
        }
    };

    const handleDeleteLead = async (leadId: string) => {
        if (!confirm('このリードを削除しますか？')) return;

        try {
            const { error } = await leadsApi.deleteLead(leadId);
            if (error) {
                setError('リードの削除に失敗しました。');
            } else {
                setLeads(leads.filter(lead => lead.id !== leadId));
                loadStats();
            }
        } catch (err) {
            setError('リードの削除に失敗しました。');
        }
    };



    const handleCSVUploadSuccess = async () => {
        // CSVアップロード成功後にデータを強制的に再読み込み
        console.log('📝 CSVアップロード成功コールバック開始 - データを再読み込み中...');

        // ローディング状態を一時的に有効化
        setLoading(true);

        try {
            // 少し待ってからデータを再読み込み（アップロード処理の完了を待つ）
            console.log('⏳ 500ms待機中...');
            await new Promise(resolve => setTimeout(resolve, 500));

            // データを再読み込み
            console.log('🔄 リードデータとステータスを再読み込み中...');
            await loadLeads();
            await loadStats();

            console.log('✅ CSVアップロード成功処理完了 - データ更新済み');

            // 成功メッセージを表示
            setError('');
            alert('✅ CSVアップロードが完了しました！リードが追加されました。');

        } catch (error) {
            console.error('❌ CSVアップロード後のデータ更新エラー:', error);
            setError('CSVアップロードは成功しましたが、データの更新に失敗しました。');
        } finally {
            setLoading(false);
            console.log('🏁 CSVアップロード成功処理終了');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">データを読み込んでいます...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Sales Automator Dashboard</h1>
                            {isDemo && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    デモモード
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">
                                ようこそ、{currentUser.email}
                                {isDemo && ' （デモユーザー）'}
                            </span>
                            <button
                                onClick={onLogout}
                                className="text-gray-600 hover:text-red-600 transition-colors"
                            >
                                {isDemo ? 'デモを終了' : 'ログアウト'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {isDemo && (
                    <div className="mb-6 p-4 bg-blue-100 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">デモモードで実行中</h3>
                        <p className="text-blue-700 text-sm">
                            このアプリケーションは現在デモモードで動作しています。
                            実際のデータベース機能を使用するには、SETUP.mdを参照してSupabaseを設定してください。
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* KPI Chart Section */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">営業KPI分析</h2>
                    <KPIChart />
                </section>

                {/* Stats Section */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">
                            {stats.pending || 0}
                        </div>
                        <div className="text-gray-600">未対応</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                            {stats.sent || 0}
                        </div>
                        <div className="text-gray-600">送信済み</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {stats.in_progress || 0}
                        </div>
                        <div className="text-gray-600">対応中</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {stats.completed || 0}
                        </div>
                        <div className="text-gray-600">完了</div>
                    </div>
                </section>

                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>新しいリードを追加</span>
                    </button>

                    <button
                        onClick={handleBulkSendEmail}
                        disabled={loading || leads.filter(lead => lead.status === 'pending').length === 0}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>
                            {loading ? '送信中...' : `未送信リードに一括送信 (${leads.filter(lead => lead.status === 'pending').length}件)`}
                        </span>
                    </button>

                    <button
                        onClick={() => setShowEmailGenerator(true)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>AI営業メール生成</span>
                    </button>

                    <button
                        onClick={() => setShowCSVUpload(true)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>CSVリストアップロード</span>
                    </button>
                </div>

                {/* Add Lead Form */}
                {showAddForm && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいリードを追加</h3>
                        <form onSubmit={handleAddLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    会社名
                                </label>
                                <input
                                    type="text"
                                    value={newLead.company_name}
                                    onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="会社名を入力"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    担当者名
                                </label>
                                <input
                                    type="text"
                                    value={newLead.contact_name}
                                    onChange={(e) => setNewLead({ ...newLead, contact_name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="担当者名を入力"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    メールアドレス
                                </label>
                                <input
                                    type="email"
                                    value={newLead.email}
                                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="メールアドレスを入力"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? '追加中...' : '追加'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    disabled={loading}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Leads Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">リード一覧</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        会社名
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        担当者
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        メール
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        営業ステータス
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        メール状況
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {lead.company_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lead.contact_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lead.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleUpdateStatus(lead.id, e.target.value as Lead['status'])}
                                                className={`text-xs px-2 py-1 rounded-full ${leadStatusColors[lead.status]} border-0 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            >
                                                <option value="pending">未対応</option>
                                                <option value="sent">送信済み</option>
                                                <option value="in_progress">対応中</option>
                                                <option value="completed">完了</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${lead.email_status ? emailStatusColors[lead.email_status] : emailStatusColors.pending
                                                }`}>
                                                {lead.email_status ? emailStatusLabels[lead.email_status] : emailStatusLabels.pending}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => handleDeleteLead(lead.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                削除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {leads.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                リードがありません。新しいリードを追加してください。
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Email Generator Modal */}
            {showEmailGenerator && (
                <EmailGenerator onClose={() => setShowEmailGenerator(false)} />
            )}

            {/* CSV Upload Modal */}
            {showCSVUpload && (
                <CSVUpload
                    onClose={() => setShowCSVUpload(false)}
                    onSuccess={handleCSVUploadSuccess}
                />
            )}
        </div>
    );
} 
