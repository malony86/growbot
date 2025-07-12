require('dotenv').config({ path: '.env.local' });

console.log('🔧 環境変数の状態確認...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 環境変数の値:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? supabaseKey.substring(0, 50) + '...' : 'undefined');

// isSupabaseConfigured関数のテスト
const isSupabaseConfigured = () => {
  console.log('\n🔍 isSupabaseConfigured関数のテスト:');
  console.log('- supabaseUrl存在:', !!supabaseUrl);
  console.log('- supabaseKey存在:', !!supabaseKey);
  console.log('- URL != your-project-url:', supabaseUrl !== 'your-project-url');
  console.log('- Key != your-anon-key:', supabaseKey !== 'your-anon-key');

  const result = supabaseUrl &&
    supabaseKey &&
    supabaseUrl !== 'your-project-url' &&
    supabaseKey !== 'your-anon-key';

  console.log('- 最終結果:', result);
  return result;
};

const isConfigured = isSupabaseConfigured();
console.log('\n📝 結論:');
console.log('- Supabase設定済み:', isConfigured);
console.log('- デモモード:', !isConfigured); 
