// SendGrid Webhook テスト用スクリプト
// 使用方法: node test-webhook.js

const http = require('http');

// テスト用のSendGridイベントデータ
const testEvents = [
  {
    email: "tanaka@abc.com",
    timestamp: Math.floor(Date.now() / 1000),
    event: "delivered",
    sg_event_id: "test-delivered-001",
    sg_message_id: "test-message-001",
    category: ["sales", "automation"]
  },
  {
    email: "sato@xyz.com",
    timestamp: Math.floor(Date.now() / 1000),
    event: "opened",
    sg_event_id: "test-opened-001",
    sg_message_id: "test-message-002",
    category: ["sales", "automation"]
  },
  {
    email: "yamada@test.com",
    timestamp: Math.floor(Date.now() / 1000),
    event: "clicked",
    url: "https://example.com/product",
    sg_event_id: "test-clicked-001",
    sg_message_id: "test-message-003",
    category: ["sales", "automation"]
  },
  {
    email: "invalid@example.com",
    timestamp: Math.floor(Date.now() / 1000),
    event: "bounce",
    reason: "550 5.1.1 User unknown",
    sg_event_id: "test-bounce-001",
    sg_message_id: "test-message-004",
    category: ["sales", "automation"]
  }
];

// Webhookエンドポイントにテストデータを送信
function sendTestWebhook() {
  const postData = JSON.stringify(testEvents);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`ステータス: ${res.statusCode}`);
    console.log(`ヘッダー: ${JSON.stringify(res.headers, null, 2)}`);

    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('レスポンス:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`リクエストエラー: ${e.message}`);
  });

  // テストデータを送信
  req.write(postData);
  req.end();
}

// ヘルスチェック
function testHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhook',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`ヘルスチェック ステータス: ${res.statusCode}`);

    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('ヘルスチェック レスポンス:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`ヘルスチェックエラー: ${e.message}`);
  });

  req.end();
}

console.log('🧪 SendGrid Webhook テスト開始');
console.log('📡 開発サーバーが http://localhost:3000 で動作していることを確認してください\n');

console.log('1. ヘルスチェック実行中...');
testHealthCheck();

setTimeout(() => {
  console.log('\n2. テストイベント送信中...');
  sendTestWebhook();
}, 1000); 
