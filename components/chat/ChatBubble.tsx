/**
 * 對話氣泡元件
 * 顯示單一對話訊息
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
'use client';

import { } from 'react';
import CitationList, { Citation } from './CitationList';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { User, Brain, Copy, RotateCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * 對話氣泡屬性
 */
interface ChatBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    agentName?: string;
    citations?: Citation[];
    messageId?: string; // 用於回饋功能
    dict: Dictionary;
}

export default function ChatBubble({ role, content, agentName, citations, dict }: ChatBubbleProps) {
    const isUser = role === 'user';

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

                    {/* Markdown Content */}
                    <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-2xl prose-code:text-primary-400 prose-headings:text-text-primary prose-strong:text-text-primary">
                        <ReactMarkdown>
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
