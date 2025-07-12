'use client';

import { useState } from 'react';
import { emailTemplates } from '@/lib/emailTemplates';

interface EmailGeneratorProps {
    onClose: () => void;
}

export default function EmailGenerator({ onClose }: EmailGeneratorProps) {
    const [companyName, setCompanyName] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [error, setError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');
    const [isDemo, setIsDemo] = useState(false);

    // テンプレート選択の状態
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [senderName, setSenderName] = useState('田中太郎');
    const [senderEmail, setSenderEmail] = useState('tanaka@sales-automator.com');
    const [senderPhone, setSenderPhone] = useState('03-1234-5678');
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    const handleGenerate = async () => {
        if (!companyName || !contactName) {
            setError('会社名と担当者名を入力してください');
            return;
        }

        setLoading(true);
        setError('');
        setSendSuccess('');

        try {
            const response = await fetch('/api/generate-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyName: companyName.trim(),
                    contactName: contactName.trim(),
                    templateId: selectedTemplateId || undefined,
                    category: selectedCategory || undefined,
                    senderName: senderName.trim(),
                    senderEmail: senderEmail.trim(),
                    senderPhone: senderPhone.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'メール生成に失敗しました');
            }

            setGeneratedEmail(data.email);
            setSelectedTemplate(data.template);
            setIsDemo(data.isDemo || false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async () => {
        if (!contactEmail || !generatedEmail) {
            setError('メールアドレスと生成されたメールが必要です');
            return;
        }

        setSendingEmail(true);
        setError('');
        setSendSuccess('');

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: contactEmail.trim(),
                    subject: `${companyName}様へのご提案`,
                    html: generatedEmail.replace(/\n/g, '<br>'),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'メール送信に失敗しました');
            }

            setSendSuccess(data.message);
            if (data.demo) {
                setIsDemo(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedEmail);
            alert('メールをクリップボードにコピーしました！');
        } catch (err) {
            alert('コピーに失敗しました');
        }
    };

    const handleReset = () => {
        setCompanyName('');
        setContactName('');
        setContactEmail('');
        setGeneratedEmail('');
        setError('');
        setSendSuccess('');
        setIsDemo(false);
        setSelectedTemplateId('');
        setSelectedCategory('');
        setSelectedTemplate(null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">営業メール生成・送信</h2>
                                <p className="text-gray-600">テンプレートベースで営業メールを生成し、Amazon SESで送信</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* 入力フォーム */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">営業先情報</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    会社名 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="例: 株式会社サンプル"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    担当者名 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                    placeholder="例: 田中太郎"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    メールアドレス <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    placeholder="例: tanaka@sample.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* テンプレート選択セクション */}
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">メールテンプレート</h4>

                                {/* 特定のテンプレートを選択 */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        テンプレート選択
                                    </label>
                                    <select
                                        value={selectedTemplateId}
                                        onChange={(e) => {
                                            setSelectedTemplateId(e.target.value);
                                            setSelectedCategory(''); // テンプレートを選択したらカテゴリをクリア
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">ランダム（自動選択）</option>
                                        {emailTemplates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* カテゴリ選択（テンプレートが選択されていない場合） */}
                                {!selectedTemplateId && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            カテゴリ選択
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">すべてのカテゴリ</option>
                                            <option value="business">ビジネス</option>
                                            <option value="friendly">親しみやすい</option>
                                            <option value="formal">フォーマル</option>
                                            <option value="brief">簡潔</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* 送信者情報セクション */}
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">送信者情報</h4>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            送信者名
                                        </label>
                                        <input
                                            type="text"
                                            value={senderName}
                                            onChange={(e) => setSenderName(e.target.value)}
                                            placeholder="例: 田中太郎"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            送信者メールアドレス
                                        </label>
                                        <input
                                            type="email"
                                            value={senderEmail}
                                            onChange={(e) => setSenderEmail(e.target.value)}
                                            placeholder="例: tanaka@sales-automator.com"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            電話番号
                                        </label>
                                        <input
                                            type="tel"
                                            value={senderPhone}
                                            onChange={(e) => setSenderPhone(e.target.value)}
                                            placeholder="例: 03-1234-5678"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {sendSuccess && (
                                <div className="p-3 bg-green-100 border border-green-200 rounded-lg text-green-700 text-sm">
                                    {sendSuccess}
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !companyName || !contactName}
                                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>生成中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span>メール生成</span>
                                        </>
                                    )}
                                </button>

                                {generatedEmail && (
                                    <button
                                        onClick={handleReset}
                                        className="bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        リセット
                                    </button>
                                )}
                            </div>

                            {/* メール送信ボタン */}
                            {generatedEmail && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-md font-semibold text-gray-900 mb-3">メール送信</h4>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleSendEmail}
                                            disabled={sendingEmail || !contactEmail || !generatedEmail}
                                            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            {sendingEmail ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>送信中...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                    <span>メール送信</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCopyToClipboard}
                                            className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>コピー</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 生成結果 */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">生成されたメール</h3>
                                {selectedTemplate && (
                                    <div className="text-sm text-gray-500">
                                        使用テンプレート: {selectedTemplate.name}
                                    </div>
                                )}
                            </div>

                            {isDemo && (
                                <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg text-blue-700 text-sm">
                                    <p className="font-semibold">デモモード</p>
                                    <p>実際のAPI機能を使用するには、環境変数を設定してください。</p>
                                </div>
                            )}

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[300px]">
                                {generatedEmail ? (
                                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                                        {generatedEmail}
                                    </pre>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <p>会社名と担当者名を入力して、「メール生成」ボタンを押してください</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* フッター */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                <p>💡 テンプレートから生成されたメールは、送信前に必ず内容を確認してください</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
