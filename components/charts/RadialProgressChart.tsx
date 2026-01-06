/**
 * RadialProgressChart 組件
 * 企業戰情室設計系統 - 環形進度圖
 * 
 * 特點：
 * - 圓形進度指示
 * - 中心顯示數值
 * - 顏色隨進度變化
 * - 動畫效果
 */
'use client';

import React from 'react';
import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export interface RadialProgressChartProps {
    /** 進度值 (0-100) */
    value: number;
    /** 標籤 */
    label?: string;
    /** 單位 */
    unit?: string;
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg';
    /** 是否自動著色（根據進度） */
    autoColor?: boolean;
    /** 自訂顏色 */
    color?: string;
    /** 背景顏色 */
    backgroundColor?: string;
    /** 是否顯示標籤 */
    showLabel?: boolean;
}

// 尺寸配置
const sizeConfig = {
    sm: { height: 120, innerRadius: 35, outerRadius: 50, fontSize: 'text-xl' },
    md: { height: 180, innerRadius: 55, outerRadius: 75, fontSize: 'text-3xl' },
    lg: { height: 240, innerRadius: 75, outerRadius: 100, fontSize: 'text-4xl' },
};

// 根據進度獲取顏色
const getAutoColor = (value: number): string => {
    if (value >= 80) return '#00FF88'; // 翠綠
    if (value >= 60) return '#00D9FF'; // 電光藍
    if (value >= 40) return '#FFB800'; // 琥珀黃
    return '#FF3366'; // 霓虹紅
};

export default function RadialProgressChart({
    value,
    label,
    unit = '%',
    size = 'md',
    autoColor = true,
    color,
    backgroundColor = 'rgba(255,255,255,0.1)',
    showLabel = true,
}: RadialProgressChartProps) {
    const config = sizeConfig[size];

    // 確保值在 0-100 範圍
    const normalizedValue = Math.min(100, Math.max(0, value));

    // 決定顏色
    const fillColor = color || (autoColor ? getAutoColor(normalizedValue) : '#00D9FF');

    // 圖表資料
    const data = [
        { name: 'progress', value: normalizedValue, fill: fillColor },
    ];

    return (
        <div className="relative" style={{ height: config.height, width: config.height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius={config.innerRadius}
                    outerRadius={config.outerRadius}
                    barSize={10}
                    data={data}
                    startAngle={90}
                    endAngle={-270}
                >
                    {/* 背景圓環 */}
                    <RadialBar
                        dataKey="value"
                        background={{ fill: backgroundColor }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                    >
                        <Cell fill={fillColor} />
                    </RadialBar>
                </RadialBarChart>
            </ResponsiveContainer>

            {/* 中心數值 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className={`font-mono font-bold ${config.fontSize}`}
                    style={{ color: fillColor }}
                >
                    {normalizedValue}
                    <span className="text-sm text-text-tertiary font-normal">{unit}</span>
                </span>
                {showLabel && label && (
                    <span className="text-sm text-text-secondary mt-1">{label}</span>
                )}
            </div>
        </div>
    );
}

// 導出類型
export type { RadialProgressChartProps as RadialProgressChartPropsType };
