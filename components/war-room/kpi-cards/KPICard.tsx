/**
 * KPI Card 組件
 * 企業戰情室設計系統 - 關鍵績效指標卡片
 * 
 * 特點：
 * - react-countup 數字滾動動畫
 * - Framer Motion 進場動畫
 * - 掃描線 Cyberpunk 效果
 * - 趨勢指示器
 * - 狀態邊框
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fadeInUp } from '@/lib/animation-variants';

export interface KPICardProps {
    /** 標題 */
    title: string;
    /** 主要數值（支援數字或字串格式，向後兼容） */
    value: number | string;
    /** 單位（如 %、件、萬） */
    unit?: string;
    /** 副標題/次要數值（向後兼容舊 API） */
    subValue?: string;
    /** 變化百分比 */
    change?: number;
    /** 趨勢方向 */
    trend?: 'up' | 'down' | 'stable';
    /** 狀態 */
    status?: 'success' | 'warning' | 'danger' | 'default' | 'info';
    /** 圖示 */
    icon?: React.ReactNode;
    /** 描述文字 */
    description?: string;
    /** 點擊事件 */
    onClick?: () => void;
    /** 是否使用數字動畫 */
    animated?: boolean;
    /** 數字小數位數 */
    decimals?: number;
}

export default function KPICard({
    title,
    value,
    unit = '',
    subValue,
    change,
    trend = 'stable',
    status = 'default',
    icon,
    description,
    onClick,
    animated = true,
    decimals,
}: KPICardProps) {
    // 趨勢圖示
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-4 h-4" />;
            case 'down':
                return <TrendingDown className="w-4 h-4" />;
            default:
                return <Minus className="w-4 h-4" />;
        }
    };

    // 趨勢顏色
    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return 'text-semantic-success';
            case 'down':
                return 'text-semantic-danger';
            default:
                return 'text-text-tertiary';
        }
    };

    // 決定卡片變體
    const getCardVariant = () => {
        switch (status) {
            case 'danger':
                return 'danger';
            case 'success':
                return 'success';
            case 'warning':
                return 'warning';
            default:
                return 'glass';
        }
    };

    // 狀態 Badge 文字
    const getStatusBadge = () => {
        switch (status) {
            case 'success':
                return { text: '達成', variant: 'success' as const };
            case 'warning':
                return { text: '注意', variant: 'warning' as const };
            case 'danger':
                return { text: '警告', variant: 'danger' as const };
            default:
                return null;
        }
    };

    const statusBadge = getStatusBadge();

    // 判斷 value 是否為數字類型
    const isNumericValue = typeof value === 'number';
    const numericValue = isNumericValue ? value : parseFloat(value) || 0;
    const decimalPlaces = decimals ?? (isNumericValue && value % 1 !== 0 ? 1 : 0);

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card
                variant={getCardVariant()}
                clickable={!!onClick}
                onClick={onClick}
                className="relative overflow-hidden group"
            >
                {/* 掃描線效果（Cyberpunk）*/}
                <div className="scanline-effect">
                    <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
                </div>

                {/* 頂部區域 */}
                <div className="flex items-center justify-between pb-4 border-b border-border-default">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 rounded-lg bg-primary-500/20 text-primary-500">
                                {icon}
                            </div>
                        )}
                        <h3 className="text-lg font-heading font-semibold text-text-primary">
                            {title}
                        </h3>
                    </div>
                    {statusBadge && (
                        <Badge variant={statusBadge.variant}>
                            {statusBadge.text}
                        </Badge>
                    )}
                </div>

                {/* 內容區域 */}
                <div className="pt-4">
                    {/* 主要數值 */}
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl md:text-5xl font-mono font-bold text-text-primary tabular-nums">
                            {isNumericValue && animated ? (
                                <CountUp
                                    end={numericValue}
                                    duration={1.5}
                                    separator=","
                                    decimals={decimalPlaces}
                                    preserveValue
                                />
                            ) : (
                                isNumericValue ? numericValue.toLocaleString() : value
                            )}
                        </span>
                        {unit && (
                            <span className="text-xl text-text-secondary font-body">
                                {unit}
                            </span>
                        )}
                        {subValue && (
                            <span className="text-sm text-text-tertiary font-body">
                                {subValue}
                            </span>
                        )}
                    </div>

                    {/* 變化趨勢 */}
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span className="text-sm font-medium">
                                {change > 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                            <span className="text-sm text-text-tertiary ml-1">vs 上週</span>
                        </div>
                    )}

                    {/* 描述 */}
                    {description && (
                        <p className="text-sm text-text-secondary mt-3">{description}</p>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

// 導出類型供外部使用
export type { KPICardProps as KPICardPropsType };
