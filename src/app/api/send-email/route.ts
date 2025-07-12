import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, isDemoMode, isGmailMode, isMailtrapMode, isCustomSMTPMode, isAwsMode, getCurrentMode } from '@/lib/ses';
import { createClient } from '@supabase/supabase-js';

// 静的エクスポート用の設定
export const dynamic = 'force-static';

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

// リードのステータスを「sent」に更新する関数
async function updateLeadStatusToSent(email: string) {
    if (isDemoMode) {
        console.log(`デモモード: ${email} のステータスを「sent」に更新`);
        return { success: true, demo: true };
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
        console.log('Supabaseクライアントが作成できません');
        return { success: false, error: 'データベース接続エラー' };
    }

    try {
        const { data, error } = await supabase
            .from('leads')
            .update({
                status: 'sent',
                updated_at: new Date().toISOString()
            })
            .eq('email', email)
            .select();

        if (error) {
            console.error('ステータス更新エラー:', error);
            return { success: false, error: error.message };
        }

        if (data && data.length > 0) {
            console.log(`✓ ${email} のステータスを「sent」に更新しました`);
            return { success: true, updatedRows: data.length };
        } else {
            console.log(`⚠ メールアドレス ${email} に一致するリードが見つかりませんでした`);
            return { success: true, updatedRows: 0 };
        }
    } catch (error) {
        console.error('ステータス更新中にエラー:', error);
        return { success: false, error: 'データベース更新エラー' };
    }
}

export async function POST(request: NextRequest) {
    try {
        const { to, subject, html } = await request.json();

        // リクエストボディの検証
        if (!to || !subject || !html) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, html' },
                { status: 400 }
            );
        }

        // メールアドレスの形式チェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return NextResponse.json(
                { error: 'Invalid email address format' },
                { status: 400 }
            );
        }

        // 現在のモードを取得
        const currentMode = getCurrentMode();

        // デモモードの場合
        if (isDemoMode) {
            console.log('Demo mode - Email not sent:', { to, subject });
            // デモモードでもステータス更新をシミュレート
            const statusUpdate = await updateLeadStatusToSent(to);
            return NextResponse.json({
                success: true,
                message: 'デモモード: メールは送信されませんでした',
                demo: true,
                mode: currentMode,
                statusUpdate: statusUpdate
            });
        }

        // メール送信
        console.log(`📧 メール送信開始 (${currentMode}):`, to);

        await sendEmail({
            to,
            subject,
            html,
        });

        console.log(`📧 メール送信成功 (${currentMode}): ${to}`);

        // メール送信成功後、ステータスを「sent」に更新
        const statusUpdate = await updateLeadStatusToSent(to);

        if (!statusUpdate.success) {
            console.error('ステータス更新に失敗しました:', statusUpdate.error);
            // メール送信は成功したが、ステータス更新に失敗した場合でも成功として扱う
        }

        return NextResponse.json({
            success: true,
            message: `メールが正常に送信されました (${currentMode})`,
            demo: false,
            mode: currentMode,
            statusUpdate: statusUpdate
        });

    } catch (error) {
        console.error('Error sending email:', error);

        // エラーの種類に応じて適切なレスポンスを返す
        if (error instanceof Error) {
            if (error.message.includes('AWS credentials')) {
                return NextResponse.json(
                    { error: 'AWS credentials are not configured' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: `メール送信エラー: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'メール送信中に予期しないエラーが発生しました' },
            { status: 500 }
        );
    }
} 
