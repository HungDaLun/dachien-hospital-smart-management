/**
 * Alert Card 組件
 * 企業戰情室設計系統 - AI 洞察警報卡片
 * 
 * 類型：
 * - opportunity: 商機（綠色）
 * - risk: 風險（紅色）
 * - conflict: 衝突（黃色）
 * 
 * 特點：
 * - 優先級脈衝動畫（高優先級時）
 * - AI 建議行動區塊
 * - 受影響部門 Badge 列表
 */
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X, Lightbulb, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { alertCardVariants } from '@/lib/animation-variants';

export interface AlertCardProps {
    /** 警報類型 */
    type: 'opportunity' | 'risk' | 'conflict';
    /** 優先級 */
    priority: 'high' | 'medium' | 'low';
    /** 標題 */
    title: string;
    /** 描述 */
    description: string;
    /** 受影響部門 */
    departments?: string[];
    /** AI 建議行動 */
    recommendedAction?: string;
    /** 標記已處理事件 */
    onResolve?: () => void;
    /** 稍後處理事件 */
    onDismiss?: () => void;
    /** 是否可見（用於動畫） */
    isVisible?: boolean;
}

export default function AlertCard({
    type,
    priority,
    title,
    description,
    departments = [],
    recommendedAction,
    onResolve,
    onDismiss,
    isVisible = true,
}: AlertCardProps) {
    // 類型顏色
    const getTypeColor = () => {
        switch (type) {
            case 'opportunity':
                return 'text-semantic-success';
            case 'risk':
                return 'text-semantic-danger';
            case 'conflict':
                return 'text-semantic-warning';
        }
    };

    // 類型圖示
    const getTypeIcon = () => {
        switch (type) {
            case 'opportunity':
                return <Lightbulb className="w-5 h-5" />;
            case 'risk':
                return <ShieldAlert className="w-5 h-5" />;
            case 'conflict':
                return <AlertTriangle className="w-5 h-5" />;
        }
    };

    // 類型標籤
    const getTypeLabel = () => {
        switch (type) {
            case 'opportunity':
                return '商機洞察';
            case 'risk':
                return '風險警報';
            case 'conflict':
                return '衝突偵測';
        }
    };

    // 優先級 Badge 變體
    const getPriorityVariant = () => {
        switch (priority) {
            case 'high':
                return 'danger' as const;
            case 'medium':
                return 'warning' as const;
            case 'low':
                return 'default' as const;
        }
    };

    // 優先級標籤
    const getPriorityLabel = () => {
        switch (priority) {
            case 'high':
                return '高優先級';
            case 'medium':
                return '中優先級';
            case 'low':
                return '低優先級';
        }
    };

    // 卡片變體
    const getCardVariant = () => {
        if (type === 'risk') return 'danger';
        if (type === 'opportunity') return 'success';
        return 'glow';
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    variants={alertCardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={priority === 'high' ? 'animate-pulse-glow' : ''}
                >
                    <Card variant={getCardVariant()}>
                        <div className="flex items-start justify-between gap-4">
                            {/* 左側內容 */}
                            <div className="flex-1">
                                {/* 標題列 */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={getTypeColor()}>{getTypeIcon()}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-medium uppercase tracking-wider ${getTypeColor()}`}>
                                                {getTypeLabel()}
                                            </span>
                                            <Badge variant={getPriorityVariant()}>
                                                {getPriorityLabel()}
                                            </Badge>
                                        </div>
                                        <h4 className="text-lg font-heading font-semibold text-text-primary">
                                            {title}
                                        </h4>
                                    </div>
                                </div>

                                {/* 描述 */}
                                <p className="text-sm text-text-secondary mb-3">{description}</p>

                                {/* 受影響部門 */}
                                {departments.length > 0 && (
                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                        <span className="text-xs text-text-tertiary">影響部門：</span>
                                        {departments.map((dept, index) => (
                                            <Badge key={index} variant="outline" size="sm">
                                                {dept}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* AI 建議行動 */}
                                {recommendedAction && (
                                    <div className="glass-tooltip rounded-lg p-3 mb-4">
                                        <div className="text-xs font-medium text-secondary-400 uppercase tracking-wider mb-1">
                                            AI 建議
                                        </div>
                                        <p className="text-sm text-text-secondary">{recommendedAction}</p>
                                    </div>
                                )}

                                {/* 操作按鈕 */}
                                <div className="flex items-center gap-3">
                                    {onResolve && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={onResolve}
                                            leftIcon={<CheckCircle className="w-4 h-4" />}
                                        >
                                            標記已處理
                                        </Button>
                                    )}
                                    {onDismiss && (
                                        <Button variant="ghost" size="sm" onClick={onDismiss}>
                                            稍後處理
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* 右側關閉按鈕 */}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="text-text-tertiary hover:text-text-primary transition-colors p-1"
                                    aria-label="關閉"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// 導出類型
export type { AlertCardProps as AlertCardPropsType };
