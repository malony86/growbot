import OpenAI from 'openai';

// OpenAI APIキーの確認
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey && typeof window === 'undefined') {
    console.warn('OPENAI_API_KEY is not set. Email generation will not work.');
}

// OpenAIクライアントの初期化
export const openai = new OpenAI({
    apiKey: apiKey || 'demo-key', // デモ用のダミーキー
});

// 営業メール生成のプロンプト
export const generateSalesEmailPrompt = (companyName: string, contactName: string) => {
    return `あなたは経験豊富な営業担当者です。以下の情報を基に、親しみやすく簡潔で効果的な営業メールを作成してください。

【対象情報】
会社名: ${companyName}
担当者名: ${contactName}

【メールの要件】
- 件名を含む完全なメール形式
- 親しみやすく、かつプロフェッショナルなトーン
- 簡潔で読みやすい（200文字程度）
- Sales Automator Dashboardという営業支援ツールの紹介
- アポイントメント取得を目的とした内容
- 日本語で作成

【出力形式】
件名: [ここに件名]

${contactName}様

[ここにメール本文]

何かご質問がございましたら、お気軽にお声かけください。

よろしくお願いいたします。

営業担当
田中太郎`;
};

// APIが利用可能かチェック
export const isOpenAIAvailable = () => {
    return !!apiKey && apiKey !== 'demo-key';
}; 
