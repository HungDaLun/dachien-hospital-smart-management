'use client';

import { Fragment, useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { Node } from 'reactflow';
import ReactMarkdown from 'react-markdown';

interface KnowledgeDetailSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    node: Node | null;
}

export default function KnowledgeDetailSidebar({ isOpen, onClose, node }: KnowledgeDetailSidebarProps) {
    if (!node) return null;

    // 注意：GalaxyGraph 將所有節點的 type 設為 'default'，實際類型在 data.nodeType 中
    const nodeType = node.data?.nodeType || node.type;
    const isFramework = nodeType === 'framework_instance';
    const isFile = nodeType === 'file' || nodeType === 'input';

    const { data } = node;

    // 文件內容狀態
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileLoading, setFileLoading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    // 當文件節點打開時，獲取文件完整內容
    useEffect(() => {
        if (isOpen && isFile && node.id) {
            setFileLoading(true);
            setFileError(null);

            fetch(`/api/files/${node.id}`)
                .then(res => res.json())
                .then(result => {
                    if (result.success && result.data) {
                        // 優先使用 markdown_content，如果沒有則顯示提示
                        const content = result.data.markdown_content;
                        if (content) {
                            setFileContent(content);
                        } else {
                            setFileError('此文件尚未處理完成，無法顯示內容。請等待文件處理完成。');
                        }
                    } else {
                        setFileError(result.error?.message || '無法載入文件內容');
                    }
                })
                .catch(err => {
                    console.error('[KnowledgeDetailSidebar] 載入文件內容失敗:', err);
                    setFileError('載入文件內容時發生錯誤');
                })
                .finally(() => {
                    setFileLoading(false);
                });
        } else {
            // 非文件節點或側邊欄關閉時，清除內容
            setFileContent(null);
            setFileError(null);
        }
    }, [isOpen, isFile, node.id]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[100]">
            <div className="absolute inset-0 overflow-hidden">
                {/* 使用 top-20 (80px) 讓側邊欄從導航列下方開始，避免被遮住 */}
                <div className="pointer-events-none fixed top-20 bottom-0 right-0 flex max-w-full pl-10">
                    <Transition
                        show={isOpen}
                        as={Fragment}
                        enter="transform transition ease-out duration-500"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in duration-300"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                    >
                        {/* Sidebar Panel - 使用 py-6 內間距取代 mt-6 mb-6 外間距，確保高度正確 */}
                        <div className="pointer-events-auto w-screen max-w-2xl py-6 pr-6 h-full">
                            <div className="flex h-full flex-col bg-background-secondary/80 backdrop-blur-2xl shadow-floating rounded-[32px] border border-white/10 min-w-0 relative overflow-hidden">
                                {/* Decorative line */}
                                <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-primary-500/20 via-transparent to-transparent" />

                                {/* Header - shrink-0 確保 header 不會被壓縮，X 按鈕永遠可見 */}
                                <div className={`shrink-0 px-8 py-8 ${isFramework ? 'bg-primary-500/[0.03] border-b border-white/5' : 'bg-white/[0.01] border-b border-white/5'}`}>
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${isFramework ? 'bg-primary-500 animate-pulse' : 'bg-secondary-500'}`} />
                                                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                                                    {isFramework ? 'Tactical Insight Extraction' : 'Strategic Data Asset'}
                                                </p>
                                            </div>
                                            <h2 className="text-2xl font-black leading-tight text-text-primary break-words uppercase tracking-tight">
                                                {isFramework ? (data.frameworkName || 'Knowledge Instance') : (data.label || 'Source Document')}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-4">
                                            {isFramework && (
                                                <button
                                                    type="button"
                                                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-text-tertiary hover:text-semantic-danger hover:bg-semantic-danger/10 border border-white/10 transition-all"
                                                    title="刪除此知識實例"
                                                    onClick={async () => {
                                                        if (confirm('確定要永久刪除此分析結果嗎？此動作無法復原。')) {
                                                            try {
                                                                const res = await fetch(`/api/knowledge/instances/${node.id}`, {
                                                                    method: 'DELETE',
                                                                });
                                                                if (res.ok) {
                                                                    onClose();
                                                                    window.location.reload();
                                                                } else {
                                                                    const err = await res.json();
                                                                    alert(`刪除失敗: ${err.error || '未知錯誤'}`);
                                                                }
                                                            } catch (e) {
                                                                alert('刪除時發生錯誤');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 text-text-tertiary hover:text-text-primary hover:bg-white/10 border border-white/10 transition-all"
                                                onClick={onClose}
                                            >
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="relative flex-1 px-8 py-8 min-w-0 custom-scrollbar overflow-y-auto">
                                    {/* Node Overview Card */}
                                    <div className="mb-10">
                                        <h3 className="text-3xl font-black text-text-primary break-words tracking-tight mb-4">{data.label}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {isFramework && (
                                                <>
                                                    <span className="inline-flex items-center rounded-lg bg-primary-500/10 px-3 py-1 text-[10px] font-black text-primary-400 border border-primary-500/20 uppercase tracking-widest shadow-glow-cyan/10">
                                                        CONFIDENCE: {data.confidence ? (data.confidence * 100).toFixed(0) + '%' : 'N/A'}
                                                    </span>
                                                    <span className="inline-flex items-center rounded-lg bg-purple-500/10 px-3 py-1 text-[10px] font-black text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                                                        {data.frameworkCode?.toUpperCase()} FRAMEWORK
                                                    </span>
                                                </>
                                            )}
                                            {isFile && (
                                                <span className="inline-flex items-center rounded-lg bg-white/5 px-3 py-1 text-[10px] font-black text-text-secondary border border-white/10 uppercase tracking-widest">
                                                    FORMAT: {data.mimeType?.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Framework Detailed Content */}
                                    {isFramework && (
                                        <div className="space-y-8">
                                            {!data.detailedDefinition && !data.aiSummary && !data.contentData && (
                                                <div className="bg-semantic-warning/10 rounded-2xl p-6 border border-semantic-warning/20">
                                                    <p className="text-sm text-semantic-warning font-bold">
                                                        ⚠️ 此區域尚無結構化數據，請確認 Agent 是否完成分析。
                                                    </p>
                                                </div>
                                            )}

                                            {/* Encyclopedia Section */}
                                            {data.detailedDefinition && (
                                                <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-2xl rounded-full" />
                                                    <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                                        百科定義 <span className="opacity-30">|</span> WHAT IS {data.frameworkName}?
                                                    </h4>
                                                    <p className="text-[15px] text-text-secondary leading-relaxed font-medium italic">
                                                        "{data.detailedDefinition}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* AI Summary Section */}
                                            {data.aiSummary && (
                                                <div className="bg-gradient-to-br from-primary-500/10 via-transparent to-transparent rounded-3xl p-6 border border-primary-500/20 shadow-glow-cyan/5">
                                                    <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        執行摘要 <span className="opacity-30">|</span> EXECUTIVE SUMMARY
                                                    </h4>
                                                    <div className="text-base text-text-primary leading-relaxed font-bold">
                                                        {data.aiSummary}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Extraction Details Section */}
                                            <div className="pt-4">
                                                <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-6 px-1 border-b border-white/5 pb-3 flex justify-between items-center">
                                                    <span>📥 萃取細節 (EXTRACTION DETAILS)</span>
                                                    <span className="opacity-30">V2.4 ENGINE</span>
                                                </h4>

                                                <div className="grid gap-4">
                                                    {data.structureSchema?.sections ? (
                                                        data.structureSchema.sections.map((section: any) => {
                                                            const value = data.contentData?.[section.key];
                                                            if (!value) return null;

                                                            return (
                                                                <div key={section.key} className="bg-white/[0.02] rounded-2xl border border-white/5 p-6 hover:border-primary-500/20 transition-all group">
                                                                    <span className="block text-[10px] font-black text-primary-500 mb-3 uppercase tracking-widest opacity-60">
                                                                        {section.label}
                                                                    </span>
                                                                    <div className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed break-words font-medium">
                                                                        {Array.isArray(value) ? (
                                                                            <ul className="list-none space-y-3">
                                                                                {value.map((item, i) => (
                                                                                    <li key={i} className="flex gap-3">
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0 opacity-50" />
                                                                                        {typeof item === 'object' ? (
                                                                                            <div className="text-sm space-y-1">
                                                                                                {Object.entries(item).map(([k, v]) => (
                                                                                                    <div key={k}>
                                                                                                        <span className="text-text-tertiary">{k}:</span>{' '}
                                                                                                        <span className="text-text-secondary">{typeof v === 'object' ? Object.entries(v as object).map(([ik, iv]) => `${ik}: ${iv}`).join(', ') : String(v)}</span>
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        ) : (
                                                                                            String(item)
                                                                                        )}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        ) : typeof value === 'object' ? (
                                                                            <div className="text-sm space-y-1">
                                                                                {Object.entries(value).map(([k, v]) => (
                                                                                    <div key={k}>
                                                                                        <span className="text-text-tertiary">{k}:</span>{' '}
                                                                                        <span className="text-text-secondary">{typeof v === 'object' ? Object.entries(v as object).map(([ik, iv]) => `${ik}: ${iv}`).join(', ') : String(v)}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-text-primary font-bold">{String(value)}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        data.contentData && Object.entries(data.contentData).map(([k, v]) => (
                                                            <div key={k} className="bg-white/[0.02] rounded-2xl border border-white/5 p-6">
                                                                <span className="block text-[10px] font-black text-primary-500 mb-2 uppercase tracking-widest opacity-60">{k}</span>
                                                                <div className="text-sm text-text-secondary break-words whitespace-pre-wrap">
                                                                    {typeof v === 'object' ? (
                                                                        <div className="space-y-1">
                                                                            {Array.isArray(v)
                                                                                ? v.map((item, i) => (
                                                                                    <div key={i}>{typeof item === 'object' ? Object.entries(item).map(([ik, iv]) => `${ik}: ${iv}`).join(', ') : String(item)}</div>
                                                                                ))
                                                                                : (v && Object.entries(v as Record<string, unknown>).map(([ik, iv]) => (
                                                                                    <div key={ik}>
                                                                                        <span className="text-text-tertiary">{ik}:</span>{' '}
                                                                                        <span>{typeof iv === 'object' && iv !== null ? Object.entries(iv as Record<string, unknown>).map(([iik, iiv]) => `${iik}: ${iiv}`).join(', ') : String(iv)}</span>
                                                                                    </div>
                                                                                )))
                                                                            }
                                                                        </div>
                                                                    ) : (
                                                                        String(v)
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Content Section */}
                                    {isFile && (
                                        <div className="space-y-6">
                                            {fileLoading && (
                                                <div className="bg-primary-500/5 rounded-2xl p-8 border border-primary-500/10 text-center">
                                                    <div className="animate-spin text-2xl mb-4">⌛</div>
                                                    <p className="text-xs font-black text-primary-400 uppercase tracking-widest">
                                                        Synchronizing Content Data...
                                                    </p>
                                                </div>
                                            )}

                                            {fileError && (
                                                <div className="bg-semantic-warning/10 rounded-2xl p-6 border border-semantic-warning/20">
                                                    <p className="text-sm text-semantic-warning font-bold">{fileError}</p>
                                                </div>
                                            )}

                                            {fileContent && !fileLoading && (
                                                <div className="bg-white/[0.02] rounded-3xl border border-white/5 p-8 shadow-inner ring-1 ring-white/5">
                                                    <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                                        <span className="w-4 h-px bg-white/10" /> 📄 DOCUMENT STREAM
                                                    </h4>
                                                    <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
                                                        <ReactMarkdown
                                                            components={{
                                                                h1: ({ children }) => <h1 className="text-2xl font-black text-text-primary mb-6 mt-10 first:mt-0 uppercase tracking-tight">{children}</h1>,
                                                                h2: ({ children }) => <h2 className="text-xl font-black text-text-primary mb-4 mt-8 uppercase tracking-tight">{children}</h2>,
                                                                h3: ({ children }) => <h3 className="text-lg font-bold text-text-primary mb-3 mt-6 uppercase">{children}</h3>,
                                                                p: ({ children }) => <p className="mb-4 leading-relaxed font-medium text-[15px]">{children}</p>,
                                                                ul: ({ children }) => <ul className="list-none pl-6 mb-6 space-y-2">{children}</ul>,
                                                                ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-primary-500 font-bold">{children}</ol>,
                                                                li: ({ children }) => (
                                                                    <li className="flex gap-3">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500/30 mt-2.5 shrink-0" />
                                                                        <div className="font-medium text-[14px]">{children}</div>
                                                                    </li>
                                                                ),
                                                                code: ({ children }) => (
                                                                    <code className="bg-white/5 px-1.5 py-0.5 rounded text-[13px] font-mono text-primary-400 border border-white/5">
                                                                        {children}
                                                                    </code>
                                                                ),
                                                                pre: ({ children }) => (
                                                                    <pre className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-6 text-sm font-mono overflow-x-auto custom-scrollbar">
                                                                        {children}
                                                                    </pre>
                                                                ),
                                                                blockquote: ({ children }) => (
                                                                    <blockquote className="border-l-4 border-primary-500/30 pl-6 italic my-6 text-text-tertiary bg-white/[0.01] py-4 pr-4 rounded-r-2xl">
                                                                        {children}
                                                                    </blockquote>
                                                                ),
                                                                table: ({ children }) => (
                                                                    <div className="overflow-x-auto my-8 rounded-2xl border border-white/5 bg-white/[0.01]">
                                                                        <table className="w-full border-collapse text-sm">
                                                                            {children}
                                                                        </table>
                                                                    </div>
                                                                ),
                                                                th: ({ children }) => (
                                                                    <th className="border-b border-white/10 px-4 py-3 bg-white/5 font-black text-left text-[10px] uppercase tracking-widest text-text-tertiary">
                                                                        {children}
                                                                    </th>
                                                                ),
                                                                td: ({ children }) => (
                                                                    <td className="border-b border-white/[0.02] px-4 py-3 text-text-secondary font-medium">
                                                                        {children}
                                                                    </td>
                                                                ),
                                                            }}
                                                        >
                                                            {fileContent}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Governance Metadata */}
                                            {data.metadata && (
                                                <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                                                    <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-4">GOVERNANCE PROTOCOLS</h4>
                                                    <div className="grid gap-3">
                                                        {Object.entries(data.metadata).map(([k, v]) => (
                                                            <div key={k} className="flex flex-col gap-1 border-b border-white/[0.03] pb-3 last:border-0 last:pb-0">
                                                                <span className="text-[9px] text-text-tertiary uppercase font-black tracking-widest opacity-50">{k}</span>
                                                                <div className="text-sm text-text-secondary break-all">
                                                                    {typeof v === 'object' && v !== null ? (
                                                                        Array.isArray(v)
                                                                            ? v.map((item, i) => (
                                                                                <div key={i} className="py-0.5">
                                                                                    {typeof item === 'object' && item !== null
                                                                                        ? Object.entries(item).map(([ik, iv]) => `${ik}: ${iv}`).join(', ')
                                                                                        : String(item)}
                                                                                </div>
                                                                            ))
                                                                            : Object.entries(v).map(([ik, iv]) => (
                                                                                <div key={ik} className="py-0.5">
                                                                                    <span className="text-text-tertiary">{ik}:</span>{' '}
                                                                                    <span>{typeof iv === 'object' && iv !== null
                                                                                        ? (Array.isArray(iv)
                                                                                            ? iv.join(', ')
                                                                                            : Object.entries(iv as Record<string, unknown>).map(([iik, iiv]) => `${iik}: ${iiv}`).join(', '))
                                                                                        : String(iv)}
                                                                                    </span>
                                                                                </div>
                                                                            ))
                                                                    ) : (
                                                                        String(v)
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    );
}
