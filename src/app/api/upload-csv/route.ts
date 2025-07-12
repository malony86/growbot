import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { leadsApi } from '@/lib/leads';

interface CSVRow {
    company_name: string;
    contact_name: string;
    email: string;
    status: 'pending' | 'sent' | 'in_progress' | 'completed';
}

// デモモードの判定関数
function getIsDemo() {
    return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-project-url' ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'ファイルが選択されていません' },
                { status: 400 }
            );
        }

        // CSVファイル形式の確認
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            return NextResponse.json(
                { error: 'CSVファイルを選択してください' },
                { status: 400 }
            );
        }

        // ファイル内容を読み取り
        const text = await file.text();

        // papaparseでCSVを解析
        const parseResult = Papa.parse<any>(text, {
            header: true,
            skipEmptyLines: true,
            transform: (value) => value.trim(),
        });

        if (parseResult.errors.length > 0) {
            return NextResponse.json(
                { error: 'CSVファイルの解析に失敗しました: ' + parseResult.errors[0].message },
                { status: 400 }
            );
        }

        // データの検証と変換
        const validLeads: CSVRow[] = [];
        const errors: string[] = [];

        parseResult.data.forEach((row, index) => {
            const lineNumber = index + 2; // ヘッダー行を考慮

            // 必須フィールドの確認
            if (!row.company_name || !row.contact_name || !row.email) {
                errors.push(`行${lineNumber}: 会社名、担当者名、メールアドレスは必須です`);
                return;
            }

            // メールアドレスの形式チェック
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
                errors.push(`行${lineNumber}: メールアドレスの形式が正しくありません`);
                return;
            }

            // ステータスの検証
            const validStatuses = ['pending', 'sent', 'in_progress', 'completed'];
            let status = 'pending';
            if (row.status && validStatuses.includes(row.status)) {
                status = row.status;
            }

            validLeads.push({
                company_name: row.company_name,
                contact_name: row.contact_name,
                email: row.email,
                status: status as 'pending' | 'sent' | 'in_progress' | 'completed',
            });
        });

        // エラーがある場合は早期リターン
        if (errors.length > 0) {
            return NextResponse.json(
                { error: 'データに問題があります:\n' + errors.join('\n') },
                { status: 400 }
            );
        }

        // 有効なデータがない場合
        if (validLeads.length === 0) {
            return NextResponse.json(
                { error: '有効なデータが見つかりませんでした' },
                { status: 400 }
            );
        }

        // デモモード判定
        const isDemo = getIsDemo();

        if (isDemo) {
            // デモモードでの処理
            console.log('📝 デモモード - CSV データを受信:', validLeads);

            // デモモードでは実際のデータベースには保存せず、成功レスポンスのみ返す
            const demoData = validLeads.map((lead, index) => ({
                id: `demo-${Date.now()}-${index}`,
                created_at: new Date().toISOString(),
                company_name: lead.company_name,
                contact_name: lead.contact_name,
                email: lead.email,
                status: lead.status,
                email_status: 'pending' as const,
                user_id: 'demo-user'
            }));

            console.log('✅ デモモード: CSVデータを処理完了');

            return NextResponse.json({
                success: true,
                message: `✅ デモモード: ${validLeads.length}件のリードが正常に追加されました`,
                count: validLeads.length,
                data: demoData,
                demo: true
            });
        } else {
            // 本番モードでの処理
            console.log('📝 本番モード - CSV データを受信:', validLeads);

            // 本番モード用のデータを準備
            const leadsToAdd = validLeads.map(lead => ({
                company_name: lead.company_name,
                contact_name: lead.contact_name,
                email: lead.email,
                status: lead.status,
                email_status: 'pending' as const,
                user_id: 'actual-user-id' // 本番では実際のユーザーIDを使用
            }));

            // 本番モード用のBulk追加APIを呼び出し
            const { data, error } = await leadsApi.createBulkLeads(leadsToAdd);

            if (error) {
                console.error('❌ 本番モードでの一括追加エラー:', error);
                return NextResponse.json(
                    { error: '本番モードでのデータ追加に失敗しました' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: `✅ 本番モード: ${validLeads.length}件のリードが正常に追加されました`,
                count: validLeads.length,
                data: data,
                demo: false
            });
        }

    } catch (error) {
        console.error('❌ CSV upload error:', error);
        return NextResponse.json(
            { error: 'アップロード処理中にエラーが発生しました' },
            { status: 500 }
        );
    }
} 
