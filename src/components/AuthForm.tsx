'use client';

import { useState } from 'react';
import { auth } from '@/lib/supabase';

interface AuthFormProps {
    onAuthSuccess: () => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // デモモードの判定
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-project-url' ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 重複送信を防ぐ
        if (loading) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isDemo) {
                // デモモードでは認証をスキップ
                console.log('🎭 デモモードでログイン処理中...');
                setTimeout(() => {
                    console.log('🎭 デモモードログイン成功');
                    onAuthSuccess();
                }, 1000);
                return;
            }

            if (isLogin) {
                const { error } = await auth.signIn(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    onAuthSuccess();
                }
            } else {
                const { error } = await auth.signUp(email, password);
                if (error) {
                    setError(error.message);
                } else {
                    setError('確認メールを送信しました。メールを確認してください。');
                }
            }
        } catch (err) {
            setError('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Sales Automator</h1>
                    <p className="text-gray-600">
                        {isDemo ? 'デモモード' : (isLogin ? 'アカウントにログイン' : '新規アカウント作成')}
                    </p>
                </div>

                {isDemo && (
                    <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg text-blue-700 text-sm">
                        <p className="font-semibold">デモモードで実行中</p>
                        <p className="text-xs mt-1">
                            実際の認証とデータベース機能を使用するには、SETUP.mdを参照してSupabaseを設定してください。
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            メールアドレス
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required={!isDemo}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={isDemo ? "demo@example.com（デモモード）" : "your@email.com"}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            パスワード
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required={!isDemo}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={isDemo ? "demo（デモモード）" : "パスワードを入力"}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '処理中...' : isDemo ? 'デモを開始' : (isLogin ? 'ログイン' : '新規登録')}
                    </button>
                </form>

                {!isDemo && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            {isLogin ? '新規登録はこちら' : 'ログインはこちら'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 
