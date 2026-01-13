/**
 * AI 架構師聊天元件
 * 右下角浮動按鈕 + 聊天氣泡視窗設計
 * 
 * 功能：
 * - 右下角圓形圖標，點擊展開聊天視窗
 * - 縮小按鈕 (-) ：收回到圓形圖標狀態
 * - 關閉按鈕 (X) ：徹底關閉並清除對話
 * - 20 分鐘閒置自動清除對話
 */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Spinner } from '@/components/ui';
import { Dictionary } from '@/lib/i18n/dictionaries';

interface ArchitectResponse {
    name: string;
    description: string;
    system_prompt: string;
    suggested_knowledge_rules: { rule_type: 'TAG' | 'DEPARTMENT'; rule_value: string }[];
    suggested_knowledge_files?: string[];
    suggested_tools?: string[]; // 新增：建議工具 ID 列表
    suggested_skills?: string[]; // 新增：建議技能 ID 列表
    mcp_config?: Record<string, any>; // 新增：推薦的 MCP 設定
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    blueprint?: ArchitectResponse;
    timestamp: Date;
}

interface ArchitectChatProps {
    onApply: (blueprint: ArchitectResponse) => void;
    departmentContext?: string;
    currentState?: any; // 當前的 Agent 狀態
    dict: Dictionary;
    fileNames?: Record<string, string>; // 新增：檔案名稱映射
    toolNames?: Record<string, string>; // 新增：工具名稱映射
    skillNames?: Record<string, string>; // 新增：技能名稱映射
}

// 閒置超時時間（20 分鐘）
const IDLE_TIMEOUT_MS = 20 * 60 * 1000;

