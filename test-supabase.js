// Supabase接続テスト用スクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔧 Supabase接続テスト開始...');

  // 環境変数の確認
  console.log('📋 設定確認:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('❌ Supabase認証情報が設定されていません');
    return;
  }

  // Supabaseクライアントの作成
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // 認証の基本テスト
    console.log('📤 Supabase接続テスト中...');

    // 現在のユーザー取得を試す
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ Supabase接続エラー:', error.message);

      if (error.message.includes('Invalid API key')) {
        console.log('💡 ヒント: ANON_KEYが正しくない可能性があります');
      } else if (error.message.includes('Invalid URL')) {
        console.log('💡 ヒント: SUPABASE_URLが正しくない可能性があります');
      }
    } else {
      console.log('✅ Supabase接続成功!');
      console.log('👤 現在のユーザー:', user ? user.email : 'なし（未ログイン）');
    }

    // プロジェクト情報の確認
    console.log('🏗️  プロジェクト情報:');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...');

  } catch (error) {
    console.error('❌ 予期しないエラー:', error.message);
  }
}

// テスト実行
testSupabaseConnection().catch(console.error); 
