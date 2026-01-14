'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    language: string;
    value: string;
    messageId?: string;
}

export default function CodeBlock({ language, value, messageId }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        // Implicit Feedback: Copying code implies it was helpful
        if (messageId) {
            try {
                await fetch('/api/chat/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message_id: messageId,
                        rating: 1, // Positive
                        reason_code: 'copy_code' // Special implicit reason
                    }),
                });
            } catch (e) {
                console.error('Failed to submit implicit feedback:', e);
            }
        }
    };

    return (
        <div className="relative group rounded-xl overflow-hidden my-4 border border-white/10 bg-[#0d1117]">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-xs text-text-tertiary font-mono lowercase">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-white transition-colors"
                >
                    {copied ? (
                        <>
                            <Check size={12} className="text-green-500" />
                            <span className="text-green-500">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy size={12} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={oneDark}
                customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                }}
                showLineNumbers={true}
                wrapLines={true}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
}
