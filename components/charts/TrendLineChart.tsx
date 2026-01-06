/**
 * TrendLineChart 組件
 * 企業戰情室設計系統 - 趨勢折線圖
 * 
 * 特點：
 * - 電光藍漸層填充
 * - 發光資料點
 * - 自動動畫
 * - 自訂 Tooltip
 */
'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

export interface TrendDataPoint {
    /** X 軸標籤 */
    label: string;
    /** 數值 */
    value: number;
    /** 附加資訊（顯示在 Tooltip） */
    info?: string;
}

export interface TrendLineChartProps {
    /** 資料 */
    data: TrendDataPoint[];
    /** 標題 */
    title?: string;
    /** 數值單位 */
    unit?: string;
    /** 線條顏色（預設電光藍） */
    color?: string;
    /** 是否顯示區域填充 */
    showArea?: boolean;
    /** 高度 */
    height?: number;
    /** 是否顯示網格 */
    showGrid?: boolean;
}

// 自訂 Tooltip 組件
const CustomTooltip = ({
    active,
    payload,
    label,
    unit
}: {
    active?: boolean;
    payload?: Array<{ value: number; payload: TrendDataPoint }>;
    label?: string;
    unit?: string;
}) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0];
    return (
        <div className="glass-tooltip p-3 rounded-lg min-w-[120px]">
            <p className="text-xs text-text-tertiary mb-1">{label}</p>
            <p className="text-lg font-mono font-bold text-primary-500">
                {data.value.toLocaleString()}{unit && ` ${unit}`}
            </p>
            {data.payload.info && (
                <p className="text-xs text-text-secondary mt-1">{data.payload.info}</p>
            )}
        </div>
    );
};

export default function TrendLineChart({
    data,
    title,
    unit = '',
    color = '#00D9FF', // 電光藍
    showArea = true,
    height = 300,
    showGrid = true,
}: TrendLineChartProps) {
    // 生成漸層 ID
    const gradientId = `gradient-${color.replace('#', '')}`;

    return (
        <div className="w-full">
            {title && (
                <h4 className="text-lg font-heading font-semibold text-text-primary mb-4">
                    {title}
                </h4>
            )}

            <ResponsiveContainer width="100%" height={height}>
                {showArea ? (
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            {/* 漸層定義 */}
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="50%" stopColor={color} stopOpacity={0.15} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>

                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                                vertical={false}
                            />
                        )}

                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dx={-10}
                            tickFormatter={(value) => value.toLocaleString()}
                        />

                        <Tooltip
                            content={<CustomTooltip unit={unit} />}
                            cursor={{ stroke: color, strokeOpacity: 0.3 }}
                        />

                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            fill={`url(#${gradientId})`}
                            animationDuration={1500}
                            animationEasing="ease-out"
                            dot={{
                                fill: color,
                                stroke: '#0A0E27',
                                strokeWidth: 2,
                                r: 4,
                            }}
                            activeDot={{
                                fill: color,
                                stroke: color,
                                strokeWidth: 4,
                                strokeOpacity: 0.3,
                                r: 6,
                            }}
                        />
                    </AreaChart>
                ) : (
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                                vertical={false}
                            />
                        )}

                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dx={-10}
                            tickFormatter={(value) => value.toLocaleString()}
                        />

                        <Tooltip
                            content={<CustomTooltip unit={unit} />}
                            cursor={{ stroke: color, strokeOpacity: 0.3 }}
                        />

                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            animationDuration={1500}
                            animationEasing="ease-out"
                            dot={{
                                fill: color,
                                stroke: '#0A0E27',
                                strokeWidth: 2,
                                r: 4,
                            }}
                            activeDot={{
                                fill: color,
                                stroke: color,
                                strokeWidth: 4,
                                strokeOpacity: 0.3,
                                r: 6,
                            }}
                        />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}

// 導出類型
export type { TrendDataPoint as TrendDataPointType, TrendLineChartProps as TrendLineChartPropsType };