export default function ArchitectChat({ onApply, departmentContext, currentState, dict, fileNames = {}, toolNames = {}, skillNames = {} }: ArchitectChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
    const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    const t = dict.agents.architect;

    // 初始化歡迎訊息
    const initializeChat = useCallback(() => {
        setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: t.welcome,
            timestamp: new Date()
        }]);
        setAppliedIds(new Set());
        setLastActivityTime(new Date());
    }, [t.welcome]);

    // 清除對話
    const clearChat = useCallback(() => {
        setMessages([]);
        setAppliedIds(new Set());
        setInput('');
    }, []);

    // 開啟聊天視窗
    const handleOpen = () => {
        setIsOpen(true);
        if (messages.length === 0) {
            initializeChat();
        }
        setLastActivityTime(new Date());
    };

    // 縮小（回到圓形圖標）
    const handleMinimize = () => {
        setIsOpen(false);
    };

    // 關閉並清除對話
    const handleClose = () => {
        if (messages.length > 1) {
            if (confirm(t.close_confirm)) {
                clearChat();
                setIsOpen(false);
            }
        } else {
            clearChat();
            setIsOpen(false);
        }
    };

    // 20 分鐘閒置自動清除
    useEffect(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        if (messages.length > 0) {
            idleTimerRef.current = setTimeout(() => {
                clearChat();
                setIsOpen(false);
            }, IDLE_TIMEOUT_MS);
        }

        return () => {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, [lastActivityTime, messages.length, clearChat]);

    // 自動滾動到最新訊息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 開啟時自動聚焦輸入框
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        setLastActivityTime(new Date());

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/agents/architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent: userMessage.content,
                    department_context: departmentContext,
                    current_state: currentState // 傳遞當前表單狀態
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Consultation failed');

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `✅ ${t.suggestion_ready}`,
                blueprint: json.data,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setLastActivityTime(new Date());
        } catch (err: any) {
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `❌ ${t.error_occurred}: ${err.message || 'Something went wrong'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // 僅在按下 Cmd+Enter (Mac) 或 Ctrl+Enter (Windows/Linux) 時送出
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation(); // 阻斷冒泡
            handleSend();
        }
    };

    const handleApplyBlueprint = (message: ChatMessage) => {
        if (message.blueprint) {
            onApply(message.blueprint);
            setAppliedIds(prev => new Set(prev).add(message.id));
            setLastActivityTime(new Date());
        }
    };

    return (
        <>
            {/* 右下角浮動按鈕 */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.8)] transition-all duration-300 flex items-center justify-center text-white z-50 hover:scale-110 group border-2 border-white/20 overflow-hidden"
                    title={t.open_architect}
                >
                    {/* 脈動動畫底層 */}
                    <span className="absolute inset-0 rounded-full bg-violet-500 animate-ping opacity-20" />

                    {/* SVG 內容：機器人臉與環繞文字 */}
                    <svg viewBox="0 0 100 100" className="w-full h-full p-1 drop-shadow-lg transform transition-transform group-hover:scale-105">
                        <defs>
                            {/* 橫排模式下不再需要底部的弧線路徑 */}
                        </defs>

                        {/* 機器人臉部 (保持橫向比例，位置微調以配合下方橫排文字) */}
                        <g transform="translate(50, 42) scale(0.9)">
                            {/* 天線環 */}
                            <circle cx="0" cy="-30" r="3.5" fill="#A78BFA" />
                            <rect x="-1" y="-28" width="2" height="8" fill="#A78BFA" ry="1" />

                            {/* 頭部外殼 (橫向平衡比例) */}
                            <rect x="-24" y="-18" width="48" height="34" rx="14" fill="url(#headGradient)" />
                            <defs>
                                <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#FFFFFF" />
                                    <stop offset="100%" stopColor="#CBD5E1" />
                                </linearGradient>
                            </defs>

                            {/* 數位螢幕面罩 */}
                            <rect x="-19" y="-13" width="38" height="24" rx="10" fill="#0F172A" />

                            {/* 數位眼睛 (科技感橫向圓點) */}
                            <g className="animate-[pulse_4s_infinite]">
                                <circle cx="-9" cy="-1" r="4.5" fill="#22D3EE" />
                                <circle cx="9" cy="-1" r="4.5" fill="#22D3EE" />
                                <circle cx="-10.5" cy="-2.5" r="1.5" fill="white" opacity="0.8" />
                                <circle cx="7.5" cy="-2.5" r="1.5" fill="white" opacity="0.8" />
                            </g>

                            {/* 能量感應器 (下方裝飾) */}
                            <rect x="-6" y="7" width="12" height="1.5" rx="0.75" fill="#22D3EE" opacity="0.3" />
                        </g>

                        {/* 橫排文字 (不再繞圓圈) */}
                        <text
                            x="50"
                            y="86"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="900"
                            fill="white"
                            className="select-none tracking-tighter"
                        >
                            AI代理架構師
                        </text>
                    </svg>
                </button>
            )}

            {/* 聊天氣泡視窗 */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[28rem] h-[40rem] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 border border-gray-200">

                    {/* 標題列 */}
                    <div className="p-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🤖</span>
                                <div>
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        {t.title}
                                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-normal">
                                            {t.subtitle}
                                        </span>
                                    </h3>
                                    <p className="text-violet-100 text-xs">{t.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* 縮小按鈕 */}
                                <button
                                    onClick={handleMinimize}
                                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                                    title={t.minimize}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>
                                {/* 關閉按鈕 */}
                                <button
                                    onClick={handleClose}
                                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                                    title={t.close_panel}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 聊天訊息區 */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-br-md'
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                                        }`}
                                >
                                    {/* 訊息內容 */}
                                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                                    {/* 藍圖卡片 */}
                                    {msg.blueprint && (
                                        <div className="mt-3 space-y-3 pt-3 border-t border-gray-100">
                                            {/* Agent 名稱 */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500">{t.agent_name}</label>
                                                <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-900 font-medium text-sm">
                                                    {msg.blueprint.name}
                                                </div>
                                            </div>

                                            {/* Agent 描述 */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500">{t.agent_description}</label>
                                                <div className="p-2 bg-gray-50 rounded border border-gray-200 text-gray-700 text-sm line-clamp-3">
                                                    {msg.blueprint.description}
                                                </div>
                                            </div>

                                            {/* 知識庫來源 */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500">建議知識來源</label>

                                                {/* 推薦檔案 */}
                                                {msg.blueprint.suggested_knowledge_files && msg.blueprint.suggested_knowledge_files.length > 0 && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-gray-500">📄 已選檔案</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {msg.blueprint.suggested_knowledge_files.map((fileId, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs border border-emerald-100 font-medium"
                                                                    title={fileId} // Tooltip 顯示 ID 可能有用
                                                                >
                                                                    📄 {fileNames[fileId] || (fileId.length > 20 ? fileId.slice(0, 15) + '...' : fileId)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 動態規則 */}
                                                {msg.blueprint.suggested_knowledge_rules && msg.blueprint.suggested_knowledge_rules.length > 0 && (
                                                    <div className="space-y-1 mt-2">
                                                        <p className="text-xs text-gray-500">🔧 動態規則</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {msg.blueprint.suggested_knowledge_rules.map((rule, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-violet-50 text-violet-700 rounded text-xs border border-violet-100 font-medium"
                                                                >
                                                                    {rule.rule_type === 'DEPARTMENT' ? '🏢' : '🏷️'} {rule.rule_value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {(!msg.blueprint.suggested_knowledge_files || msg.blueprint.suggested_knowledge_files.length === 0) &&
                                                    (!msg.blueprint.suggested_knowledge_rules || msg.blueprint.suggested_knowledge_rules.length === 0) && (
                                                        <span className="text-gray-400 text-xs italic">無建議來源</span>
                                                    )}
                                            </div>

                                            {/* MCP 建議預覽 */}
                                            {msg.blueprint.mcp_config && Object.keys(msg.blueprint.mcp_config).length > 0 && (
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-500">建議外部技能 (Skills)</label>
                                                    <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-600 truncate">
                                                        {JSON.stringify(msg.blueprint.mcp_config).slice(0, 50)}...
                                                    </div>
                                                </div>
                                            )}

                                            {/* 建議工具與技能 */}
                                            {(msg.blueprint.suggested_tools?.length || 0) > 0 && (
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-500">建議啟用功能 (Tools)</label>
                                                    <div className="flex flex-wrap gap-1">
                                                        {msg.blueprint.suggested_tools?.map((toolId, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] border border-blue-100 font-medium">
                                                                🔧 {toolNames[toolId] || toolId}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {(msg.blueprint.suggested_skills?.length || 0) > 0 && (
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-500">建議載入技能包 (Skills)</label>
                                                    <div className="flex flex-wrap gap-1">
                                                        {msg.blueprint.suggested_skills?.map((skillId, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] border border-purple-100 font-medium">
                                                                🧠 {skillNames[skillId] || skillId}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 系統提示詞預覽 */}
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-500">{t.system_prompt_strategy}</label>
                                                <div className="p-2 bg-gray-900 text-gray-300 rounded font-mono text-xs max-h-28 overflow-y-auto whitespace-pre-wrap">
                                                    {msg.blueprint.system_prompt.slice(0, 300)}
                                                    {msg.blueprint.system_prompt.length > 300 && '...'}
                                                </div>
                                            </div>

                                            {/* 套用按鈕 */}
                                            <Button
                                                type="button"
                                                onClick={() => handleApplyBlueprint(msg)}
                                                disabled={appliedIds.has(msg.id)}
                                                className={`w-full mt-1 ${appliedIds.has(msg.id)
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                                    }`}
                                                size="sm"
                                            >
                                                {appliedIds.has(msg.id) ? (
                                                    <span className="flex items-center justify-center gap-1 text-xs">
                                                        ✓ {t.applied}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-1 text-xs">
                                                        ✨ {t.apply}
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* 載入中指示器 */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-md px-3 py-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="animate-shimmer-text">
                                            {t.thinking}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* 輸入區 */}
                    <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t.input_placeholder}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                                rows={2}
                                disabled={loading}
                            />
                            <Button
                                type="button"
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-violet-600 hover:bg-violet-700 text-white self-end px-4"
                                size="sm"
                            >
                                {loading ? <Spinner size="sm" color="white" /> : t.send}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
