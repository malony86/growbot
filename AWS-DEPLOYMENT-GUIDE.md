# 🚀 AWS本番環境デプロイガイド

## 📋 概要
Sales Automator Dashboard のAWS本番環境への安全なデプロイ手順です。

## 🎯 デプロイ方法の選択

### 推奨方法（初心者向け）
**AWS Amplify**: 最も簡単で保守性が高い

### 代替方法
- **Vercel**: Next.js最適化（非AWS）
- **AWS ECS/Fargate**: 上級者向け（コンテナ）

## 🔧 事前準備

### 必要なアカウント
- [x] AWSアカウント
- [x] GitHubアカウント
- [x] Supabaseプロジェクト

### 必要な権限
- [x] AWS IAMアクセス権限
- [x] GitHubリポジトリ作成権限

## 📊 【階層1】AWSサービス設定

### 1.1 Amazon SES設定

#### ステップ1: SESコンソールアクセス
```
https://console.aws.amazon.com/ses/
```

#### ステップ2: 送信者メール認証
1. 左メニュー → "Verified identities"
2. "Create identity" → "Email address"
3. **自分のメールアドレス**を入力
4. 検証メールを確認して認証完了

#### ステップ3: サンドボックス解除申請
1. 左メニュー → "Account dashboard"
2. "Request production access"
3. 申請理由: 「営業支援システムのメール送信」
4. 承認まで: 1-2営業日

### 1.2 IAM設定

#### 新しいIAMユーザー作成（推奨）
```bash
# AWS CLIでの作成
aws iam create-user --user-name sales-automator-production

# SES専用ポリシーをアタッチ
aws iam attach-user-policy \
  --user-name sales-automator-production \
  --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess

# アクセスキーの作成
aws iam create-access-key --user-name sales-automator-production
```

**重要**: アクセスキーは安全に保管してください

## 📊 【階層2】プロジェクト準備

### 2.1 GitHubリポジトリ作成

#### ローカルでの準備
```bash
# プロジェクトディレクトリに移動
cd sales-automator-dashboard

# Git初期化（未実行の場合）
git init

# .gitignoreの確認
echo ".env.local" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".next/" >> .gitignore

# 初回コミット
git add .
git commit -m "feat: Initial commit for AWS deployment"
```

#### GitHubリポジトリ作成
1. GitHub.comにアクセス
2. "New repository"をクリック
3. リポジトリ名: `sales-automator-dashboard`
4. 設定: Private（推奨）

#### リポジトリ連携
```bash
# GitHubリポジトリと連携
git branch -M main
git remote add origin https://github.com/[YOUR_USERNAME]/sales-automator-dashboard.git
git push -u origin main
```

### 2.2 環境変数の準備

#### .env.production テンプレート作成
```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Amazon SES設定
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=your-verified-email@example.com

# OpenAI設定（メール生成用）
OPENAI_API_KEY=your-openai-api-key
```

## 📊 【階層3】AWS Amplifyデプロイ

### 3.1 Amplifyアプリ作成

#### ステップ1: Amplifyコンソール
```
https://console.aws.amazon.com/amplify/
```

#### ステップ2: 新しいアプリの作成
1. "New app" → "Host web app"
2. "GitHub"を選択
3. GitHubアカウントで認証
4. 作成したリポジトリを選択
5. ブランチ: `main`

#### ステップ3: ビルド設定
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

### 3.2 環境変数設定

#### Amplifyでの環境変数設定
1. Amplifyコンソール → アプリを選択
2. 左メニュー → "Environment variables"
3. 以下を追加:

```bash
# Supabaseの設定値を確認してから設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 作成したIAMユーザーのアクセスキー
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# 検証済みメールアドレス
AWS_SES_FROM_EMAIL=your-verified-email@example.com

# OpenAI APIキー
OPENAI_API_KEY=your-openai-api-key
```

### 3.3 初回デプロイ実行

#### 自動デプロイ開始
1. "Save and deploy"をクリック
2. ビルドプロセスを監視
3. 完了まで約5-10分

#### デプロイ完了確認
- 緑色のチェックマークが表示
- 提供されたURLでアクセス可能

## 📊 【階層4】本番環境テスト

### 4.1 アプリケーション動作確認

#### 基本機能テスト
1. **ダッシュボード表示**: URLにアクセスして画面表示確認
2. **CSVアップロード**: サンプルデータでテスト
3. **メール生成**: テンプレート機能の動作確認

### 4.2 メール送信テスト

#### 安全なテスト方法
```bash
# テスト用CSV作成
echo "company_name,contact_name,email,status" > test-production.csv
echo "テスト会社,自分の名前,your-email@example.com,pending" >> test-production.csv
```

#### テスト実行
1. 作成したCSVをアップロード
2. 自分のメールアドレスにメール送信
3. 実際にメールが受信されることを確認

## 🔒 セキュリティ強化

### 必須セキュリティ設定

#### 1. IAM最小権限の原則
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:GetSendQuota",
                "ses:GetSendStatistics"
            ],
            "Resource": "*"
        }
    ]
}
```

#### 2. 環境変数の暗号化
- AWS Amplifyでは自動的に暗号化される
- 機密情報は絶対にコードに含めない

#### 3. 送信制限の設定
- SES送信制限の監視
- 異常な送信量の検知

## 📊 監視・運用

### 運用チェックリスト

#### 日常監視項目
- [ ] メール送信状況（SESコンソール）
- [ ] アプリケーションエラー（Amplifyログ）
- [ ] 送信制限使用量
- [ ] バウンス率・苦情率

#### 月次チェック項目
- [ ] AWS利用料金確認
- [ ] セキュリティ設定見直し
- [ ] 不要なアクセスキー削除

## 💰 費用見積もり

### 月間費用（予想）
- **AWS Amplify**: $1-5（小規模）
- **Amazon SES**: $0.10/1,000通
- **合計**: $2-10/月（通常利用）

### 無料枠（新規アカウント）
- **SES**: 62,000通/月（EC2から送信時）
- **Amplify**: 1,000ビルド分/月

## 🚨 トラブルシューティング

### 一般的な問題と解決策

#### メール送信エラー
1. **認証エラー**: IAM権限を確認
2. **アドレス未検証**: SESでメール認証
3. **送信制限**: 使用量確認・制限解除申請
4. **サンドボックス**: 本番アクセス申請

#### デプロイエラー
1. **ビルドエラー**: ログを確認してエラー修正
2. **環境変数エラー**: 値の設定確認
3. **権限エラー**: IAMロールの確認

## ✅ デプロイ完了チェックリスト

### 必須確認項目
- [ ] GitHubリポジトリ作成完了
- [ ] AWS SESメールアドレス検証完了
- [ ] AWS Amplifyアプリ作成完了
- [ ] 環境変数設定完了
- [ ] 初回デプロイ成功
- [ ] 本番環境でのメール送信テスト完了
- [ ] SSL証明書設定完了
- [ ] 独自ドメイン設定（オプション）

### 推奨追加設定
- [ ] CloudWatch監視設定
- [ ] AWS Budgets設定（費用アラート）
- [ ] バックアップ戦略設定
- [ ] 定期的な運用チェック体制

---

## 📞 サポート・参考資料

### AWS公式ドキュメント
- [AWS Amplify User Guide](https://docs.aws.amazon.com/amplify/)
- [Amazon SES Developer Guide](https://docs.aws.amazon.com/ses/)

### トラブル時の連絡先
- AWS Support（ビジネスプラン以上）
- AWS Community Forums
- Stack Overflow

**🎯 重要**: 本番環境では常にセキュリティを最優先に、段階的にテストを実施してください。 
