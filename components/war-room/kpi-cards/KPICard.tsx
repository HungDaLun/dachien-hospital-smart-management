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
import { TrendingUp, TrendingDown, Minus, HelpCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fadeInUp } from '@/lib/animation-variants';

/**
 * 指標說明介面
 */
interface KPIInfo {
    title: string;
    description: string;
    source: string;
    meaning: string;
}

/**
 * 頂部 4 個核心 KPI 的說明配置
 */
const KPI_INFO_DATA: Record<string, KPIInfo> = {
    strategyExecution: {
        title: '戰略執行率',
        description: '反映企業核心戰略目標的達成進度。',
        source: '由系統根據各部門關鍵里程碑與目標完成情況自動計算。',
        meaning: '高於 80% 表示執行良好，低於 60% 則需檢核資源配置或策略調整。'
    },
    operationalHealth: {
        title: '營運健康度',
        description: '綜合評估公司內部各部門的營運效能與協作效率。',
        source: '包含任務週轉率、資源利用率、SLA 達成率等多維度指標加權。',
        meaning: '分數越高代表組織運作越流暢，分數下降可能預示內部管理瓶頸。'
    },
    financialRunway: {
        title: '財務跑道',
        description: '預測在當前支出水平下，現有現金儲備可維持經營的月數。',
        source: '根據最新財報現金餘額與平均月度燒錢率 (Burn Rate) 計算。',
        meaning: '低於 6 個月為警戒狀態，需啟動融資案或縮減開支計畫。'
    },
    activeRisks: {
        title: '活躍風險',
        description: '當前系統監測到的外部市場危機、法規變動或內部異常監控點。',
        source: '整合全球情報監控系統、法規變動通知與內部異常檢測。',
        meaning: '存在「重大」風險時應立即進入攔截中心進行應對與決策。'
    }
};

/**
 * 快速說明彈出視窗
 */
const InfoModal: React.FC<{ info: KPIInfo; onClose: () => void }> = ({ info, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
        <div
            className="bg-slate-900 p-8 rounded-3xl border border-white/10 max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                        <HelpCircle size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{info.title}</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-6 text-sm">
                <div>
                    <div className="text-blue-400 font-bold uppercase tracking-widest text-[10px] mb-2">指標說明 :: DESCRIPTION</div>
                    <p className="text-gray-300 leading-relaxed">{info.description}</p>
                </div>
                <div>
                    <div className="text-green-400 font-bold uppercase tracking-widest text-[10px] mb-2">數據來源 :: SOURCE</div>
                    <p className="text-gray-300 leading-relaxed font-mono text-[11px] opacity-80">{info.source}</p>
                </div>
                <div>
                    <div className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-2">決策意義 :: MEANING</div>
                    <p className="text-gray-300 leading-relaxed">{info.meaning}</p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm transition-all"
            >
                理解並關閉
            </button>
        </div>
    </div>
);

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
    /** 說明 Key */
    infoKey?: string;
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
    infoKey,
}: KPICardProps) {
    const [showInfo, setShowInfo] = React.useState(false);
    const info = infoKey ? KPI_INFO_DATA[infoKey] : null;

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
        <>
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
                        <div className="flex items-center gap-2">
                            {info && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowInfo(true);
                                    }}
                                    className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    <HelpCircle size={14} />
                                    <span className="hidden sm:inline">快速說明</span>
                                </button>
                            )}
                            {statusBadge && (
                                <Badge variant={statusBadge.variant}>
                                    {statusBadge.text}
                                </Badge>
                            )}
                        </div>
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
            {showInfo && info && <InfoModal info={info} onClose={() => setShowInfo(false)} />}
        </>
    );
}


// 導出類型供外部使用
export type { KPICardProps as KPICardPropsType };
