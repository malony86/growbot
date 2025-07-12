import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 静的エクスポート用の設定
export const dynamic = 'force-static';

// Amazon SES SNS通知イベントの型定義
interface SESNotification {
    Type: string;
    MessageId: string;
    TopicArn: string;
    Subject?: string;
    Message: string;
    Timestamp: string;
    SignatureVersion: string;
    Signature: string;
    SigningCertURL: string;
    UnsubscribeURL: string;
    SubscribeURL?: string;
}

// SES配信通知の型定義
interface SESDeliveryNotification {
    notificationType: 'Delivery' | 'Bounce' | 'Complaint';
    mail: {
        timestamp: string;
        source: string;
        messageId: string;
        destination: string[];
    };
    delivery?: {
        timestamp: string;
        processingTimeMillis: number;
        recipients: string[];
    };
    bounce?: {
        bounceType: string;
        bounceSubType: string;
        bouncedRecipients: Array<{
            emailAddress: string;
            status: string;
            diagnosticCode?: string;
        }>;
    };
    complaint?: {
        complainedRecipients: Array<{
            emailAddress: string;
        }>;
    };
}

// Supabaseクライアントを安全に作成する関数
function createSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey ||
        supabaseUrl === 'your-project-url' ||
        supabaseKey === 'your-anon-key') {
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
}

// リードのステータスを更新する関数
async function updateLeadStatus(email: string, status: string, details?: any) {
    const supabase = createSupabaseClient();
    if (!supabase) {
        console.log('Supabaseクライアントが作成できません（デモモード）');
        return { success: false, error: 'デモモード' };
    }

    try {
        const { data, error } = await supabase
            .from('leads')
            .update({
                status: status,
                email_status: status,
                updated_at: new Date().toISOString(),
                notes: details ? JSON.stringify(details) : null
            })
            .eq('email', email)
            .select();

        if (error) {
            console.error('ステータス更新エラー:', error);
            return { success: false, error: error.message };
        }

        console.log(`✓ ${email} のステータスを「${status}」に更新しました`);
        return { success: true, updatedRows: data?.length || 0 };
    } catch (error) {
        console.error('ステータス更新中にエラー:', error);
        return { success: false, error: 'データベース更新エラー' };
    }
}

// SES通知を処理する関数
async function processSESNotification(notification: SESDeliveryNotification) {
    const { notificationType, mail } = notification;

    for (const recipient of mail.destination) {
        switch (notificationType) {
            case 'Delivery':
                await updateLeadStatus(recipient, 'delivered', {
                    deliveredAt: notification.delivery?.timestamp,
                    processingTime: notification.delivery?.processingTimeMillis
                });
                break;

            case 'Bounce':
                await updateLeadStatus(recipient, 'bounced', {
                    bounceType: notification.bounce?.bounceType,
                    bounceSubType: notification.bounce?.bounceSubType,
                    diagnosticCode: notification.bounce?.bouncedRecipients?.[0]?.diagnosticCode
                });
                break;

            case 'Complaint':
                await updateLeadStatus(recipient, 'complained', {
                    complainedAt: new Date().toISOString()
                });
                break;
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const snsNotification: SESNotification = await request.json();

        console.log(`📧 Amazon SES SNS通知受信: ${snsNotification.Type}`);

        // SNSサブスクリプション確認の場合
        if (snsNotification.Type === 'SubscriptionConfirmation') {
            console.log('🔔 SNSサブスクリプション確認');
            return NextResponse.json({
                success: true,
                message: 'SNS subscription confirmation received',
                subscribeURL: snsNotification.SubscribeURL
            });
        }

        // 実際の通知の場合
        if (snsNotification.Type === 'Notification') {
            const message = JSON.parse(snsNotification.Message) as SESDeliveryNotification;
            await processSESNotification(message);

            console.log(`✓ SES通知処理完了: ${message.notificationType}`);

            return NextResponse.json({
                success: true,
                message: `SES ${message.notificationType} notification processed`,
                processedCount: message.mail.destination.length
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Unknown notification type'
        });

    } catch (error) {
        console.error('❌ SES Webhook処理エラー:', error);
        return NextResponse.json(
            { error: 'SES webhook processing failed' },
            { status: 500 }
        );
    }
}

export async function GET() {
    // Amazon SES SNS Webhookはヘルスチェック用のGETリクエストも送信する場合があります
    console.log('📡 Amazon SES SNS Webhook ヘルスチェック');

    return NextResponse.json({
        status: 'healthy',
        service: 'Amazon SES SNS Webhook',
        timestamp: new Date().toISOString(),
        message: 'Amazon SES SNS Webhook endpoint is ready',
    });
} 
