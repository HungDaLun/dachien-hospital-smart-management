/**
 * 對話氣泡元件
 * 顯示單一對話訊息
 * 遵循 EAKAP 設計系統規範
 */
'use client';

import { useMemo } from 'react';

/**
 * 對話氣泡屬性
 */
interface ChatBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    agentName?: string;
}

/**
 * 簡單的 Markdown 渲染
 * 支援基礎格式：粗體、斜體、程式碼、連結
 */
function renderMarkdown(content: string): string {
    return content
        // 程式碼區塊
        .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-2 rounded my-2 overflow-x-auto text-sm"><code>$1</code></pre>')
        // 行內程式碼
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
        // 粗體
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // 斜體
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // 連結
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-primary-500 hover:underline">$1</a>')
        // 換行
        .replace(/\n/g, '<br />');
}

export default function ChatBubble({ role, content, agentName }: ChatBubbleProps) {
    const isUser = role === 'user';

    const renderedContent = useMemo(() => {
        return renderMarkdown(content);
    }, [content]);

    return (
        <div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`
          max-w-[80%] lg:max-w-[70%]
          rounded-lg px-4 py-3
          ${isUser
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }
        `}
            >
                {/* Agent 名稱 */}
                {!isUser && agentName && (
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                        {agentName}
                    </p>
                )}

                {/* 訊息內容 */}
                <div
                    className={`
            prose prose-sm max-w-none
            ${isUser ? 'prose-invert' : ''}
          `}
                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                />
            </div>
        </div>
    );
}
