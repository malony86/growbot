'use client';

import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';

// Chart.jsの登録
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const KPIChart: React.FC = () => {
    // 一時的なダミーデータ
    const totalSent = 425;
    const avgOpenRate = "45.2";
    const avgReplyRate = "12.8";

    // チャートデータの準備
    const chartData = {
        labels: ['2024/01/01', '2024/01/02', '2024/01/03', '2024/01/04', '2024/01/05', '2024/01/06', '2024/01/07', '2024/01/08', '2024/01/09', '2024/01/10', '2024/01/11', '2024/01/12', '2024/01/13', '2024/01/14', '2024/01/15'],
        datasets: [
            {
                label: '送信数',
                data: [25, 30, 28, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52, 58, 60],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.5,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                fill: true,
                cubicInterpolationMode: 'monotone'
            },
            {
                label: '開封率 (%)',
                data: [42, 45, 48, 46, 49, 52, 50, 54, 53, 56, 55, 58, 57, 60, 59],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.5,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(34, 197, 94)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                fill: true,
                cubicInterpolationMode: 'monotone'
            },
            {
                label: '返信率 (%)',
                data: [10, 12, 11, 13, 14, 15, 13, 16, 15, 17, 16, 18, 17, 19, 18],
                borderColor: 'rgb(234, 179, 8)',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                tension: 0.5,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(234, 179, 8)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                fill: true,
                cubicInterpolationMode: 'monotone'
            }
        ]
    };

    const barData = {
        labels: ['週1', '週2', '週3', '週4'],
        datasets: [
            {
                label: '送信数',
                data: [120, 150, 180, 200],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            },
            {
                label: '開封数',
                data: [60, 75, 90, 105],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1
            },
            {
                label: '返信数',
                data: [15, 18, 22, 25],
                backgroundColor: 'rgba(234, 179, 8, 0.8)',
                borderColor: 'rgb(234, 179, 8)',
                borderWidth: 1
            }
        ]
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'KPI推移 (過去15日間)'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const barOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: '週次パフォーマンス'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
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

            {/* チャートセクション */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* 日次推移チャート */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* 週次パフォーマンス */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
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
