/**
 * 對話氣泡元件
 * 顯示單一對話訊息
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { useMemo } from 'react';
import CitationList, { Citation } from './CitationList';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { User, Brain, Copy, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from '@/components/markdown/CodeBlock';

/**
 * 對話氣泡屬性
 */
interface ChatBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    agentName?: string;
    citations?: Citation[];
    messageId?: string; // 用於回饋功能

    // New Safegaurds Props
    confidenceScore?: number;
    needsReview?: boolean;
    reviewTriggers?: string[];

    dict: Dictionary;
}

export default function ChatBubble({
    role,
    content,
    agentName,
    citations,
    messageId,
    confidenceScore,
    needsReview,
    reviewTriggers,
    dict
}: ChatBubbleProps) {
    const isUser = role === 'user';
    const isLowConfidence = confidenceScore !== undefined && confidenceScore < 0.6;

    // Custom components for ReactMarkdown
    const MemoizedCodeBlock = useMemo(() => {
        return ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <CodeBlock
                    language={match[1]}
                    value={String(children).replace(/\n$/, '')}
                    messageId={messageId}
                    {...props}
                />
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        };
    }, [messageId]);

    // Helper to format review triggers
    const getReviewMessage = () => {
        if (!reviewTriggers || reviewTriggers.length === 0) return dict.chat.review.general_warning || '建議人工覆核';
        const map: Record<string, string> = {
            'financial': '涉及金額資訊',
            'legal': '涉及法律條款',
            'safety': '涉及安全風險',
            'delivery': '涉及交期承諾'
        };
        const reasons = reviewTriggers.map(t => map[t] || t).join('、');
        return `此回答${reasons}，建議人工覆核`;
    };

    return (
        <div className={`flex gap-5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            {/* Avatar / Identity Token */}
            <div className="flex-shrink-0 mt-1">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-glow-cyan/5 ${isUser
                    ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 group-hover:scale-110'
                    : 'bg-white/[0.03] border-white/10 text-text-tertiary'
                    }`}>
                    {isUser ? <User size={18} /> : <Brain size={18} />}
                </div>
            </div>

            {/* Message Content Layer */}
            <div className={`flex flex-col gap-2 max-w-[85%] lg:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Header info */}
                <div className="flex items-center gap-3 px-1">
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] opacity-40">
                        {isUser ? 'PROTOCOL: CLIENT' : `KERNEL: ${agentName || 'SYSTEM'}`}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[9px] font-bold text-text-tertiary tabular-nums opacity-20">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div
                    className={`
                        relative group
                        rounded-[28px] px-8 py-5
                        transition-all duration-500
                        ${isUser
                            ? 'bg-primary-500/10 border border-primary-500/20 text-text-primary rounded-tr-none shadow-glow-cyan/5'
                            : 'bg-white/[0.03] border border-white/5 text-text-secondary rounded-tl-none shadow-inner'
                        }
                    `}
                >
                    {/* Background decorative element for AI */}
                    {!isUser && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/[0.02] blur-[40px] pointer-events-none rounded-full" />
                    )}

                    {/* Low Confidence Warning */}
                    {!isUser && isLowConfidence && (
                        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} />
                            <div>
                                <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-wider mb-1">
                                    低信心度警告 ({Math.round(confidenceScore! * 100)}%)
                                </h4>
                                <p className="text-[11px] text-yellow-500/80 leading-relaxed">
                                    此回答信心度較低，可能缺乏足夠的知識庫支援，請謹慎參考。
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Needs Review Alert */}
                    {!isUser && needsReview && !isLowConfidence && (
                        <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                            <CheckCircle2 className="text-indigo-400 mt-0.5 flex-shrink-0" size={16} />
                            <div>
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                                    建議人工覆核
                                </h4>
                                <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                                    {getReviewMessage()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Markdown Content */}
                    <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-code:text-primary-400 prose-headings:text-text-primary prose-strong:text-text-primary">
                        <ReactMarkdown
                            components={{
                                code: MemoizedCodeBlock
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>

                    {/* Citations Matrix */}
                    {!isUser && citations && citations.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <CitationList citations={citations} dict={dict} />
                        </div>
                    )}

                    {/* Action Bar (Hover only) */}
                    <div className={`absolute -bottom-10 flex gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 ${isUser ? 'right-0' : 'left-0'}`}>
                        <button className="p-2 bg-white/5 border border-white/5 rounded-xl text-text-tertiary hover:text-text-primary hover:border-white/10 transition-all" title="Copy Content">
                            <Copy size={12} />
                        </button>
                        {!isUser && (
                            <button className="p-2 bg-white/5 border border-white/5 rounded-xl text-text-tertiary hover:text-text-primary hover:border-white/10 transition-all" title="Retry Analysis">
                                <RotateCw size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
