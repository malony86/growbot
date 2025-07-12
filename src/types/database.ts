export interface Database {
    public: {
        Tables: {
            leads: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at?: string;
                    company_name: string;
                    contact_name: string;
                    email: string;
                    status: 'pending' | 'sent' | 'in_progress' | 'completed';
                    email_status: 'pending' | 'delivered' | 'opened' | 'clicked' | 'bounced';
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                    company_name: string;
                    contact_name: string;
                    email: string;
                    status?: 'pending' | 'sent' | 'in_progress' | 'completed';
                    email_status?: 'pending' | 'delivered' | 'opened' | 'clicked' | 'bounced';
                    user_id?: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                    company_name?: string;
                    contact_name?: string;
                    email?: string;
                    status?: 'pending' | 'sent' | 'in_progress' | 'completed';
                    email_status?: 'pending' | 'delivered' | 'opened' | 'clicked' | 'bounced';
                    user_id?: string;
                };
            };
        };
    };
}

export type Lead = Database['public']['Tables']['leads']['Row'];
export type NewLead = Database['public']['Tables']['leads']['Insert'];
export type UpdateLead = Database['public']['Tables']['leads']['Update'];

// リードステータスの日本語ラベル
export const leadStatusLabels = {
    pending: '未対応',
    sent: '送信済み',
    in_progress: '対応中',
    completed: '完了'
} as const;

// リードステータスの色
export const leadStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-orange-100 text-orange-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
} as const;

// メールステータスの日本語ラベル
export const emailStatusLabels = {
    pending: '未送信',
    delivered: '配信済み',
    opened: '開封済み',
    clicked: 'クリック済み',
    bounced: 'バウンス'
} as const;

// メールステータスの色
export const emailStatusColors = {
    pending: 'bg-gray-100 text-gray-600',
    delivered: 'bg-blue-100 text-blue-800',
    opened: 'bg-green-100 text-green-800',
    clicked: 'bg-purple-100 text-purple-800',
    bounced: 'bg-red-100 text-red-800'
} as const; 
