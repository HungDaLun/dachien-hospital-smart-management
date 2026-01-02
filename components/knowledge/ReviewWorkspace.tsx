'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Spinner } from '@/components/ui';

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

    const handleApprove = async () => {
        if (!confirm('Approve this document for the Knowledge Base?')) return;

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
                router.push('/dashboard/knowledge');
            } else {
                alert('Approval failed');
            }
        } catch (e) {
            console.error(e);
            alert('Error submitting review');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Reject and delete this document?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/files/${file.id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'REJECT' })
            });
            if (res.ok) {
                router.push('/dashboard/knowledge/review');
            }
        } catch (e) {
            alert('Error rejecting');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
        }
    };

    return (
        <div className="flex h-full">
            {/* Left Panel: Original Logic (Placeholder) */}
            <div className="w-1/2 bg-gray-100 border-r flex flex-col items-center justify-center p-8 text-gray-500">
                {/* 
                   In a real app, this would be an iframe or PDF viewer. 
                   For MVP, we just show file info or download link.
                */}
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-bold text-gray-700">{file.filename}</h3>
                <p className="mt-2">Preview not available in MVP.</p>
                <div className="mt-4 p-4 bg-white rounded shadow text-sm max-w-md text-left overflow-auto max-h-[400px]">
                    <h4 className="font-bold border-b pb-1 mb-2">Metadata Analysis (Raw)</h4>
                    <pre>{JSON.stringify(file.metadata_analysis, null, 2)}</pre>
                </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="w-1/2 flex flex-col bg-white overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* AI Suggestions Box */}
                    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-100">
                        <div className="flex items-center gap-2 mb-4 text-violet-800 font-bold">
                            ✨ AI Suggestions
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Standardized Filename</label>
                                <input
                                    type="text"
                                    value={suggestedFilename}
                                    onChange={e => setSuggestedFilename(e.target.value)}
                                    className="w-full p-2 border border-violet-200 rounded font-mono text-sm bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Doc Type</label>
                                    <Badge variant="default">{metadata.document_type || 'Unknown'}</Badge>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                                    <Badge variant={(metadata.department_suggestion) ? 'warning' : 'default'}>
                                        {metadata.department_suggestion || 'N/A'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Summary Edit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Summary (Traditional Chinese)</label>
                        <textarea
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                        />
                    </div>

                    {/* Tags Edit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(t => (
                                <Badge key={t} variant="info" className="flex items-center gap-1">
                                    {t}
                                    <button onClick={() => setTags(tags.filter(tag => tag !== t))} className="ml-1 hover:text-red-500">×</button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                placeholder="Add new tag..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <Button onClick={handleAddTag} size="sm" variant="outline">Add</Button>
                        </div>
                    </div>

                    {/* Markdown Preview/Edit (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Extracted Content Preview</label>
                        <div className="border rounded bg-gray-50 p-4 h-[300px] overflow-y-auto text-xs font-mono text-gray-600">
                            {markdown}
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                    <Button variant="danger" onClick={handleReject} disabled={loading}>
                        Reject & Delete
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} disabled={loading} className="min-w-[140px]">
                            {loading ? <Spinner size="sm" color="white" /> : 'Approve & Publish'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
