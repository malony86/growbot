// メールテンプレートの型定義
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: 'business' | 'friendly' | 'formal' | 'brief';
}

// テンプレート変数の置換
export const replaceTemplateVariables = (template: string, variables: { [key: string]: string }): string => {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
};

// メールテンプレート集
export const emailTemplates: EmailTemplate[] = [
    {
        id: 'business-introduction',
        name: 'ビジネス紹介（標準）',
        category: 'business',
        subject: '営業効率化ツール「Sales Automator Dashboard」のご紹介',
        body: `{{contactName}}様

お疲れ様です。
Sales Automator Dashboardの{{senderName}}と申します。

{{companyName}}様の営業活動の効率化に貢献できるソリューションをご紹介させていただきたく、ご連絡いたしました。

弊社の営業支援ツールは、以下の特徴があります：
・リード管理の自動化
・営業メールの効率的な送信
・営業成果の可視化

{{companyName}}様の売上向上に貢献できると確信しております。
15分程度のお時間をいただけますでしょうか。

何かご質問がございましたら、お気軽にお声かけください。

よろしくお願いいたします。

{{senderName}}
Sales Automator Dashboard
{{senderEmail}}
{{senderPhone}}`
    },
    {
        id: 'friendly-approach',
        name: '親しみやすいアプローチ',
        category: 'friendly',
        subject: '{{companyName}}様の営業チーム応援します！',
        body: `{{contactName}}様

こんにちは！
Sales Automator Dashboardの{{senderName}}です。

{{companyName}}様の営業活動、いつも頑張っていらっしゃいますね！

実は、営業チームの負担を軽減し、成果を最大化するツールをご紹介したくて連絡させていただきました。

✨ 主な機能：
・顧客管理が楽々
・メール送信の自動化
・売上分析でデータドリブン営業

{{companyName}}様のような成長企業にピッタリだと思います。
コーヒーでも飲みながら、10分だけお話しできませんか？

お忙しい中恐縮ですが、ご検討いただければ嬉しいです。

{{senderName}}
Sales Automator Dashboard
{{senderEmail}}`
    },
    {
        id: 'formal-proposal',
        name: 'フォーマルな提案',
        category: 'formal',
        subject: '【提案】{{companyName}}様向け営業支援ツールについて',
        body: `{{contactName}}様

いつもお世話になっております。
Sales Automator Dashboard担当の{{senderName}}でございます。

この度、{{companyName}}様の営業活動の更なる効率化に貢献できるソリューションをご提案させていただきたく、ご連絡申し上げました。

【ご提案内容】
・営業プロセスの自動化による工数削減
・データドリブンな営業戦略の実現
・顧客情報の一元管理による機会損失防止

{{companyName}}様の事業成長に寄与できるよう、詳細なご説明の機会をいただけますでしょうか。

ご都合の良い日時をお聞かせいただけますと幸いです。

何卒よろしくお願い申し上げます。

{{senderName}}
Sales Automator Dashboard
{{senderEmail}}
{{senderPhone}}`
    },
    {
        id: 'brief-efficient',
        name: '簡潔・効率重視',
        category: 'brief',
        subject: '営業効率2倍UP！{{companyName}}様向けツール',
        body: `{{contactName}}様

{{senderName}}（Sales Automator Dashboard）です。

{{companyName}}様の営業効率を2倍にアップするツールをご紹介します。

🚀 効果：
・営業時間50%削減
・成約率30%向上
・売上管理の自動化

10分の説明で全てご理解いただけます。
来週、お時間いただけませんか？

{{senderName}}
{{senderEmail}}
{{senderPhone}}`
    },
    {
        id: 'problem-solving',
        name: '課題解決型',
        category: 'business',
        subject: '{{companyName}}様の営業課題、解決できます',
        body: `{{contactName}}様

Sales Automator Dashboardの{{senderName}}です。

営業チームの皆様、こんな悩みはございませんか？

❌ 顧客情報の管理が大変
❌ 営業メールの作成に時間がかかる
❌ 売上の進捗が見えづらい

これらの課題、全て解決できます。

{{companyName}}様の営業チームが本来の営業活動に集中できるよう、弊社ツールがサポートいたします。

実際の効果をデモでお見せできますので、ぜひ一度お話しさせてください。

{{senderName}}
Sales Automator Dashboard
{{senderEmail}}`
    }
];

// ランダムにテンプレートを選択
export const getRandomTemplate = (): EmailTemplate => {
    const randomIndex = Math.floor(Math.random() * emailTemplates.length);
    return emailTemplates[randomIndex];
};

// カテゴリでテンプレートを絞り込み
export const getTemplatesByCategory = (category: EmailTemplate['category']): EmailTemplate[] => {
    return emailTemplates.filter(template => template.category === category);
};

// メール生成関数
export const generateEmailFromTemplate = (
    template: EmailTemplate,
    variables: {
        companyName: string;
        contactName: string;
        senderName?: string;
        senderEmail?: string;
        senderPhone?: string;
    }
): { subject: string; body: string } => {
    const defaultVariables = {
        senderName: '田中太郎',
        senderEmail: 'tanaka@sales-automator.com',
        senderPhone: '03-1234-5678',
        ...variables
    };

    return {
        subject: replaceTemplateVariables(template.subject, defaultVariables),
        body: replaceTemplateVariables(template.body, defaultVariables)
    };
}; 
