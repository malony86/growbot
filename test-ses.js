// Amazon SES接続テスト用スクリプト
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
require('dotenv').config({ path: '.env.local' });

// SES設定
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function testSESConnection() {
  console.log('🔧 Amazon SES接続テスト開始...');

  // 環境変数の確認
  console.log('📋 設定確認:');
  console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ 設定済み' : '❌ 未設定');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ 設定済み' : '❌ 未設定');
  console.log('- AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
  console.log('- FROM_EMAIL:', process.env.FROM_EMAIL || '❌ 未設定');

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ AWS認証情報が設定されていません');
    return;
  }

  if (!process.env.FROM_EMAIL || process.env.FROM_EMAIL === 'your-verified-email@example.com') {
    console.log('❌ FROM_EMAILが設定されていません');
    return;
  }

  // テストメール送信
  const testEmail = {
    Source: process.env.FROM_EMAIL,
    Destination: {
      ToAddresses: [process.env.FROM_EMAIL], // 自分自身に送信
    },
    Message: {
      Subject: {
        Data: '📧 Amazon SES テストメール',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `
                        <h2>🎉 Amazon SES 接続テスト成功！</h2>
                        <p>Sales Automator Dashboard から Amazon SES を使用してメールを送信できました。</p>
                        <p><strong>送信時刻:</strong> ${new Date().toLocaleString('ja-JP')}</p>
                        <p><strong>送信者:</strong> ${process.env.FROM_EMAIL}</p>
                        <hr>
                        <p><em>このメールは自動送信テストです。</em></p>
                    `,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    console.log('📤 テストメール送信中...');
    const command = new SendEmailCommand(testEmail);
    const response = await sesClient.send(command);

    console.log('✅ テストメール送信成功!');
    console.log('📨 Message ID:', response.MessageId);
    console.log('📬 送信先:', process.env.FROM_EMAIL);
    console.log('🎯 メールボックスを確認してください');

  } catch (error) {
    console.error('❌ テストメール送信エラー:', error.message);

    if (error.name === 'MessageRejected') {
      console.log('💡 ヒント: FROM_EMAILが Amazon SES で認証されていない可能性があります');
    } else if (error.name === 'CredentialsError') {
      console.log('💡 ヒント: AWS認証情報が正しくない可能性があります');
    }
  }
}

// テスト実行
testSESConnection().catch(console.error); 
