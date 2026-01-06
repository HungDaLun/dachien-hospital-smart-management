/**
 * OperationalRadarChart 組件
 * 企業戰情室設計系統 - 多維度雷達圖
 * 
 * 特點：
 * - 多維度能力評估
 * - AI 紫光漸層填充
 * - 雙層對比（可選基準線）
 * - 自訂 Tooltip
 */
'use client';

import React from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';

export interface RadarDataPoint {
    /** 維度名稱 */
    dimension: string;
    /** 當前值 (0-100) */
    value: number;
    /** 基準值 (0-100) - 可選 */
    baseline?: number;
    /** 滿分值 */
    fullMark?: number;
}

export interface OperationalRadarChartProps {
    /** 資料 */
    data: RadarDataPoint[];
    /** 標題 */
    title?: string;
    /** 主要數據標籤 */
    dataLabel?: string;
    /** 基準數據標籤 */
    baselineLabel?: string;
    /** 是否顯示基準線 */
    showBaseline?: boolean;
    /** 主要顏色（預設 AI 紫光） */
    primaryColor?: string;
    /** 基準線顏色（預設電光藍） */
    baselineColor?: string;
    /** 高度 */
    height?: number;
}

// 自訂 Tooltip 組件
const CustomTooltip = ({
    active,
    payload
}: {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
        dataKey: string;
    }>;
}) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="glass-tooltip p-3 rounded-lg min-w-[140px]">
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                    <span className="text-xs text-text-secondary">{entry.name}</span>
                    <span
                        className="font-mono font-bold"
                        style={{ color: entry.color }}
                    >
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function OperationalRadarChart({
    data,
    title,
    dataLabel = '當前表現',
    baselineLabel = '基準值',
    showBaseline = false,
    primaryColor = '#A78BFA', // AI 紫光
    baselineColor = '#00D9FF', // 電光藍
    height = 350,
}: OperationalRadarChartProps) {
    // 處理資料格式
    const chartData = data.map(item => ({
        ...item,
        fullMark: item.fullMark || 100,
    }));

    return (
        <div className="w-full">
            {title && (
                <h4 className="text-lg font-heading font-semibold text-text-primary mb-4">
                    {title}
                </h4>
            )}

            <ResponsiveContainer width="100%" height={height}>
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                    {/* 極座標網格 */}
                    <PolarGrid
                        stroke="rgba(255,255,255,0.15)"
                        gridType="polygon"
                    />

                    {/* 維度軸 */}
                    <PolarAngleAxis
                        dataKey="dimension"
                        tick={{
                            fill: '#B4BCD0',
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    />

                    {/* 數值軸 */}
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#6B7280', fontSize: 10 }}
                        axisLine={false}
                    />

                    {/* 基準線（如果啟用） */}
                    {showBaseline && (
                        <Radar
                            name={baselineLabel}
                            dataKey="baseline"
                            stroke={baselineColor}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill={baselineColor}
                            fillOpacity={0.1}
                            animationDuration={1500}
                        />
                    )}

                    {/* 主要資料 */}
                    <Radar
                        name={dataLabel}
                        dataKey="value"
                        stroke={primaryColor}
                        strokeWidth={3}
                        fill={primaryColor}
                        fillOpacity={0.35}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        dot={{
                            fill: primaryColor,
                            stroke: '#0A0E27',
                            strokeWidth: 2,
                            r: 4,
                        }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    {showBaseline && (
                        <Legend
                            wrapperStyle={{
                                paddingTop: '20px',
                            }}
                            formatter={(value) => (
                                <span className="text-sm text-text-secondary">{value}</span>
                            )}
                        />
                    )}
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

// 導出類型
export type { RadarDataPoint as RadarDataPointType, OperationalRadarChartProps as OperationalRadarChartPropsType };
