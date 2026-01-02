'use client';

import { useState } from 'react';
import { Button, Spinner } from '@/components/ui';

interface ArchitectResponse {
    name: string;
    description: string;
    system_prompt: string;
    suggested_knowledge_rules: { rule_type: 'TAG' | 'DEPARTMENT'; rule_value: string }[];
}

interface ArchitectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (blueprint: ArchitectResponse) => void;
    departmentContext?: string; // Optional context, e.g., "Finance Dept"
}

export default function ArchitectModal({ isOpen, onClose, onApply, departmentContext }: ArchitectModalProps) {
    const [intent, setIntent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ArchitectResponse | null>(null);

    if (!isOpen) return null;

    const handleConsult = async () => {
        if (!intent.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/agents/architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    intent,
                    department_context: departmentContext
                }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Consultation failed');

            setResult(json.data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            🤖 Agent Architect
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">AI Advisor</span>
                        </h2>
                        <p className="text-violet-100 text-sm mt-1">Tell me what you need, and I'll design the perfect agent for you.</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Input Section */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            What kind of Agent do you want to build?
                        </label>
                        <div className="relative">
                            <textarea
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                placeholder="e.g., I need a specialized assistant for the HR department to answer questions about leave policies and handle new employee onboarding..."
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none min-h-[100px] resize-none text-base"
                                disabled={loading}
                            />
                            <div className="absolute bottom-3 right-3">
                                <Button
                                    onClick={handleConsult}
                                    disabled={loading || !intent.trim()}
                                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Spinner size="sm" color="white" /> Thinking...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            ✨ Design Agent
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Result Preview */}
                    {result && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 text-violet-700 font-semibold border-b border-violet-100 pb-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Suggestion Ready
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Agent Name</label>
                                    <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-900 font-medium">
                                        {result.name}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Knowledge Bindings</label>
                                    <div className="flex flex-wrap gap-2">
                                        {result.suggested_knowledge_rules.length > 0 ? (
                                            result.suggested_knowledge_rules.map((rule, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-violet-50 text-violet-700 rounded text-xs border border-violet-100 font-medium">
                                                    {rule.rule_type === 'DEPARTMENT' ? '🏢 ' : '🏷️ '}
                                                    {rule.rule_value}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">No specific bindings suggested</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">System Prompt Strategy</label>
                                <div className="p-4 bg-gray-900 text-gray-300 rounded-lg font-mono text-sm h-[200px] overflow-y-auto whitespace-pre-wrap border border-gray-800 shadow-inner">
                                    {result.system_prompt}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!result}
                        onClick={() => result && onApply(result)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Apply Blueprint
                    </Button>
                </div>
            </div>
        </div>
    );
}
