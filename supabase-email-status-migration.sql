-- SendGrid Webhookイベント追跡のためのemail_statusカラムを追加
-- Supabaseのテーブルエディタまたは SQL エディタで実行してください

-- 1. email_statusカラムを追加
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'pending';

-- 2. email_statusの制約を追加（有効な値のみ許可）
ALTER TABLE leads 
ADD CONSTRAINT valid_email_status 
CHECK (email_status IN ('pending', 'delivered', 'opened', 'clicked', 'bounced'));

-- 3. updated_atカラムを追加（まだ存在しない場合）
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. updated_atカラムの自動更新トリガーを作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. トリガーを作成（既存の場合は置き換え）
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 既存のリードにデフォルト値を設定
UPDATE leads 
SET email_status = 'pending' 
WHERE email_status IS NULL;

-- 7. インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_leads_email_status ON leads(email_status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- 実行後の確認
-- SELECT * FROM leads LIMIT 5; 
