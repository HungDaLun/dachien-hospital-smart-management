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

    // 調試日誌：檢查節點數據
    if (isOpen && node) {
        console.log('[KnowledgeDetailSidebar] Node data:', {
            nodeType,
            isFramework,
            isFile,
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            frameworkName: data?.frameworkName,
            hasDetailedDefinition: !!data?.detailedDefinition,
            hasAiSummary: !!data?.aiSummary,
            hasContentData: !!data?.contentData,
        });
    }

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
            <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                    <Transition
                        show={isOpen}
                        as={Fragment}
                        enter="transform transition ease-out duration-300"
                        enterFrom="translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in duration-200"
                        leaveFrom="translate-x-0"
                        leaveTo="translate-x-full"
                    >
                        {/* Sidebar Panel - Pointer events auto to allow interaction within sidebar */}
                        <div className="pointer-events-auto w-screen max-w-2xl mt-4 mb-4 mr-4">
                            <div className="flex h-full flex-col overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-white/20 min-w-0">
                                {/* Header */}
                                <div className={`px-6 py-6 ${isFramework ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/80' : 'bg-gray-50/80'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl font-bold leading-6 text-gray-900 break-words">
                                                {isFramework ? (data.frameworkName || 'Knowledge Instance') : (data.label || 'Source Document')}
                                            </h2>
                                            <p className="mt-1 text-sm text-gray-500 break-words">
                                                {isFramework ? 'AI Extracted Insight' : 'Raw Data Asset'}
                                            </p>
                                        </div>
                                        <div className="ml-3 flex h-7 items-center gap-2">
                                            {isFramework && (
                                                <button
                                                    type="button"
                                                    className="relative rounded-md p-1 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
                                                    title="刪除此知識實例"
                                                    onClick={async () => {
                                                        if (confirm('確定要永久刪除此分析結果嗎？此動作無法復原。')) {
                                                            try {
                                                                const res = await fetch(`/api/knowledge/instances/${node.id}`, {
                                                                    method: 'DELETE',
                                                                });
                                                                if (res.ok) {
                                                                    alert('刪除成功');
                                                                    onClose();
                                                                    window.location.reload(); // Refresh to update graph
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
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="relative rounded-md p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                                                onClick={onClose}
                                            >
                                                <span className="sr-only">Close panel</span>
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content - 減少左右 padding 以容納更多內容 */}
                                <div className="relative flex-1 px-6 py-6 min-w-0">
                                    {/* Node Title */}
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 break-words">{data.label}</h2>
                                        {isFramework && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                    Confidence: {data.confidence ? (data.confidence * 100).toFixed(0) + '%' : 'N/A'}
                                                </span>
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {data.frameworkCode?.toUpperCase()} Framework
                                                </span>
                                            </div>
                                        )}
                                        {isFile && (
                                            <div className="mt-2">
                                                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                    {data.mimeType}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Framework Detailed Content */}
                                    {isFramework && (
                                        <div className="space-y-6">
                                            {/* 0. 如果沒有任何內容，顯示提示訊息 */}
                                            {!data.detailedDefinition && !data.aiSummary && !data.contentData && (
                                                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                                                    <p className="text-sm text-yellow-800">
                                                        ⚠️ 此知識實例尚未包含詳細內容。請檢查資料庫中的知識實例數據。
                                                    </p>
                                                </div>
                                            )}

                                            {/* 1. 教育層：什麼是這個框架 */}
                                            {data.detailedDefinition && (
                                                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <span className="text-4xl text-amber-900">📖</span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        百科定義 <span className="opacity-40">|</span> WHAT IS {data.frameworkName}?
                                                    </h4>
                                                    <p className="text-sm text-amber-900/80 leading-relaxed font-medium">
                                                        {data.detailedDefinition}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 2. 結論層：AI 生成的執行摘要 */}
                                            {data.aiSummary && (
                                                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                        <span className="text-4xl text-indigo-900">✨</span>
                                                    </div>
                                                    <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        執行摘要 <span className="opacity-40">|</span> EXECUTIVE SUMMARY
                                                    </h4>
                                                    <div className="text-sm text-indigo-900 leading-relaxed font-semibold">
                                                        {data.aiSummary}
                                                    </div>
                                                </div>
                                            )}

                                            {/* 3. 資料層：結構化萃取內容 (依 Schema 排序) */}
                                            <div className="pt-2">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-1 border-b pb-2 flex justify-between items-center">
                                                    <span>📥 萃取細節 (EXTRACTION DETAILS)</span>
                                                    <span className="text-gray-300 font-normal">依框架標準排序</span>
                                                </h4>

                                                <div className="grid gap-4">
                                                    {/* 優先依照系統定義的 Schema 排序顯示 */}
                                                    {data.structureSchema?.sections ? (
                                                        data.structureSchema.sections.map((section: any) => {
                                                            const value = data.contentData?.[section.key];
                                                            if (!value) return null;

                                                            return (
                                                                <div key={section.key} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                                                                    <span className="block text-[11px] font-bold text-blue-600 mb-2 uppercase tracking-widest opacity-80">
                                                                        {section.label}
                                                                    </span>
                                                                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                                                                        {Array.isArray(value) ? (
                                                                            <ul className="list-disc pl-4 space-y-1.5 marker:text-blue-300 break-words">
                                                                                {value.map((item, i) => (
                                                                                    <li key={i} className="break-words overflow-wrap-anywhere">
                                                                                        {typeof item === 'object' ? (
                                                                                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                                                                                {JSON.stringify(item, null, 2)}
                                                                                            </pre>
                                                                                        ) : (
                                                                                            String(item)
                                                                                        )}
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        ) : typeof value === 'object' ? (
                                                                            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                                                                {JSON.stringify(value, null, 2)}
                                                                            </pre>
                                                                        ) : (
                                                                            <span className="break-words overflow-wrap-anywhere">{String(value)}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        /* Fallback: 萬一沒 Schema 才用原始排列 */
                                                        data.contentData && Object.entries(data.contentData).map(([k, v]) => (
                                                            <div key={k} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                                                <span className="block text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-widest">{k}</span>
                                                                <div className="text-sm text-gray-800 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                                                                    {typeof v === 'object' ? (
                                                                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                                                            {JSON.stringify(v, null, 2)}
                                                                        </pre>
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

                                    {/* File Content (If it's a file node) */}
                                    {isFile && (
                                        <div className="space-y-4">
                                            {/* 文件完整內容 */}
                                            {fileLoading && (
                                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                    <p className="text-sm text-blue-800 flex items-center gap-2">
                                                        <span className="animate-spin">⏳</span>
                                                        載入文件內容中...
                                                    </p>
                                                </div>
                                            )}

                                            {fileError && (
                                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                                    <p className="text-sm text-yellow-800">{fileError}</p>
                                                </div>
                                            )}

                                            {fileContent && !fileLoading && (
                                                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        📄 文件完整內容
                                                    </h4>
                                                    <div className="prose prose-sm max-w-none text-gray-800 min-w-0 break-words">
                                                        <ReactMarkdown
                                                            components={{
                                                                // 自訂樣式以符合設計規範，確保文字完整顯示
                                                                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0 break-words">{children}</h1>,
                                                                h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 break-words">{children}</h2>,
                                                                h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-4 break-words">{children}</h3>,
                                                                p: ({ children }) => <p className="mb-3 leading-relaxed break-words overflow-wrap-anywhere">{children}</p>,
                                                                ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1 break-words">{children}</ul>,
                                                                ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1 break-words">{children}</ol>,
                                                                li: ({ children }) => <li className="leading-relaxed break-words overflow-wrap-anywhere">{children}</li>,
                                                                code: ({ children }) => (
                                                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 break-words">
                                                                        {children}
                                                                    </code>
                                                                ),
                                                                pre: ({ children }) => (
                                                                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3 text-sm break-words whitespace-pre-wrap">
                                                                        {children}
                                                                    </pre>
                                                                ),
                                                                blockquote: ({ children }) => (
                                                                    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 text-gray-600 break-words">
                                                                        {children}
                                                                    </blockquote>
                                                                ),
                                                                table: ({ children }) => (
                                                                    <div className="overflow-x-auto my-4 -mx-4 px-4">
                                                                        <div className="inline-block min-w-full align-middle">
                                                                            <table className="w-full border-collapse border border-gray-300 table-auto">
                                                                                {children}
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                                th: ({ children }) => (
                                                                    <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left break-words whitespace-normal max-w-xs">
                                                                        <div className="break-words overflow-wrap-anywhere">{children}</div>
                                                                    </th>
                                                                ),
                                                                td: ({ children }) => (
                                                                    <td className="border border-gray-300 px-3 py-2 break-words whitespace-normal max-w-xs">
                                                                        <div className="break-words overflow-wrap-anywhere">{children}</div>
                                                                    </td>
                                                                ),
                                                            }}
                                                        >
                                                            {fileContent}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 文件治理中繼資料 */}
                                            {data.metadata && (
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">文件治理中繼資料</h4>
                                                    <div className="grid gap-2">
                                                        {Object.entries(data.metadata).map(([k, v]) => (
                                                            <div key={k} className="flex flex-col">
                                                                <span className="text-[10px] text-gray-400 uppercase font-semibold break-words">{k}</span>
                                                                <span className="text-sm text-gray-700 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                                                                    {typeof v === 'object' ? (
                                                                        <pre className="text-xs bg-white p-2 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap break-words">
                                                                            {JSON.stringify(v, null, 2)}
                                                                        </pre>
                                                                    ) : (
                                                                        String(v)
                                                                    )}
                                                                </span>
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
