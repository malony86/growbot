'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const KPIChart: React.FC = () => {
    // 一時的なダミーデータ
    const totalSent = 425;
    const avgOpenRate = "45.2";
    const avgReplyRate = "12.8";

    // 過去15日間のダミーデータ
    const chartData = useMemo(() => {
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);

        for (let i = 0; i < 15; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            // 滑らかな波状データを生成
            const openRate = 30 + 20 * Math.sin(i * 0.5) + Math.random() * 8;
            const replyRate = 8 + 6 * Math.sin(i * 0.3 + 1) + Math.random() * 3;
            const sentEmails = 20 + 15 * Math.sin(i * 0.4) + Math.random() * 10;

            data.push({
                date: date.toLocaleDateString('ja-JP', {
                    month: 'short',
                    day: 'numeric'
                }),
                開封率: Math.max(0, Math.min(100, openRate)).toFixed(1),
                返信率: Math.max(0, Math.min(100, replyRate)).toFixed(1),
                送信数: Math.round(sentEmails)
            });
        }
        return data;
    }, []);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: {entry.value}
                            {entry.name.includes('率') ? '%' : '件'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            {/* KPIサマリー */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">総送信数</p>
                            <p className="text-2xl font-bold text-blue-900">{totalSent.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600">平均開封率</p>
                            <p className="text-2xl font-bold text-green-900">{avgOpenRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-yellow-600">平均返信率</p>
                            <p className="text-2xl font-bold text-yellow-900">{avgReplyRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* メインチャート - 開封率と返信率の推移 */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">開封率・返信率の推移 (過去15日間)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="colorReply" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                stroke="#6B7280"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="#6B7280"
                                domain={[0, 100]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="開封率"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorOpen)"
                                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#3B82F6' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="返信率"
                                stroke="#10B981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorReply)"
                                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#10B981' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 送信数の推移 */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">送信数の推移 (過去15日間)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                stroke="#6B7280"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="#6B7280"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="送信数"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#8B5CF6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* デモモード表示 */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                    <span className="font-semibold">デモモード:</span>
                    実際のデータは、Amazon SESのSNS通知やメール開封・クリック追跡機能を使用して収集できます。
                </p>
            </div>
        </div>
    );
};

export default KPIChart; 
