import { supabase } from './supabase';
import { Lead, NewLead, UpdateLead } from '@/types/database';

// 環境変数チェック関数を修正 - デモモード判定を統一
const isSupabaseConfigured = () => {
    // デモモードが有効な場合はSupabaseを使用しない
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        return false;
    }

    return process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-project-url' &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key';
};

// デモ用のダミーデータ - シンプルで確実な一意IDを生成
let idCounter = 0;
const sessionId = Math.floor(Math.random() * 1000000); // セッション固有のID

// シンプルで確実な一意ID生成
const generateSimpleUniqueId = () => {
    idCounter++;
    return `demo-${sessionId}-${idCounter}`;
};

// 既存のIDとの重複チェック
const ensureUniqueId = (existingLeads: Lead[] = demoLeads) => {
    let id = generateSimpleUniqueId();
    let attempts = 0;
    
    // 万が一の重複チェック
    while (existingLeads.some(lead => lead.id === id) && attempts < 100) {
        attempts++;
        id = generateSimpleUniqueId();
    }
    
    if (attempts >= 100) {
        // 最後の手段として、タイムスタンプを追加
        id = `demo-${sessionId}-${idCounter}-${Date.now()}`;
    }
    
    return id;
};

// デモデータを初期化する関数
const initializeDemoData = (): Lead[] => {
    const tempLeads: Lead[] = [];

    const demoData = [
        {
            company_name: 'サンプル株式会社',
            contact_name: '田中太郎',
            email: 'tanaka@sample.com',
            status: 'pending' as const,
            email_status: 'pending' as const
        },
        {
            company_name: 'テスト商事',
            contact_name: '佐藤花子',
            email: 'sato@test.com',
            status: 'sent' as const,
            email_status: 'delivered' as const
        },
        {
            company_name: 'デモ企業',
            contact_name: '鈴木一郎',
            email: 'suzuki@demo.com',
            status: 'in_progress' as const,
            email_status: 'opened' as const
        },
        {
            company_name: 'サンプル会社',
            contact_name: '田中次郎',
            email: 'tanaka@sample.co.jp',
            status: 'completed' as const,
            email_status: 'clicked' as const
        }
    ];

    demoData.forEach(data => {
        tempLeads.push({
            id: ensureUniqueId(tempLeads),
            created_at: new Date().toISOString(),
            company_name: data.company_name,
            contact_name: data.contact_name,
            email: data.email,
            status: data.status,
            email_status: data.email_status,
            user_id: 'demo-user'
        });
    });

    return tempLeads;
};

const demoLeads: Lead[] = initializeDemoData();

