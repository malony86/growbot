'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';

interface CSVUploadProps {
    onClose: () => void;
    onSuccess: () => void;
}

interface CSVRow {
    company_name: string;
    contact_name: string;
    email: string;
    status: 'pending' | 'in_progress' | 'completed';
}

export default function CSVUpload({ onClose, onSuccess }: CSVUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [preview, setPreview] = useState<CSVRow[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('CSVファイルを選択してください。');
                return;
            }
            setFile(selectedFile);
            setError('');
            setSuccess('');
            previewCSV(selectedFile);
        }
    };

    const previewCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const data = results.data as any[];
                const validRows: CSVRow[] = [];

                data.forEach((row, index) => {
                    // 必須フィールドの確認
                    if (row.company_name && row.contact_name && row.email) {
                        validRows.push({
                            company_name: row.company_name.trim(),
                            contact_name: row.contact_name.trim(),
                            email: row.email.trim(),
                            status: row.status && ['pending', 'in_progress', 'completed'].includes(row.status)
                                ? row.status
                                : 'pending'
                        });
                    }
                });

                if (validRows.length === 0) {
                    setError('有効なデータが見つかりません。CSVファイルの形式を確認してください。');
                } else {
                    setPreview(validRows.slice(0, 5)); // 最初の5件をプレビュー
                }
            },
            error: (error) => {
                setError('CSVファイルの読み取りに失敗しました: ' + error.message);
            }
        });
    };

    const handleUpload = async () => {
        if (!file) {
            setError('ファイルを選択してください。');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            console.log('📤 CSVアップロード開始:', file.name);
            console.log('🔍 CSVアップロード方式: クライアントサイドPapa.parse（APIサーバー不使用）');

            // CSVファイルを直接パースして処理
            Papa.parse(file, {
                header: true,
                complete: async (results) => {
                    try {
                        const data = results.data as any[];
                        const validRows: any[] = [];

                        data.forEach((row, index) => {
                            // 必須フィールドの確認
                            if (row.company_name && row.contact_name && row.email) {
                                validRows.push({
                                    company_name: row.company_name.trim(),
                                    contact_name: row.contact_name.trim(),
                                    email: row.email.trim(),
                                    status: row.status && ['pending', 'in_progress', 'completed'].includes(row.status)
                                        ? row.status
                                        : 'pending',
                                    user_id: 'demo-user'
                                });
                            }
                        });

                        if (validRows.length === 0) {
                            setError('有効なデータが見つかりません。CSVファイルの形式を確認してください。');
                            setUploading(false);
                            return;
                        }

                        // leadsApiを使用してデータを直接追加
                        const { leadsApi } = await import('@/lib/leads');
                        const { data: newLeads, error } = await leadsApi.createBulkLeads(validRows);

                        if (error) {
                            throw new Error(error.message || 'データの追加に失敗しました');
                        }

                        console.log('✅ アップロード成功:', newLeads?.length || 0, '件追加');
                        setSuccess(`${newLeads?.length || 0}件のリードが正常に追加されました。`);
                        setFile(null);
                        setPreview([]);

                        // ファイル入力をリセット
                        if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                        }

                        // 成功後に親コンポーネントに通知
                        setTimeout(() => {
                            onSuccess();
                            onClose();
                        }, 2000);

                    } catch (err) {
                        console.error('❌ CSVアップロードエラー:', err);
                        if (err instanceof Error) {
                            setError(`アップロードエラー: ${err.message}`);
                        } else {
                            setError('アップロードに失敗しました。もう一度お試しください。');
                        }
                        setUploading(false);
                    }
                },
                error: (error) => {
                    setError('CSVファイルの読み取りに失敗しました: ' + error.message);
                    setUploading(false);
                }
            });

        } catch (err) {
            console.error('❌ CSVアップロードエラー:', err);
            setError('アップロードに失敗しました。もう一度お試しください。');
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">営業リストCSVアップロード</h2>
                                <p className="text-gray-600">CSVファイルから営業リストを一括登録</p>
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

                    {/* CSVフォーマット説明 */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">CSVファイルの形式</h3>
                        <p className="text-blue-700 text-sm mb-2">
                            以下の列を含むCSVファイルをアップロードしてください：
                        </p>
                        <div className="text-blue-700 text-sm">
                            <code className="bg-blue-100 px-2 py-1 rounded">
                                company_name,contact_name,email,status
                            </code>
                        </div>
                        <p className="text-blue-700 text-sm mt-2">
                            status は pending/in_progress/completed のいずれか（省略可、デフォルト：pending）
                        </p>
                    </div>

                    {/* ファイル選択 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            CSVファイル
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="csv-file"
                            />
                            <label
                                htmlFor="csv-file"
                                className="cursor-pointer flex flex-col items-center space-y-2"
                            >
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm text-gray-600">
                                    クリックしてCSVファイルを選択
                                </span>
                                {file && (
                                    <span className="text-sm text-blue-600 font-medium">
                                        選択済み: {file.name}
                                    </span>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* プレビュー */}
                    {preview.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">データプレビュー（最初の5件）</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">会社名</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">担当者</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">メール</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {preview.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm text-gray-900">{row.company_name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{row.contact_name}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{row.email}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${row.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        row.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {row.status === 'completed' ? '完了' :
                                                            row.status === 'in_progress' ? '対応中' : '未対応'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* エラー・成功メッセージ */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    {/* アクションボタン */}
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>アップロード中...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span>アップロード</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 
