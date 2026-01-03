import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Node } from 'reactflow';

interface KnowledgeDetailSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    node: Node | null;
}

export default function KnowledgeDetailSidebar({ isOpen, onClose, node }: KnowledgeDetailSidebarProps) {
    if (!node) return null;

    const isFramework = node.type === 'framework_instance';
    const isFile = node.type === 'file' || node.type === 'input'; // 'input' is what we mapped in graph/route.ts

    const { data } = node;

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0" />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        {/* Header */}
                                        <div className={`px-4 py-6 sm:px-6 ${isFramework ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray-50'}`}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900">
                                                        {isFramework ? (data.frameworkName || 'Knowledge Instance') : 'Source Document'}
                                                    </Dialog.Title>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {isFramework ? 'AI Extructed Insight' : 'Raw Data Asset'}
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

                                        {/* Main Content */}
                                        <div className="relative flex-1 px-4 py-6 sm:px-6">
                                            {/* Node Title */}
                                            <div className="mb-6">
                                                <h2 className="text-2xl font-bold text-gray-900">{data.label}</h2>
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
                                                                            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                                                {Array.isArray(value) ? (
                                                                                    <ul className="list-disc pl-4 space-y-1.5 marker:text-blue-300">
                                                                                        {value.map((item, i) => <li key={i}>{String(item)}</li>)}
                                                                                    </ul>
                                                                                ) : typeof value === 'object' ? (
                                                                                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
                                                                                ) : String(value)}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                /* Fallback: 萬一沒 Schema 才用原始排列 */
                                                                data.contentData && Object.entries(data.contentData).map(([k, v]) => (
                                                                    <div key={k} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                                                        <span className="block text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-widest">{k}</span>
                                                                        <div className="text-sm text-gray-800">{String(v)}</div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* File Metadata (If it's a file node) */}
                                            {isFile && data.metadata && (
                                                <div className="space-y-4">
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">文件治理中繼資料</h4>
                                                        <div className="grid gap-2">
                                                            {Object.entries(data.metadata).map(([k, v]) => (
                                                                <div key={k} className="flex flex-col">
                                                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">{k}</span>
                                                                    <span className="text-sm text-gray-700">{String(v)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
