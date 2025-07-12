'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface KPIData {
    date: string;
    sent: number;
    openRate: number;
    replyRate: number;
}

// ダミーデータ生成
const generateDummyData = (): KPIData[] => {
    const data: KPIData[] = [];
    const today = new Date();

    for (let i = 14; i >= 0; i--) {
        const date = subDays(today, i);
        const sent = Math.floor(Math.random() * 50) + 10; // 10-60通
        const openRate = Math.floor(Math.random() * 40) + 20; // 20-60%
        const replyRate = Math.floor(Math.random() * 15) + 5; // 5-20%

        data.push({
            date: format(date, 'M/d'),
            sent,
            openRate,
            replyRate,
        });
    }

    return data;
};

const KPIChart: React.FC = () => {
    const kpiData = generateDummyData();

    const data = {
        labels: kpiData.map(item => item.date),
        datasets: [
            {
                label: '送信数',
                data: kpiData.map(item => item.sent),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: '開封率 (%)',
                data: kpiData.map(item => item.openRate),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                yAxisID: 'y1',
            },
            {
                label: '返信率 (%)',
                data: kpiData.map(item => item.replyRate),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                yAxisID: 'y1',
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'KPI推移 (過去15日間)',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: '日付',
                },
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: '送信数',
                },
                beginAtZero: true,
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: {
                    display: true,
                    text: '率 (%)',
                },
                beginAtZero: true,
                max: 100,
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    // KPIサマリー計算
    const totalSent = kpiData.reduce((sum, item) => sum + item.sent, 0);
    const avgOpenRate = (kpiData.reduce((sum, item) => sum + item.openRate, 0) / kpiData.length).toFixed(1);
    const avgReplyRate = (kpiData.reduce((sum, item) => sum + item.replyRate, 0) / kpiData.length).toFixed(1);

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

            {/* 折れ線グラフ */}
            <div className="h-96 w-full">
                <Line options={options} data={data} />
            </div>

            {/* デモモード表示 */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                    <span className="font-semibold">デモモード:</span>
                    実際のデータは、Amazon SESのSNS通知やメール開封・クリック追跡機能を使用して収集できます。
                </p>
            </div>
        </div>
    );
};

export default KPIChart; 
