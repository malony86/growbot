# Sales Automator Dashboard

営業プロセスを自動化し、効率的な営業活動を実現するダッシュボード

## 主な機能

- **🎯 営業リード管理**: CSVファイルでの一括インポート対応
- **🤖 AI営業メール生成**: ChatGPTを使用した自動メール生成
- **📧 メール配信**: Amazon SESを使用した大量配信
- **📊 KPIダッシュボード**: 配信実績とパフォーマンス分析
- **🔔 配信状況追跡**: SES SNS通知による配信状況の自動更新

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Supabase (PostgreSQL)
- **メール配信**: Amazon SES
- **AI**: OpenAI GPT API
- **チャート**: Chart.js

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の設定を追加してください：

```env
# Amazon SES設定
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
FROM_EMAIL=noreply@your-domain.com

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI設定
OPENAI_API_KEY=your-openai-api-key
```

### 3. Amazon SESの設定

1. **IAMユーザーの作成**
   - AWS IAMコンソールでSES送信権限を持つユーザーを作成
   - 必要なポリシー: `AmazonSESFullAccess`

2. **送信者メールアドレスの認証**
   - Amazon SESコンソールで送信者メールアドレスを認証
   - 本番環境では独自ドメインの認証を推奨

3. **SNS通知の設定**（オプション）
   - 配信状況の自動追跡用
   - Webhook URL: `https://your-domain.com/api/webhook`

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションにアクセス

## デモモード

環境変数が設定されていない場合、自動的にデモモードで動作します：

- **認証**: デモユーザーで自動ログイン
- **データベース**: メモリ内データで動作
- **メール送信**: 実際の送信はせずログ出力のみ

## 本番環境での推奨事項

### セキュリティ

- IAMロールの使用（EC2/Lambda環境）
- 環境変数の暗号化
- HTTPS通信の強制

### パフォーマンス

- Amazon SESの送信クォータ確認
- 大量配信時のレート制限対応
- データベースのインデックス最適化

## API エンドポイント

- `POST /api/upload-csv`: CSVファイルアップロード
- `POST /api/generate-email`: AI営業メール生成
- `POST /api/send-email`: メール送信
- `POST /api/webhook`: SES SNS通知受信

## ライセンス

MIT License
