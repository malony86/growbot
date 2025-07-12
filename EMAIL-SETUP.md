# ローカルメール送信テスト設定ガイド

## 概要
CSVで読み込んだリードデータに対してメール送信テストを行うための設定手順です。

## ⚠️ 重要な注意事項

**Gmail SMTPは個人のGmailアカウント情報が必要です！**
- 個人のGmailアドレスとアプリパスワードが必要
- 個人キーを使いたくない場合は、Mailtrapなどの開発用サービスを推奨

## 設定方法

### 方法1: Mailtrap（推奨・個人キー不要）

開発・テスト専用のメールサービスです。実際にメールは送信されず、Web上で確認できます。

#### 1. Mailtrapアカウント作成
1. [Mailtrap.io](https://mailtrap.io/) でアカウント作成（無料）
2. Inboxを作成
3. SMTP設定を確認

#### 2. 環境変数設定
```bash
# Mailtrap設定（個人キー不要）
MAILTRAP_USER=your-mailtrap-username
MAILTRAP_PASS=your-mailtrap-password
```

#### 3. 特徴
- ✅ 個人キー不要
- ✅ 実際の送信なし（安全）
- ✅ Web上でメール確認可能
- ✅ 無料で月1000通

### 方法2: Gmail SMTP（個人キー必要）

個人のGmailアカウントを使用してメール送信を行います。

#### 1. Gmail設定
1. Gmailアカウントで2段階認証を有効化
2. アプリパスワードを生成
   - Google アカウント設定 > セキュリティ > 2段階認証 > アプリパスワード
   - 「メール」を選択してパスワードを生成

#### 2. 環境変数設定
```bash
# Gmail SMTP設定（個人キー必要）
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password
```

#### 3. 注意点
- ⚠️ 個人Gmailアカウントが必要
- ⚠️ 送信者に個人アドレスが表示
- ⚠️ 1日500通の制限
- ⚠️ 実際にメールが送信される

### 方法3: カスタムSMTP（汎用）

独自のSMTPサーバーを使用する場合の設定です。

#### 環境変数設定
```bash
# カスタムSMTP設定
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### 方法4: AWS SES（本格運用）

本番環境向けの設定です。

#### 1. AWS設定
1. AWS アカウントでSESを設定
2. 送信者メールアドレスの認証
3. IAMユーザーでSES権限設定

#### 2. 環境変数設定
```bash
# AWS SES設定
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

## 使用方法

### 1. 依存関係のインストール
```bash
npm install
```

### 2. アプリケーション起動
```bash
npm run dev
```

### 3. CSVデータアップロード
- ダッシュボードで「CSVアップロード」ボタンをクリック
- 営業リストのCSVファイルをアップロード

### 4. メール送信テスト
- ダッシュボードで「メール生成」ボタンをクリック
- 営業先情報を入力
- メールテンプレートを選択
- 「メール生成」→「メール送信」で実際に送信

## 動作モード

- **デモモード**: 環境変数未設定 → メール送信シミュレート
- **Mailtrapモード**: MAILTRAP_USER設定済み → Mailtrap経由で送信
- **Gmailモード**: GMAIL_USER設定済み → Gmail SMTP経由で送信
- **カスタムSMTPモード**: SMTP_HOST設定済み → カスタムSMTP経由で送信
- **AWSモード**: AWS_ACCESS_KEY_ID設定済み → AWS SES経由で送信

## 推奨設定

### 個人キーを使いたくない場合
```bash
# Mailtrapを使用（推奨）
MAILTRAP_USER=your-mailtrap-username
MAILTRAP_PASS=your-mailtrap-password
```

### 実際の送信テストをしたい場合
```bash
# Gmail SMTPを使用（個人キー必要）
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password
```

## テスト用メール受信

### Mailtrapの場合
1. Mailtrapのダッシュボードで確認
2. 実際のメール送信なし
3. 安全にテスト可能

### Gmail SMTPの場合
1. CSVファイルに自分のメールアドレスを含める
2. 実際にメールが受信されることを確認
3. 注意: 実際にメールが送信される

## 注意事項
- 本番環境では相手の許可を得てからメール送信してください
- テスト時は自分のメールアドレスまたはMailtrapを使用してください
- 個人情報（Gmailアカウント）を使用する場合は十分注意してください

## トラブルシューティング

### Gmail認証エラー
- 2段階認証が有効になっているか確認
- アプリパスワードが正しく設定されているか確認
- 通常のGmailパスワードではなく、アプリパスワードを使用

### Mailtrap接続エラー
- Mailtrapのユーザー名とパスワードが正しいか確認
- Mailtrapのインボックスが有効になっているか確認

### メール送信エラー
- 環境変数が正しく設定されているか確認
- ネットワーク接続を確認
- コンソールログでエラー詳細を確認

## 機能テスト例

### Mailtrapテスト用CSV
```csv
company_name,contact_name,email,status
テスト会社,テスト担当者,test@example.com,pending
サンプル株式会社,田中太郎,sample@example.com,pending
```

### Gmail SMTPテスト用CSV
```csv
company_name,contact_name,email,status
テスト会社,自分の名前,your-email@gmail.com,pending
サンプル株式会社,田中太郎,your-email@gmail.com,pending
```

**推奨**: 個人キーを使いたくない場合は、Mailtrapを使用してください。 
