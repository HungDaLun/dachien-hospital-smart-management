'use client';

import { Modal, Button, Input, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Sparkles, X, RotateCcw, Activity, Tag, FileEdit, Database } from 'lucide-react';
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
        feedback_score?: number;
        feedback_count?: number;
        positive_ratio?: number;
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
    const { toast } = useToast();

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
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(dict.common.error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={dict.knowledge.review.title}
            size="xl"
            footer={
                <div className="flex gap-3 w-full sm:justify-end">
                    <Button variant="outline" onClick={onClose} className="border-white/10 hover:bg-white/5 flex-1 sm:flex-none">
                        {dict.common.cancel}
                    </Button>
                    <Button
                        variant="cta"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none"
                    >
                        {dict.knowledge.review.confirm_apply}
                    </Button>
                </div>
            }
        >
            <div className="space-y-8">
                {/* AI Suggestion Content */}
                <div className="relative group/summary">
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-[24px] blur-xl opacity-0 group-hover/summary:opacity-100 transition-duration-500" />
                    <div className="relative bg-gradient-to-br from-primary-500/[0.08] to-purple-500/[0.08] p-6 rounded-3xl border border-primary-500/20 backdrop-blur-sm shadow-glow-cyan/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                                    <Sparkles size={18} className="animate-pulse-slow" />
                                </div>
                                <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">智能萃取摘要 <span className="opacity-30">|</span> AI SYNTHESIS</h4>
                            </div>
                            <Badge variant="secondary" size="sm" pulse>ANALYZED</Badge>
                        </div>
                        <p className="text-base text-text-primary leading-relaxed font-bold italic">
                            "{metadata.summary || dict.knowledge.review.no_summary}"
                        </p>
                    </div>
                </div>

                {/* Feedback Stats */}
                {metadata.feedback_count !== undefined && metadata.feedback_count > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Intelligence Score', value: `${Math.round((metadata.feedback_score || 0.5) * 100)}%`, icon: Activity, color: 'text-primary-400' },
                            { label: 'Review Samples', value: metadata.feedback_count, icon: Database, color: 'text-purple-400' },
                            { label: 'Truth Alignment', value: `${Math.round((metadata.positive_ratio || 0) * 100)}%`, icon: Sparkles, color: 'text-semantic-success' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <stat.icon size={12} className={stat.color} />
                                    <span className="text-[9px] font-black text-text-tertiary uppercase tracking-wider">{stat.label}</span>
                                </div>
                                <span className="text-xl font-black text-text-primary tabular-nums">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Standardized Filename */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileEdit size={14} className="text-primary-400" />
                            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                                {dict.knowledge.review.standardized_filename}
                            </label>
                        </div>
                        <div className="relative group/fileinput">
                            <Input
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                className="font-mono text-sm pr-12"
                                placeholder="ASSET_NAME_V1_0"
                            />
                            {metadata.suggested_filename && filename !== metadata.suggested_filename && (
                                <button
                                    onClick={() => setFilename(metadata.suggested_filename!)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary-400 transition-colors"
                                    title={dict.knowledge.review.reset_to_suggestion}
                                >
                                    <RotateCcw size={16} />
                                </button>
                            )}
                        </div>
                        {originalFilename !== filename && (
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[9px] font-black text-text-tertiary uppercase">Original Path:</span>
                                <span className="text-[9px] font-mono text-text-tertiary line-through opacity-50 truncate">{originalFilename}</span>
                            </div>
                        )}
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Database size={14} className="text-purple-400" />
                            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                                {dict.knowledge.review.document_category}
                            </label>
                        </div>
                        <HierarchicalCategorySelect
                            categories={categories}
                            value={categoryId}
                            onChange={setCategoryId}
                            selectSize="md"
                            className="w-full"
                        />
                        {metadata.category_suggestion && !categoryId && (
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[9px] font-black text-text-tertiary uppercase">Suggested Atlas:</span>
                                <span className="text-[10px] font-bold text-primary-400 uppercase">{metadata.category_suggestion}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Governance Metadata Subgrid */}
                <div className="bg-white/[0.02] p-8 rounded-[32px] border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-4 bg-primary-500 rounded-full" />
                        <h5 className="text-xs font-black text-text-primary uppercase tracking-widest">治理協議配置 <span className="text-[9px] text-text-tertiary opacity-40 italic ml-2">GOVERNANCE PROTOCOLS</span></h5>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: dict.knowledge.review.domain, value: govDomain, setter: setGovDomain, placeholder: 'Audience/Tech' },
                            { label: dict.knowledge.review.version, value: govVersion, setter: setGovVersion, placeholder: 'v1.0' },
                            { label: dict.knowledge.review.owner, value: govOwner, setter: setGovOwner, placeholder: 'Dept/Team' },
                            { label: dict.knowledge.review.artifact, value: govArtifact, setter: setGovArtifact, placeholder: 'Persona/SOP' }
                        ].map((field, i) => (
                            <div key={i} className="space-y-1.5">
                                <label className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.15em] opacity-60 ml-0.5">{field.label}</label>
                                <Input
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    inputSize="sm"
                                    placeholder={field.placeholder}
                                    className="bg-black/20"
                                />
                            </div>
                        ))}
                    </div>

                    <hr className="border-white/5" />

                    {/* Tags Matrix */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag size={13} className="text-text-tertiary" />
                                <label className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">
                                    {dict.knowledge.review.governance_tags}
                                </label>
                            </div>
                            {metadata.topics && metadata.topics.length > 0 && (
                                <span className="text-[9px] font-bold text-text-tertiary italic opacity-40">AI Detected: {metadata.topics.join(', ')}</span>
                            )}
                        </div>
                        <div className="min-h-[100px] p-4 bg-black/20 rounded-2xl border border-white/5 group focus-within:border-primary-500/30 transition-all">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {tags.map((tag, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        className="bg-white/5 border-white/10 text-text-secondary pr-1.5 group/tag hover:border-primary-500/30 transition-all"
                                    >
                                        #{tag}
                                        <button
                                            onClick={() => handleRemoveTag(i)}
                                            className="ml-1 opacity-40 hover:opacity-100 hover:text-semantic-danger transition-all"
                                        >
                                            <X size={12} />
                                        </button>
                                    </Badge>
                                ))}
                                {tags.length === 0 && (
                                    <span className="text-[10px] text-text-tertiary italic uppercase tracking-widest p-1 opacity-30">Pending tag synchronization...</span>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder={dict.knowledge.review.add_tag_placeholder}
                                className="w-full text-xs font-medium outline-none bg-transparent text-text-primary placeholder:text-text-tertiary/30"
                                onKeyDown={handleAddTag}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
