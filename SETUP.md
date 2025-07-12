# Sales Automator Dashboard セットアップ手順

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURLとAPI Keyを取得

## 2. データベースの設定

Supabaseのテーブルエディタで以下のテーブルを作成してください：

### leadsテーブル
```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS (Row Level Security) を有効化
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成（ユーザーは自分のリードのみアクセス可能）
CREATE POLICY "Users can view their own leads" ON leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON leads
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. OpenAI APIの設定

AI営業メール生成機能を使用するには、OpenAI APIキーが必要です：

1. [OpenAI Platform](https://platform.openai.com/)でアカウントを作成
2. API Keys セクションで新しいAPIキーを作成
3. 作成したAPIキーをコピー

## 4. SendGrid APIの設定

メール送信機能を使用するには、SendGrid APIキーが必要です：

1. [SendGrid](https://sendgrid.com/)でアカウントを作成
2. API Keys セクションで新しいAPIキーを作成
3. 作成したAPIキーをコピー
4. 送信者メールアドレスを認証（Single Sender Verification）

## 5. 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成し、以下を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI API設定
OPENAI_API_KEY=your-openai-api-key

# SendGrid設定
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=your-verified-sender@example.com
```

### 環境変数の取得方法

**Supabase設定:**
- `NEXT_PUBLIC_SUPABASE_URL`: Project Settings > API > Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings > API > Project API keys > anon public

**OpenAI API設定:**
- `OPENAI_API_KEY`: OpenAI Platform > API Keys で作成したキー

**SendGrid設定:**
- `SENDGRID_API_KEY`: SendGrid > Settings > API Keys で作成したキー
- `FROM_EMAIL`: SendGrid > Settings > Sender Authentication で認証したメールアドレス

## 6. 認証の設定

Supabaseの認証設定で以下を確認してください：

- メール認証が有効になっている
- 必要に応じて、確認メールのテンプレートをカスタマイズ

## 7. 開発サーバーの起動

```bash
npm run dev
```

## 使用方法

### 基本機能
1. アプリケーションにアクセス
2. 新規登録またはログイン
3. リードの追加・管理
4. ステータスの更新
5. 統計情報の確認

### AI営業メール生成・送信
1. ダッシュボードで「AI営業メール生成」ボタンをクリック
2. 会社名、担当者名、メールアドレスを入力
3. 「メール生成」ボタンでChatGPTがメールを自動生成
4. 「メール送信」ボタンでSendGridを使って即座に送信
5. 送信成功時は成功メッセージが表示される

## 機能

- 🔐 **認証機能**: サインアップ/ログイン/ログアウト
- 📊 **リード管理**: 追加・更新・削除・ステータス管理
- 📈 **リアルタイム統計**: ダッシュボードでの進捗確認
- 🤖 **AI メール生成**: OpenAI GPT-3.5-turboによる営業メール自動作成
- 📧 **メール送信**: SendGrid APIを使った即座のメール送信
- 📊 **メール追跡**: SendGrid Webhookによる配信・開封・クリック状況の自動更新
- 📋 **CSVアップロード**: 営業リストの一括インポート機能
- 📈 **KPIグラフ**: Chart.jsによる売上分析ダッシュボード
- 📋 **クリップボード連携**: 生成されたメールの簡単コピー
- 🔄 **デモモード**: API設定前でも動作確認可能
- 📱 **レスポンシブデザイン**: 全デバイス対応

## 8. SendGrid Webhook設定（メール追跡）

メール送信後のイベント（配信、開封、クリック等）を自動追跡するために、SendGridのWebhook機能を設定します。

### Supabaseデータベースの更新

まず、leadsテーブルにemail_statusカラムを追加してください：

```sql
-- SendGrid Webhookイベント追跡のためのemail_statusカラムを追加
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'pending';

-- email_statusの制約を追加
ALTER TABLE leads 
ADD CONSTRAINT valid_email_status 
CHECK (email_status IN ('pending', 'delivered', 'opened', 'clicked', 'bounced'));

-- updated_atカラムを追加
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_leads_email_status ON leads(email_status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
```

### SendGrid Webhook設定手順

1. **SendGridダッシュボードにログイン**
2. **Settings > Mail Settings > Event Webhook** に移動
3. **HTTP POST URL** に以下を設定:
   ```
   https://your-domain.com/api/webhook
   ```
   （開発時は ngrok等でローカルを公開）

4. **選択するイベント**:
   - ✅ Delivered
   - ✅ Opened  
   - ✅ Clicked
   - ✅ Bounced

5. **Test Your Integration** でテスト送信

### ローカル開発でのテスト

1. **ngrokのインストール** (ローカルサーバーを公開)
   ```bash
   npm install -g ngrok
   ngrok http 3000
   ```

2. **テストスクリプトの実行**
   ```bash
   node test-webhook.js
   ```

3. **ログの確認**
   ```bash
   # コンソールでWebhookイベントログを確認
   📧 SendGrid Webhook受信: 4件のイベント
   📨 イベント処理: delivered, opened, clicked, bounced
   ```

## 技術スタック

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-3.5-turbo
- **Email**: SendGrid API
- **Webhook**: SendGrid Event Webhook
- **Deployment**: Vercel推奨

## APIルート

### `/api/generate-email` (POST)
営業メール生成API

**リクエスト:**
```json
{
  "companyName": "株式会社サンプル",
  "contactName": "田中太郎"
}
```

**レスポンス:**
```json
{
  "email": "生成されたメール内容",
  "isDemo": false
}
```

### `/api/send-email` (POST)
メール送信API

**リクエスト:**
```json
{
  "to": "recipient@example.com",
  "subject": "件名",
  "html": "<p>HTMLメール内容</p>"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": "メールが正常に送信されました",
  "demo": false
}
```

## トラブルシューティング

### 認証エラー
- 環境変数が正しく設定されているか確認
- Supabaseの認証設定を確認

### データベースエラー
- テーブルが正しく作成されているか確認
- RLSポリシーが設定されているか確認

### AI メール生成エラー
- `OPENAI_API_KEY`が正しく設定されているか確認
- OpenAI APIクォータが残っているか確認
- API キーの権限設定を確認

### メール送信エラー
- `SENDGRID_API_KEY`が正しく設定されているか確認
- `FROM_EMAIL`が認証済みのメールアドレスか確認
- SendGridのAPIクォータが残っているか確認
- 送信先メールアドレスが有効か確認

### パフォーマンス
- 大量のリードがある場合は、ページネーションの実装を検討
- OpenAI APIのレート制限に注意

## セキュリティ

- 環境変数ファイル（`.env.local`）は絶対にGitにコミットしない
- OpenAI APIキーは適切に管理し、必要以上の権限を与えない
- SendGrid APIキーは適切に管理し、必要な権限のみを設定する
- 本番環境では適切なCORS設定を行う
- メール送信時は適切な入力検証を行う

## デプロイ

### Vercelでのデプロイ手順
1. GitHubリポジトリにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ実行

**環境変数設定例:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
SENDGRID_API_KEY=SG.your-sendgrid-key
FROM_EMAIL=your-verified-sender@example.com
```

## 料金について

### Supabase
- 無料プランで開始可能
- データベース容量：500MB
- 認証ユーザー：50,000人/月

### OpenAI API
- GPT-3.5-turbo: 約$0.002/1000トークン
- 月間使用量に応じた従量課金

### SendGrid
- 無料プランで月間100通まで送信可能
- 有料プランは月間$14.95から（月間40,000通まで）
- 従量課金プランも利用可能

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。 
