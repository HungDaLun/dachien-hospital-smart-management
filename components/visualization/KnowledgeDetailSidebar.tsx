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
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                                        onClick={onClose}
                                                    >
                                                        <span className="absolute -inset-2.5" />
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

                                            {/* Framework Content Content */}
                                            {isFramework && (
                                                <div className="grid gap-6">
                                                    {/* This is a simple generic renderer for the framework data */}
                                                    {/* Attributes */}
                                                    {Object.entries(data).map(([key, value]) => {
                                                        if (['label', 'frameworkName', 'frameworkCode', 'uiConfig', 'confidence', 'completeness', 'contentData'].includes(key)) return null;

                                                        return (
                                                            <div key={key} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                                                                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2 border-b pb-1">
                                                                    {key.replace(/_/g, ' ')}
                                                                </h4>
                                                                <div className="text-sm text-gray-600">
                                                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Content Data (The actual filled framework data) */}
                                                    {data.contentData && (
                                                        <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-4 shadow-sm">
                                                            <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-2 border-b border-blue-200 pb-1">
                                                                Core Content
                                                            </h4>
                                                            <div className="grid gap-4">
                                                                {Object.entries(data.contentData).map(([k, v]) => (
                                                                    <div key={k}>
                                                                        <span className="block text-xs font-semibold text-blue-700 mb-1 uppercase opacity-75">{k.replace(/_/g, ' ')}</span>
                                                                        <div className="text-sm text-gray-800 bg-white p-2 rounded border border-blue-100 whitespace-pre-wrap">
                                                                            {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* File Metadata */}
                                            {isFile && data.metadata && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900">Governance Metadata</h4>
                                                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 overflow-x-auto">
                                                            {JSON.stringify(data.metadata, null, 2)}
                                                        </pre>
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
