import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { leadsApi } from '@/lib/leads';

interface CSVRow {
    company_name: string;
    contact_name: string;
    email: string;
    status: 'pending' | 'sent' | 'in_progress' | 'completed';
}

// デモモードの判定関数（現在はCSVアップロードを常にデモモードで動作）
function getIsDemo() {
    return true; // 一時的にデモモードに固定
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

        // デモモードでの処理
        console.log('📝 デモモード - CSV データを受信:', validLeads);

        // デモモード用のデータを準備（user_idは使用しない）
        const leadsToAdd = validLeads.map(lead => ({
            company_name: lead.company_name,
            contact_name: lead.contact_name,
            email: lead.email,
            status: lead.status,
            email_status: 'pending' as const,
            user_id: 'demo-user' // デモモードでは無視される
        }));

        // デモモード用のBulk追加APIを呼び出し
        const { data, error } = await leadsApi.createBulkLeads(leadsToAdd);

        if (error) {
            console.error('❌ デモモードでの一括追加エラー:', error);
            return NextResponse.json(
                { error: 'デモモードでのデータ追加に失敗しました' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `✅ デモモード: ${validLeads.length}件のリードが正常に追加されました`,
            count: validLeads.length,
            data: data,
            demo: true
        });

    } catch (error) {
        console.error('❌ CSV upload error:', error);
        return NextResponse.json(
            { error: 'アップロード処理中にエラーが発生しました' },
            { status: 500 }
        );
    }
} 
