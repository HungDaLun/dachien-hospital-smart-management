/**
 * Department Card 組件
 * 企業戰情室設計系統 - 部門狀態卡片
 * 
 * 特點：
 * - 部門統計數據（檔案數、今日更新、活躍 Agent）
 * - AI 日報摘要區塊
 * - 本日重點列表
 * - 快速操作按鈕（對話、查看詳情）
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Activity, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { fadeInUp } from '@/lib/animation-variants';

export interface DepartmentCardProps {
    /** 部門名稱 */
    departmentName: string;
    /** 部門圖示 */
    departmentIcon?: React.ReactNode;
    /** 統計數據 */
    stats: {
        /** 總檔案數 */
        totalFiles: number;
        /** 今日更新數 */
        filesUpdatedToday: number;
        /** 活躍 Agent 數 */
        activeAgents: number;
        /** 知識健康度分數 (0-100) */
        knowledgeHealthScore: number;
    };
    /** AI 摘要 */
    aiSummary?: string;
    /** 本日重點更新列表 */
    topUpdates?: string[];
    /** 對話按鈕點擊事件 */
    onChatClick?: () => void;
    /** 查看詳情按鈕點擊事件 */
    onViewDetailsClick?: () => void;
}

export default function DepartmentCard({
    departmentName,
    departmentIcon,
    stats,
    aiSummary,
    topUpdates = [],
    onChatClick,
    onViewDetailsClick,
}: DepartmentCardProps) {
    // 健康度 Badge 變體
    const getHealthStatus = (score: number) => {
        if (score >= 80) return 'success' as const;
        if (score >= 60) return 'warning' as const;
        return 'danger' as const;
    };

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
        >
            <Card variant="glass" className="h-full flex flex-col">
                {/* 頂部區域 */}
                <div className="flex items-center justify-between pb-4 border-b border-border-default">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary-500/20 text-primary-500">
                            {departmentIcon || <FileText className="w-6 h-6" />}
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-text-primary">
                            {departmentName}
                        </h3>
                    </div>
                    <Badge variant={getHealthStatus(stats.knowledgeHealthScore)}>
                        健康度 {stats.knowledgeHealthScore}%
                    </Badge>
                </div>

                {/* 內容區域 */}
                <div className="flex-1 flex flex-col gap-4 pt-4">
                    {/* 統計數據 Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <div className="text-2xl font-mono font-bold text-text-primary">
                                {stats.totalFiles}
                            </div>
                            <div className="text-xs text-text-tertiary mt-1">總檔案數</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-mono font-bold text-primary-500">
                                {stats.filesUpdatedToday}
                            </div>
                            <div className="text-xs text-text-tertiary mt-1">今日更新</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-mono font-bold text-secondary-400">
                                {stats.activeAgents}
                            </div>
                            <div className="text-xs text-text-tertiary mt-1">活躍 Agent</div>
                        </div>
                    </div>

                    {/* AI 摘要 */}
                    {aiSummary && (
                        <div className="glass-tooltip rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-secondary-400" />
                                <span className="text-xs font-medium text-secondary-400 uppercase tracking-wider">
                                    AI 日報摘要
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {aiSummary}
                            </p>
                        </div>
                    )}

                    {/* 本日重點 */}
                    {topUpdates.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-text-tertiary" />
                                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                    本日重點
                                </span>
                            </div>
                            <ul className="space-y-1">
                                {topUpdates.slice(0, 3).map((update, index) => (
                                    <li
                                        key={index}
                                        className="text-sm text-text-secondary flex items-start gap-2"
                                    >
                                        <span className="text-primary-500 mt-1">•</span>
                                        <span className="flex-1 line-clamp-1">{update}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 操作按鈕 */}
                    <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border-default">
                        <Button
                            variant="glass"
                            size="sm"
                            onClick={onChatClick}
                            leftIcon={<MessageSquare className="w-4 h-4" />}
                        >
                            對話
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onViewDetailsClick}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                            詳情
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

// 導出類型
export type { DepartmentCardProps as DepartmentCardPropsType };
