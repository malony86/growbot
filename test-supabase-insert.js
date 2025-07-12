require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabaseデータベース挿入テスト...');

// データベースの基本接続テスト
async function testBasicConnection() {
  console.log('📤 基本接続テスト...');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/leads?select=count`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🌐 レスポンス状態:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ エラー:', errorText);
    } else {
      const result = await response.text();
      console.log('✅ 基本接続成功:', result);
    }
  } catch (error) {
    console.log('❌ 基本接続エラー:', error.message);
  }
}

// ダミーデータの挿入テスト
async function testDataInsert() {
  console.log('\n📝 データ挿入テスト...');

  const testData = {
    company_name: 'テスト会社',
    contact_name: 'テスト太郎',
    email: 'test@example.com',
    status: 'pending',
    email_status: 'pending',
    user_id: 'test-user-id'
  };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    });

    console.log('🌐 レスポンス状態:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ 挿入エラー:', errorText);
    } else {
      const result = await response.json();
      console.log('✅ 挿入成功:', result);
    }
  } catch (error) {
    console.log('❌ 挿入エラー:', error.message);
  }
}

// 実行
testBasicConnection().then(() => {
  testDataInsert();
}); 
