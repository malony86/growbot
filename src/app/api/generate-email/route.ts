import { NextRequest, NextResponse } from 'next/server';
import { 
    emailTemplates, 
    generateEmailFromTemplate, 
    getRandomTemplate, 
    getTemplatesByCategory 
} from '@/lib/emailTemplates';

export async function POST(request: NextRequest) {
    try {
        // リクエストボディの取得
        const { 
            companyName, 
            contactName, 
            templateId, 
            category,
            senderName,
            senderEmail,
            senderPhone
        } = await request.json();

        // バリデーション
        if (!companyName || !contactName) {
            return NextResponse.json(
                { error: '会社名と担当者名は必須です' },
                { status: 400 }
            );
        }

        // テンプレートの選択
        let selectedTemplate;
        
        if (templateId) {
            // 指定されたテンプレートIDを使用
            selectedTemplate = emailTemplates.find(template => template.id === templateId);
            if (!selectedTemplate) {
                return NextResponse.json(
                    { error: '指定されたテンプレートが見つかりません' },
                    { status: 404 }
                );
            }
        } else if (category) {
            // カテゴリからランダムに選択
            const templatesInCategory = getTemplatesByCategory(category);
            if (templatesInCategory.length === 0) {
                return NextResponse.json(
                    { error: '指定されたカテゴリのテンプレートが見つかりません' },
                    { status: 404 }
                );
            }
            selectedTemplate = templatesInCategory[Math.floor(Math.random() * templatesInCategory.length)];
        } else {
            // ランダムに選択
            selectedTemplate = getRandomTemplate();
        }

        // メール生成
        const generatedEmail = generateEmailFromTemplate(selectedTemplate, {
            companyName,
            contactName,
            senderName,
            senderEmail,
            senderPhone
        });

        // フォーマットされたメールを作成
        const formattedEmail = `件名: ${generatedEmail.subject}

${generatedEmail.body}`;

        return NextResponse.json({
            email: formattedEmail,
            template: {
                id: selectedTemplate.id,
                name: selectedTemplate.name,
                category: selectedTemplate.category
            },
            isDemo: false
        });

    } catch (error) {
        console.error('Email generation error:', error);

        return NextResponse.json(
            { error: 'メールの生成中にエラーが発生しました' },
            { status: 500 }
        );
    }
}

// OPTIONS リクエストの処理（CORS対応）
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
} 
