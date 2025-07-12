import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// 環境変数の設定 - 実際のプロジェクトでは.env.localファイルで設定してください
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が正しく設定されているかチェック
const isSupabaseConfigured = () => {
    return supabaseUrl &&
        supabaseKey &&
        supabaseUrl !== 'your-project-url' &&
        supabaseKey !== 'your-anon-key';
};

// デモモード用のモックオブジェクト
const createMockQuery = () => ({
    select: () => createMockQuery(),
    eq: () => createMockQuery(),
    single: () => createMockQuery(),
    order: () => createMockQuery(),
    insert: () => createMockQuery(),
    update: () => createMockQuery(),
    delete: () => createMockQuery(),
    then: () => Promise.resolve({ data: null, error: null })
});

// Supabaseクライアントまたはモックオブジェクトを作成
export const supabase = isSupabaseConfigured()
    ? createClient<Database>(supabaseUrl!, supabaseKey!)
    : {
        // デモモード用のモックオブジェクト
        from: () => createMockQuery(),
        auth: {
            signUp: async () => ({ data: null, error: new Error('デモモードでは認証は利用できません') }),
            signInWithPassword: async () => ({ data: null, error: new Error('デモモードでは認証は利用できません') }),
            signOut: async () => ({ error: new Error('デモモードでは認証は利用できません') }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        }
    };

// 認証関連のユーティリティ関数
export const auth = {
    // サインアップ
    async signUp(email: string, password: string) {
        if (!isSupabaseConfigured()) {
            return {
                data: null,
                error: new Error('デモモードでは認証は利用できません。実際のプロジェクトではSUPABASE設定を行ってください。')
            };
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { data, error };
    },

    // サインイン
    async signIn(email: string, password: string) {
        if (!isSupabaseConfigured()) {
            return {
                data: null,
                error: new Error('デモモードでは認証は利用できません。実際のプロジェクトではSUPABASE設定を行ってください。')
            };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    // サインアウト
    async signOut() {
        if (!isSupabaseConfigured()) {
            return { error: new Error('デモモードでは認証は利用できません。') };
        }

        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // 現在のユーザーを取得
    async getCurrentUser() {
        if (!isSupabaseConfigured()) {
            return null;
        }

        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // 認証状態の変更を監視
    onAuthStateChange(callback: (event: string, session: any) => void) {
        if (!isSupabaseConfigured()) {
            return { data: { subscription: { unsubscribe: () => { } } } };
        }

        return supabase.auth.onAuthStateChange(callback);
    }
}; 
