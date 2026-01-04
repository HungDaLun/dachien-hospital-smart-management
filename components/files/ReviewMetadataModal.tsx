'use client';

import { Modal, Button, Input } from '@/components/ui';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { getCategories } from '@/lib/actions/taxonomy';
import { DocumentCategory } from '@/types';
import HierarchicalCategorySelect from './HierarchicalCategorySelect';

interface ReviewMetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: {
        filename: string;
        tags: string[];
        categoryId?: string;
        governance?: {
            domain?: string;
            artifact?: string;
            owner?: string;
            status?: string;
            version?: string;
        }
    }) => Promise<void>;
    originalFilename: string;
    metadata: {
        suggested_filename?: string;
        title?: string;
        summary?: string;
        tags?: string[];
        topics?: string[];
        governance?: {
            domain?: string;
            artifact?: string;
            owner?: string;
            status?: string;
            version?: string;
            confidence?: string;
        };
        category_suggestion?: string;
    };
    dict: Dictionary;
}

export default function ReviewMetadataModal({
    isOpen,
    onClose,
    onConfirm,
    originalFilename,
    metadata,
    dict,
}: ReviewMetadataModalProps) {
    const [filename, setFilename] = useState(originalFilename);
    const [tags, setTags] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState<string>('');
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Governance fields state
    const [govDomain, setGovDomain] = useState('');
    const [govArtifact, setGovArtifact] = useState('');
    const [govOwner, setGovOwner] = useState('');
    const [govVersion, setGovVersion] = useState('');

    useEffect(() => {
        const fetchCats = async () => {
            const { data } = await getCategories();
            if (data) setCategories(data);
        };
        fetchCats();
    }, []);

    useEffect(() => {
        if (metadata) {
            setFilename(metadata.suggested_filename || originalFilename);
            setTags(metadata.tags || []);

            // Initial governance states
            setGovDomain(metadata.governance?.domain || '');
            setGovArtifact(metadata.governance?.artifact || '');
            setGovOwner(metadata.governance?.owner || '');
            setGovVersion(metadata.governance?.version || 'v1.0');

            // Try to match suggested category
            if (metadata.category_suggestion && categories.length > 0) {
                const match = categories.find(c => c.name === metadata.category_suggestion);
                if (match) setCategoryId(match.id);
            }
        }
    }, [metadata, originalFilename, categories]);

    const handleRemoveTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const val = e.currentTarget.value.trim();
            if (val && !tags.includes(val)) {
                setTags([...tags, val]);
                e.currentTarget.value = '';
            }
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm({
                filename,
                tags,
                categoryId,
                governance: {
                    domain: govDomain,
                    artifact: govArtifact,
                    owner: govOwner,
                    version: govVersion,
                    status: metadata.governance?.status || 'validated'
                }
            });
            onClose();
        } catch (error) {
            console.error(error);
            alert(dict.common.error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={dict.knowledge.review.title}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {dict.common.cancel}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {dict.knowledge.review.confirm_apply}
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                {/* AI Suggestion Content (Summary remains read-only for context) */}
                <div className="bg-indigo-50/50 p-5 rounded-lg border border-indigo-100/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-indigo-100 rounded-md">
                            <Sparkles size={16} className="text-indigo-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 tracking-tight">{dict.knowledge.review.ai_summary}</h4>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed bg-white/60 p-3 rounded-md border border-indigo-50">
                        {metadata.summary || dict.knowledge.review.no_summary}
                    </p>
                </div>

                {/* Governance Editing Section */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">{dict.knowledge.review.domain}</label>
                        <Input
                            value={govDomain}
                            onChange={(e) => setGovDomain(e.target.value)}
                            inputSize="sm"
                            placeholder="e.g. audience, technology"
                            className="bg-white border-indigo-100 focus:border-indigo-300"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">{dict.knowledge.review.version}</label>
                        <Input
                            value={govVersion}
                            onChange={(e) => setGovVersion(e.target.value)}
                            inputSize="sm"
                            placeholder="v1.0"
                            className="bg-white border-indigo-100 focus:border-indigo-300"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">{dict.knowledge.review.owner}</label>
                        <Input
                            value={govOwner}
                            onChange={(e) => setGovOwner(e.target.value)}
                            inputSize="sm"
                            placeholder="Dept or Team"
                            className="bg-white border-indigo-100 focus:border-indigo-300"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">{dict.knowledge.review.artifact}</label>
                        <Input
                            value={govArtifact}
                            onChange={(e) => setGovArtifact(e.target.value)}
                            inputSize="sm"
                            placeholder="e.g. persona, sop"
                            className="bg-white border-indigo-100 focus:border-indigo-300"
                        />
                    </div>
                </div>

                {/* Filename Edit */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {dict.knowledge.review.standardized_filename}
                    </label>
                    <div className="flex gap-2 items-center">
                        <Input
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className="font-mono text-sm"
                        />
                        {metadata.suggested_filename && filename !== metadata.suggested_filename && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setFilename(metadata.suggested_filename!)}
                                title={dict.knowledge.review.reset_to_suggestion}
                            >
                                ↺
                            </Button>
                        )}
                    </div>
                    {originalFilename !== filename && (
                        <p className="text-xs text-gray-500 mt-1">
                            {dict.knowledge.review.original}: <span className="line-through">{originalFilename}</span>
                        </p>
                    )}
                </div>

                {/* Category Select - 階層式選單 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {dict.knowledge.review.document_category}
                    </label>
                    <HierarchicalCategorySelect
                        categories={categories}
                        value={categoryId}
                        onChange={setCategoryId}
                        selectSize="md"
                        className="w-full"
                    />
                    {metadata.category_suggestion && !categoryId && (
                        <p className="text-xs text-gray-500 mt-1">
                            {dict.knowledge.review.suggested}: {metadata.category_suggestion}
                        </p>
                    )}
                </div>

                {/* Tags Edit */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {dict.knowledge.review.governance_tags}
                    </label>
                    <div className="border border-gray-300 rounded-md p-2 bg-white">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(i)}
                                        className="ml-1 text-blue-400 hover:text-blue-600 focus:outline-none"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder={dict.knowledge.review.add_tag_placeholder}
                            className="w-full text-sm outline-none bg-transparent"
                            onKeyDown={handleAddTag}
                        />
                    </div>
                    {metadata.topics && metadata.topics.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                            {dict.knowledge.review.detected_topics}: {metadata.topics.join(', ')}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
