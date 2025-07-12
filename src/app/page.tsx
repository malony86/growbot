'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';
import LeadsDashboard from '@/components/LeadsDashboard';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // デモモードの判定
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-project-url' ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';

  // デモユーザーの情報
  const demoUser = {
    id: 'demo-user',
    email: 'demo@example.com'
  };

  useEffect(() => {
    // 初期化時に現在のユーザーを確認
    const initializeAuth = async () => {
      if (isDemo) {
        // デモモードの場合はデモユーザーを設定
        setUser(demoUser);
        setLoading(false);
        return;
      }

      // 実際のSupabaseを使用する場合
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    if (isDemo) {
      // デモモードの場合は認証状態の監視をスキップ
      initializeAuth();
      return;
    }

    // 認証状態の変更を監視（実際のSupabaseを使用する場合のみ）
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    initializeAuth();

    // クリーンアップ
    return () => {
      subscription.unsubscribe();
    };
  }, [isDemo]);

  const handleAuthSuccess = async () => {
    if (isDemo) {
      // デモモードの場合はデモユーザーを設定
      setUser(demoUser);
    } else {
      // 実際のSupabaseを使用する場合
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    }
  };

  const handleLogout = async () => {
    if (isDemo) {
      // デモモードの場合は単純にユーザーをクリア
      setUser(null);
    } else {
      // 実際のSupabaseを使用する場合
      await auth.signOut();
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return <LeadsDashboard user={user} onLogout={handleLogout} />;
}