export const leadsApi = {
    // デモデータをリセットする
    resetDemoData() {
        if (!isSupabaseConfigured()) {
            console.log('🔄 デモデータをリセット中...');
            
            // カウンターもリセット
            idCounter = 0;
            
            // 配列を完全にクリア
            demoLeads.length = 0;
            
            // 新しいデータを生成
            const freshData = initializeDemoData();
            demoLeads.push(...freshData);
            
            console.log('✅ デモデータリセット完了:', {
                総件数: demoLeads.length,
                IDサンプル: demoLeads.slice(0, 2).map(l => l.id),
                全ID: demoLeads.map(l => l.id)
            });
        }
    },

    // すべてのリードを取得
    async getLeads(userId?: string): Promise<{ data: Lead[] | null; error: any }> {
        if (!isSupabaseConfigured()) {
            console.log('🔍 デモモード - リード取得前の状態:', {
                総件数: demoLeads.length,
                全ID: demoLeads.map(l => l.id),
                重複チェック: demoLeads.length !== new Set(demoLeads.map(l => l.id)).size
            });

                        // 重複を除去する処理を追加
            const uniqueLeads = demoLeads.filter((lead, index, self) =>
                index === self.findIndex(l => l.id === lead.id)
            );
            
            // 重複が発見された場合は配列を更新
            if (uniqueLeads.length !== demoLeads.length) {
                const duplicateIds = demoLeads.map(l => l.id).filter((id, index, self) => self.indexOf(id) !== index);
                console.log('⚠️ 重複データを検出し、除去しました:', {
                    除去前: demoLeads.length,
                    除去後: uniqueLeads.length,
                    重複件数: demoLeads.length - uniqueLeads.length,
                    重複ID: duplicateIds
                });
                
                // 配列を完全にクリアして再構築
                demoLeads.length = 0;
                demoLeads.push(...uniqueLeads);
                
                console.log('🔧 重複除去後の状態:', {
                    件数: demoLeads.length,
                    全ID: demoLeads.map(l => l.id)
                });
            }

            console.log('📋 デモモード - リード取得:', {
                総件数: demoLeads.length,
                ユーザーID: userId,
                データサンプル: demoLeads.slice(0, 3).map(l => ({ id: l.id, company: l.company_name, email: l.email }))
            });
            return { data: demoLeads, error: null };
        }

        try {
            // 実際のSupabaseクライアントを使用
            const client = supabase as any;
            let query = client.from('leads').select('*');

            if (userId) {
                query = query.eq('user_id', userId);
            }

            query = query.order('created_at', { ascending: false });
            const { data, error } = await query;
            return { data, error };
        } catch (error) {
            console.error('リード取得エラー:', error);
            return { data: null, error };
        }
    },

    // 特定のリードを取得
    async getLead(id: string): Promise<{ data: Lead | null; error: any }> {
        if (!isSupabaseConfigured()) {
            const lead = demoLeads.find(l => l.id === id) || null;
            return { data: lead, error: null };
        }

        try {
            const client = supabase as any;
            const { data, error } = await client
                .from('leads')
                .select('*')
                .eq('id', id)
                .single();

            return { data, error };
        } catch (error) {
            console.error('リード取得エラー:', error);
            return { data: null, error };
        }
    },

    // 新しいリードを作成
    async createLead(lead: NewLead): Promise<{ data: Lead | null; error: any }> {
        if (!isSupabaseConfigured()) {
            // メールアドレスの重複チェック
            const existingLead = demoLeads.find(l => l.email === lead.email);
            if (existingLead) {
                return { data: null, error: new Error('このメールアドレスは既に登録されています') };
            }

            const newLead: Lead = {
                id: ensureUniqueId(),
                created_at: new Date().toISOString(),
                company_name: lead.company_name,
                contact_name: lead.contact_name,
                email: lead.email,
                status: lead.status || 'pending',
                email_status: lead.email_status || 'pending',
                user_id: lead.user_id || 'demo-user'
            };
            demoLeads.unshift(newLead);
            return { data: newLead, error: null };
        }

        try {
            const client = supabase as any;
            const { data, error } = await client
                .from('leads')
                .insert([lead])
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.error('リード作成エラー:', error);
            return { data: null, error };
        }
    },

    // リードを更新
    async updateLead(id: string, updates: UpdateLead): Promise<{ data: Lead | null; error: any }> {
        if (!isSupabaseConfigured()) {
            const leadIndex = demoLeads.findIndex(l => l.id === id);
            if (leadIndex !== -1) {
                demoLeads[leadIndex] = { ...demoLeads[leadIndex], ...updates };
                return { data: demoLeads[leadIndex], error: null };
            }
            return { data: null, error: new Error('リードが見つかりません') };
        }

        try {
            const client = supabase as any;
            const { data, error } = await client
                .from('leads')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            return { data, error };
        } catch (error) {
            console.error('リード更新エラー:', error);
            return { data: null, error };
        }
    },

    // リードを削除
    async deleteLead(id: string): Promise<{ error: any }> {
        if (!isSupabaseConfigured()) {
            const leadIndex = demoLeads.findIndex(l => l.id === id);
            if (leadIndex !== -1) {
                demoLeads.splice(leadIndex, 1);
                return { error: null };
            }
            return { error: new Error('リードが見つかりません') };
        }

        try {
            const client = supabase as any;
            const { error } = await client
                .from('leads')
                .delete()
                .eq('id', id);

            return { error };
        } catch (error) {
            console.error('リード削除エラー:', error);
            return { error };
        }
    },

    // ステータス別のリード数を取得
    async getLeadStats(userId?: string): Promise<{ data: any; error: any }> {
        if (!isSupabaseConfigured()) {
            const stats = demoLeads.reduce((acc, lead) => {
                acc[lead.status] = (acc[lead.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            return { data: stats, error: null };
        }

        try {
            const client = supabase as any;
            let query = client.from('leads').select('status');

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query;

            if (error) return { data: null, error };

            const stats = data?.reduce((acc: any, lead: any) => {
                acc[lead.status] = (acc[lead.status] || 0) + 1;
                return acc;
            }, {});

            return { data: stats, error: null };
        } catch (error) {
            console.error('統計取得エラー:', error);
            return { data: null, error };
        }
    },

    // CSV一括追加（デモモード用）
    async createBulkLeads(leads: NewLead[]): Promise<{ data: Lead[] | null; error: any }> {
        if (!isSupabaseConfigured()) {
            console.log('📤 デモモード - 一括追加開始:', {
                追加前の件数: demoLeads.length,
                追加予定件数: leads.length
            });

            const newLeads: Lead[] = [];
            const skippedEmails: string[] = [];

            for (const lead of leads) {
                // メールアドレスの重複チェック
                const existingLead = demoLeads.find(l => l.email === lead.email);
                if (existingLead) {
                    skippedEmails.push(lead.email);
                    continue;
                }

                const newLead: Lead = {
                    id: ensureUniqueId([...demoLeads, ...newLeads]),
                    created_at: new Date().toISOString(),
                    company_name: lead.company_name,
                    contact_name: lead.contact_name,
                    email: lead.email,
                    status: lead.status || 'pending',
                    email_status: lead.email_status || 'pending',
                    user_id: lead.user_id || 'demo-user'
                };
                newLeads.push(newLead);
                demoLeads.unshift(newLead);
            }

            if (skippedEmails.length > 0) {
                console.log('⚠️ 重複のため追加をスキップしたメールアドレス:', skippedEmails);
            }

            console.log('✅ デモモード - 一括追加完了:', {
                追加後の件数: demoLeads.length,
                実際に追加した件数: newLeads.length,
                追加されたデータサンプル: newLeads.slice(0, 3).map(l => ({ id: l.id, company: l.company_name, email: l.email }))
            });

            return { data: newLeads, error: null };
        }

        try {
            const client = supabase as any;
            const { data, error } = await client
                .from('leads')
                .insert(leads)
                .select();

            return { data, error };
        } catch (error) {
            console.error('一括追加エラー:', error);
            return { data: null, error };
        }
    }
}; 
