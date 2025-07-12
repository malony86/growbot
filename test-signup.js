require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 新規登録テスト開始...');

// 設定確認
console.log('📋 設定確認:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 設定済み' : '❌ 未設定');
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ 設定済み' : '❌ 未設定');

// 新規登録のテスト
async function testSignUp() {
  console.log('🔒 新規登録API直接テスト開始...');

  // テスト用のダミー情報
  const testEmail = 'test@example.com';
  const testPassword = 'testpass123';

  try {
    // 直接fetch APIを使用して新規登録を試す
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    console.log('🌐 レスポンス状態:', response.status);
    console.log('🌐 レスポンスヘッダー:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ エラーレスポンス:', errorText);

      // 401エラーの詳細を確認
      if (response.status === 401) {
        console.log('🔍 401エラー詳細分析:');
        console.log('- API Key:', supabaseKey ? '設定済み' : '未設定');
        console.log('- API Key長:', supabaseKey ? supabaseKey.length : 0);
        console.log('- URL:', supabaseUrl);
        console.log('- API Key先頭:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'なし');
      }
    } else {
      const result = await response.json();
      console.log('✅ 新規登録成功:', result);
    }

  } catch (error) {
    console.log('❌ 新規登録エラー:', error.message);
  }
}

// 実行
if (supabaseUrl && supabaseKey) {
  testSignUp();
} else {
  console.log('❌ Supabase設定が不完全です');
} 
