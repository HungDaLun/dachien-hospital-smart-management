'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Spinner, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FileText, Sparkles, X, CheckCircle2, AlertCircle, Database, Tag, ArrowLeft } from 'lucide-react';

interface ReviewWorkspaceProps {
    file: any;
}

export default function ReviewWorkspace({ file }: ReviewWorkspaceProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [markdown] = useState(file.markdown_content || '');
    const [metadata] = useState(file.metadata_analysis || {});

    // Metadata Editing
    const [suggestedFilename, setSuggestedFilename] = useState(metadata.suggested_filename || file.filename);
    const [summary, setSummary] = useState(metadata.summary || '');
    const [tags, setTags] = useState<string[]>(metadata.tags || []);
    const [newTag, setNewTag] = useState('');

    // Confirm Dialog State
    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
    const { toast } = useToast();

    const handleConfirmAction = async () => {
        if (confirmAction === 'approve') {
            await performApprove();
        } else if (confirmAction === 'reject') {
            await performReject();
        }
        setConfirmAction(null);
    };

    const performApprove = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/files/${file.id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'APPROVE',
                    updates: {
                        filename: suggestedFilename,
                        summary,
                        tags,
                        category: metadata.document_type
                    }
                })
            });

            if (res.ok) {
                toast.success('Document approved successfully');
                router.push('/dashboard/knowledge');
            } else {
                toast.error('Approval failed');
            }
        } catch (e) {
            console.error(e);
            toast.error('Error submitting review');
        } finally {
            setLoading(false);
        }
    };

    const performReject = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/files/${file.id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REJECT' })
            });
            if (res.ok) {
                toast.success('Document rejected');
                router.push('/dashboard/knowledge/review');
            }
        } catch (e) {
            toast.error('Error rejecting');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = () => setConfirmAction('approve');
    const handleRejectClick = () => setConfirmAction('reject');

    const handleAddTag = () => {
        const tag = newTag.trim();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setNewTag('');
        }
    };

    return (
        <div className="flex h-full bg-background-primary">
            {/* Left Panel: Source Preview & Raw Data */}
            <div className="w-1/2 flex flex-col border-r border-white/5 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:24px_24px]" />
                </div>

                <div className="relative flex-1 flex flex-col">
                    <div className="p-8 border-b border-white/5 bg-white/[0.01] backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                                <FileText size={24} className="text-text-tertiary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight truncate max-w-md">{file.filename}</h3>
                                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-0.5">Source Material Verification</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                        <div className="bg-background-secondary/50 rounded-[32px] border border-white/5 p-10 flex flex-col items-center justify-center min-h-[400px] group shadow-inner">
                            <div className="w-24 h-24 flex items-center justify-center rounded-[32px] bg-white/[0.03] border border-white/5 mb-6 group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-500 shadow-glow-cyan/5">
                                <FileText size={40} className="text-text-tertiary group-hover:text-primary-400 transition-colors" />
                            </div>
                            <p className="text-sm font-black text-text-tertiary uppercase tracking-[0.2em] mb-2">Simulation Engine</p>
                            <p className="text-text-secondary text-center max-w-sm italic opacity-60">Visual preview component processing... Content extracted via OCR/PDF Stream.</p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] flex items-center gap-2">
                                <Database size={12} className="text-primary-500" />
                                原始解析數據集 <span className="opacity-30">|</span> RAW ANALYTIC DATA
                            </h4>
                            <div className="bg-black/40 rounded-2xl border border-white/5 p-6 shadow-inner">
                                <pre className="text-[11px] font-mono text-text-tertiary leading-relaxed whitespace-pre-wrap">
                                    {JSON.stringify(file.metadata_analysis, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: AI Alignment Editor */}
            <div className="w-1/2 flex flex-col bg-background-secondary/30 relative">
                <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-primary-500/20 via-transparent to-transparent" />

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10">
                    {/* Page Title */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">情報校準中心</h2>
                            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mt-1">Intelligence Alignment Center</p>
                        </div>
                        <Badge variant="secondary" size="md" pulse className="px-4 py-1.5">AI Review Active</Badge>
                    </div>

                    {/* AI Suggestions Box */}
                    <div className="relative group/suggestions">
                        <div className="absolute -inset-1 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-[32px] blur opacity-0 group-hover/suggestions:opacity-100 transition-duration-500" />
                        <Card variant="glass" className="relative p-8 border-primary-500/20 shadow-glow-cyan/5">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                                    <Sparkles size={18} className="animate-pulse-slow" />
                                </div>
                                <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">智能校準建議 <span className="opacity-30">|</span> AI ALIGNMENT</h4>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">資產標準化名稱 <span className="opacity-30">|</span> FILENAME</label>
                                    <Input
                                        value={suggestedFilename}
                                        onChange={e => setSuggestedFilename(e.target.value)}
                                        className="bg-black/20 font-mono text-sm border-white/5 focus:border-primary-500/30"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">檔案原型 <span className="opacity-30">|</span> DOC TYPE</label>
                                        <div className="bg-white/[0.03] px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                            <span className="text-sm font-black text-text-primary uppercase tracking-tight">{metadata.document_type || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">歸屬部門 <span className="opacity-30">|</span> DEPARTMENT</label>
                                        <div className="bg-white/[0.03] px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-secondary-400" />
                                            <span className="text-sm font-black text-text-primary uppercase tracking-tight">{metadata.department_suggestion || 'SYSTEM'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Summary Edit */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                            <div className="w-1 h-3 bg-primary-500 rounded-full" />
                            <label className="text-[10px] font-black text-text-primary uppercase tracking-widest">特徵摘要校正 <span className="opacity-30">|</span> EXECUTIVE SUMMARY</label>
                        </div>
                        <textarea
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                            rows={4}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-text-secondary leading-relaxed font-medium focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500/30 outline-none transition-all custom-scrollbar placeholder:text-text-tertiary/20 shadow-inner"
                            placeholder="Enter executive summary content..."
                        />
                    </div>

                    {/* Tags Matrix */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                            <Tag size={13} className="text-primary-400" />
                            <label className="text-[10px] font-black text-text-primary uppercase tracking-widest">知識標籤矩陣 <span className="opacity-30">|</span> TAG MATRIX</label>
                        </div>
                        <Card variant="glass" className="p-6 border-white/5 bg-black/20">
                            <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                                {tags.map(t => (
                                    <Badge key={t} variant="outline" className="bg-primary-500/5 border-primary-500/20 text-primary-400 pl-3 pr-2 py-1 gap-2 group/tag">
                                        {t}
                                        <button onClick={() => setTags(tags.filter(tag => tag !== t))} className="opacity-40 hover:opacity-100 hover:text-semantic-danger transition-all">
                                            <X size={14} />
                                        </button>
                                    </Badge>
                                ))}
                                {tags.length === 0 && (
                                    <span className="text-[10px] text-text-tertiary italic uppercase tracking-widest p-1 opacity-30">Waiting for tag injection...</span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Input
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                        placeholder="Add diagnostic tag..."
                                        className="bg-black/20"
                                        inputSize="sm"
                                    />
                                </div>
                                <Button onClick={handleAddTag} size="sm" variant="outline" className="border-white/10 px-6">
                                    ADD
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-4 pb-10">
                        <div className="flex items-center gap-2 ml-1">
                            <FileText size={13} className="text-text-tertiary" />
                            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">內容預演串流 <span className="opacity-30">|</span> CONTENT STREAM</label>
                        </div>
                        <div className="bg-black/40 rounded-3xl border border-white/5 p-8 h-[300px] overflow-y-auto text-xs font-mono text-text-tertiary leading-relaxed custom-scrollbar shadow-inner">
                            {markdown || 'NO RAW STREAM DETECTED'}
                        </div>
                    </div>
                </div>

                {/* Status Command Bar */}
                <div className="sticky bottom-0 left-0 w-full p-8 border-t border-white/10 bg-background-secondary/80 backdrop-blur-2xl flex justify-between items-center z-[20] shadow-floating">
                    <Button
                        variant="outline"
                        onClick={handleRejectClick}
                        disabled={loading}
                        className="border-semantic-danger/30 text-semantic-danger hover:bg-semantic-danger/10 px-8 h-12 rounded-2xl"
                    >
                        <AlertCircle size={18} className="mr-2" />
                        REJECT & DISCARD
                    </Button>
                    <div className="flex gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            disabled={loading}
                            className="text-text-tertiary hover:text-text-primary px-6 h-12 rounded-2xl"
                        >
                            <ArrowLeft size={18} className="mr-2" />
                            BACK
                        </Button>
                        <Button
                            onClick={handleApproveClick}
                            disabled={loading}
                            className="bg-primary-500 hover:bg-primary-600 text-black font-black px-10 h-12 rounded-2xl shadow-glow-cyan/20 min-w-[200px]"
                        >
                            {loading ? <Spinner size="sm" color="black" /> : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 size={18} />
                                    APPROVE & SYNC
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={!!confirmAction}
                title={confirmAction === 'approve' ? 'Approve Document' : 'Reject Document'}
                description={confirmAction === 'approve'
                    ? 'Approve this document for the Knowledge Base?'
                    : 'Reject and delete this document?'}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmAction(null)}
                confirmText={confirmAction === 'approve' ? 'Approve' : 'Reject'}
                variant={confirmAction === 'approve' ? 'success' : 'danger'}
                loading={loading}
            />
        </div>
    );
}
