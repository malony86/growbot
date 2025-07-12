# 📚 本番環境デプロイメントガイド

## 🚀 概要
Sales Automator Dashboard の本番環境デプロイメント手順です。

## 📋 前提条件

### 必要なアカウント・サービス
- [x] GitHubアカウント
- [x] AWSアカウント
- [x] Supabaseプロジェクト（設定済み）

### 準備済みの設定
- [x] Supabaseデータベース
- [x] テンプレートベースのメール生成機能
- [ ] Amazon SES設定（要確認・修正）

## 🔧 Amazon SES 設定手順

### ステップ1: AWS SESの初期設定
1. **AWS SESコンソールにアクセス**
   ```
   https://console.aws.amazon.com/ses/
   ```

2. **メールアドレスの検証**
   - 左メニュー → "Verified identities"
   - "Create identity" をクリック
   - "Email address" を選択
   - `mrtbaba@gmail.com` を入力
   - 検証メールを確認して完了

3. **サンドボックス解除申請（推奨）**
   - 左メニュー → "Account dashboard"
   - "Request production access" をクリック
   - 申請理由を記入（営業メール送信システム）
   - 承認まで1-2営業日

### ステップ2: IAM権限の確認
現在のIAMユーザー `ses-user` に以下の権限を追加：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail",
                "ses:GetSendQuota",
                "ses:GetSendStatistics",
                "ses:ListVerifiedEmailAddresses"
            ],
            "Resource": "*"
        }
    ]
}
```

## 🌐 デプロイメント手順

### ステップ1: GitHubリポジトリ作成

```bash
# プロジェクトディレクトリで実行
cd /Users/bb/Desktop/growbot/sales-automator-dashboard

# Gitリポジトリ初期化
git init

# .gitignoreの確認（重要：.env.localが除外されていることを確認）
echo ".env.local" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".next/" >> .gitignore

# 初回コミット
git add .
git commit -m "Initial commit: Sales Automator Dashboard with template-based email generation"

# GitHubリポジトリと連携（GitHubでリポジトリ作成後）
git branch -M main
git remote add origin https://github.com/[YOUR_USERNAME]/sales-automator-dashboard.git
git push -u origin main
```

### ステップ2: AWS Amplify設定

1. **AWS Amplifyコンソールにアクセス**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **新しいアプリの作成**
   - "New app" → "Host web app"
   - "GitHub" を選択
   - 作成したリポジトリを選択
   - ブランチ: `main`

3. **ビルド設定**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### ステップ3: 環境変数設定

AWS Amplifyの環境変数に以下を設定：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://uqylbtfvhkrfsjmijmnp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeWxidGZ2aGtyZnNqbWlqbW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyODc1MjUsImV4cCI6MjA2Nzg2MzUyNX0.H2o0PwHYREms-WwK3yFGfMgfC24gV4W9POKAV0rpS4E

# Amazon SES設定（新しいIAMユーザーを作成推奨）
AWS_ACCESS_KEY_ID=[NEW_ACCESS_KEY]
AWS_SECRET_ACCESS_KEY=[NEW_SECRET_KEY]
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=mrtbaba@gmail.com

# デモモード（本番では false に設定）
DEMO_MODE=false
```

## 🔒 セキュリティ設定

### 1. 新しいIAMユーザーの作成（推奨）

```bash
# AWS CLIでの作成例
aws iam create-user --user-name ses-production-user

# SES専用ポリシーをアタッチ
aws iam attach-user-policy \
  --user-name ses-production-user \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

# アクセスキーの作成
aws iam create-access-key --user-name ses-production-user
```

### 2. 最小権限の原則
本番環境では、SES送信に必要な最小限の権限のみを付与

## 📊 監視・運用

### 1. メール送信状況の確認
- AWS SESコンソール → "Reputation metrics"
- バウンス率・苦情率の監視

### 2. 送信制限の管理
- 24時間送信制限: 最初は200通/日（サンドボックス）
- レート制限: 1通/秒
- 制限解除申請で大幅に増加可能

### 3. ログ監視
- CloudWatch Logsでエラー監視
- SESイベント発行でより詳細な追跡

## 🚨 トラブルシューティング

### メール送信エラーの一般的な原因

1. **認証エラー**
   - IAM権限の確認
   - アクセスキーの有効性確認

2. **メールアドレス未検証**
   - SESコンソールで送信者アドレスを検証

3. **送信制限に達した**
   - SESコンソールで使用量確認
   - 制限解除申請の検討

4. **サンドボックスモード**
   - 検証済みメールアドレスにのみ送信可能
   - 本番アクセス申請が必要

## 💰 費用見積もり

### AWS Amplify
- 無料枠: 1,000ビルド分/月、15GB転送/月
- 追加料金: $0.01/ビルド分、$0.15/GB転送

### Amazon SES
- 無料枠: 62,000通/月（EC2から送信時）
- 追加料金: $0.10/1,000通

### 月間予想費用
- 小規模運用（1,000通/月）: $1-3
- 中規模運用（10,000通/月）: $5-15

## ✅ デプロイメント チェックリスト

- [ ] GitHubリポジトリ作成・プッシュ
- [ ] AWS SESメールアドレス検証完了
- [ ] AWS SESサンドボックス解除申請（必要に応じて）
- [ ] AWS Amplifyアプリ作成
- [ ] 環境変数設定完了
- [ ] 初回デプロイ成功
- [ ] メール送信テスト完了
- [ ] 独自ドメイン設定（オプション）
- [ ] SSL証明書設定完了

## 📞 サポート

問題が発生した場合の連絡先：
- AWS SESサポート（ビジネスプラン以上）
- AWS Amplifyドキュメント
- Supabaseサポート 
