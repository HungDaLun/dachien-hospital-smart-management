'use client';

import { Modal, Button, Input } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { getCategories } from '@/lib/actions/taxonomy';
import { DocumentCategory } from '@/types';
import HierarchicalCategorySelect from './HierarchicalCategorySelect';

interface ReviewMetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { filename: string; tags: string[]; categoryId?: string }) => Promise<void>;
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
            await onConfirm({ filename, tags, categoryId });
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
                {/* Suggestion Summary */}
                <div className="bg-primary-50 p-4 rounded-md border border-primary-100">
                    <h4 className="font-semibold text-primary-800 mb-1">{dict.knowledge.review.ai_summary}</h4>
                    <p className="text-sm text-primary-700 leading-relaxed">{metadata.summary || dict.knowledge.review.no_summary}</p>

                    {metadata.governance && (
                        <div className="mt-4 pt-3 border-t border-primary-100 grid grid-cols-2 gap-3">
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-primary-400 font-bold">{dict.knowledge.review.domain}</span>
                                <span className="text-xs text-primary-900">{metadata.governance.domain || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-primary-400 font-bold">{dict.knowledge.review.artifact}</span>
                                <span className="text-xs text-primary-900 font-mono italic">{metadata.governance.artifact || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-primary-400 font-bold">{dict.knowledge.review.owner}</span>
                                <span className="text-xs text-primary-900">{metadata.governance.owner || '-'}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-primary-400 font-bold">{dict.knowledge.review.version}</span>
                                <span className="text-xs text-primary-900 font-mono">{metadata.governance.version || '-'}</span>
                            </div>
                        </div>
                    )}
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
