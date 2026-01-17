'use client';

/**
 * 分類管理元件
 * 管理全公司的文件分類架構 (DIKW 語義網路)
 * 遵循 EAKAP 科技戰情室設計系統規範
 */
import React, { useState, useEffect } from 'react';
import { DocumentCategory } from '@/types';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/taxonomy';
import { Button, Input, Textarea, Modal, Card, Badge, ConfirmDialog } from '@/components/ui';
import {
    Plus,
    Edit2,
    Trash2,
    Folder,
    FolderOpen,
    ChevronRight,
    ChevronDown,
    Network,
    Database,
    Binary,
    Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TaxonomyManagerProps {
    initialCategories: DocumentCategory[];
}

export default function TaxonomyManager({ initialCategories }: TaxonomyManagerProps) {
    const [categories, setCategories] = useState<DocumentCategory[]>(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
    const [parentId, setParentId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    // Tree building logic
    interface TreeNode extends DocumentCategory {
        children: TreeNode[];
    }

    const buildTree = (cats: DocumentCategory[]) => {
        const map: Record<string, TreeNode> = {};
        const roots: TreeNode[] = [];

        cats.forEach(c => {
            map[c.id] = { ...c, children: [] };
        });

        cats.forEach(c => {
            if (c.parent_id && map[c.parent_id]) {
                map[c.parent_id].children.push(map[c.id]);
            } else {
                roots.push(map[c.id]);
            }
        });
        return roots;
    };

    const tree = buildTree(categories);

    const handleOpenModal = (parent: string | null = null, category: DocumentCategory | null = null) => {
        setParentId(parent);
        setEditingCategory(category);
        setFormData({
            name: category?.name || '',
            description: category?.description || ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setParentId(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;

        if (editingCategory) {
            const res = await updateCategory(editingCategory.id, {
                name: formData.name,
                description: formData.description
            });
            if (res.success) {
                router.refresh();
            }
        } else {
            const res = await createCategory(formData.name, parentId, formData.description);
            if (res.success) {
                setExpanded(prev => parentId ? ({ ...prev, [parentId]: true }) : prev);
                router.refresh();
            }
        }
        handleCloseModal();
    };

    const handleDeleteClick = (id: string) => {
        setDeleteConfirmId(id);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmId) return;
        const res = await deleteCategory(deleteConfirmId);
        if (res.success) {
            router.refresh();
        }
        setDeleteConfirmId(null);
    };

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderNode = (node: TreeNode, level: number = 0): React.JSX.Element => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded[node.id];

        return (
            <div key={node.id} className="relative select-none">
                <div
                    className={`
                        group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 p-3 rounded-2xl transition-all duration-300
                        ${isExpanded ? 'bg-white/[0.04]' : 'bg-transparent hover:bg-white/[0.02]'}
                        ${level > 0 ? 'ml-4 sm:ml-8' : ''}
                        mb-1 border border-transparent hover:border-white/10
                    `}
                >
                    {/* Indent connector */}
                    {level > 0 && (
                        <div className="absolute left-[-1rem] sm:left-[-2rem] top-0 bottom-1/2 w-4 border-l border-b border-white/10 rounded-bl-xl" />
                    )}

                    {/* Left Section: Expand, Icon, Content */}
                    <div className="flex items-center flex-1 min-w-0">
                        {/* Expand/Collapse */}
                        <button
                            onClick={() => toggleExpand(node.id)}
                            className={`mr-2 p-1.5 rounded-lg transition-all shrink-0 ${!hasChildren ? 'invisible' : 'text-text-tertiary hover:bg-white/5 hover:text-text-primary'}`}
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {/* Icon Node */}
                        <div className={`mr-3 sm:mr-4 p-2 rounded-xl border transition-all duration-500 shrink-0 ${isExpanded ? 'bg-primary-500/10 border-primary-500/20 text-primary-400 shadow-glow-cyan/5' : 'bg-white/5 border-white/5 text-text-tertiary'}`}>
                            {isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />}
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-tight break-words">{node.name}</h3>
                                {level === 0 && <Badge variant="outline" size="sm" className="text-[9px] font-black opacity-30 px-1.5 border-white/5 shrink-0">ROOT_NODE</Badge>}
                            </div>
                            {node.description && <p className="text-[11px] font-bold text-text-tertiary break-words opacity-60 group-hover:opacity-100 transition-opacity mt-0.5">{node.description}</p>}
                        </div>
                    </div>

                    {/* Actions Terminal */}
                    <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-x-2 sm:group-hover:translate-x-0 shrink-0">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(null, node)}
                            className="h-9 w-9 p-0 rounded-xl bg-white/5 border-white/5 hover:bg-white/10 hover:text-primary-400"
                        >
                            <Edit2 size={14} />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(node.id)}
                            className="h-9 w-9 p-0 rounded-xl bg-white/5 border-white/5 hover:bg-white/10 hover:text-secondary-400"
                        >
                            <Plus size={14} />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 rounded-xl bg-white/5 border-white/5 hover:bg-semantic-danger/10 hover:text-semantic-danger"
                            onClick={() => handleDeleteClick(node.id)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>

                {/* Recursive Children Container */}
                {hasChildren && isExpanded && (
                    <div className="pl-2 sm:pl-4 border-l border-white/5 ml-2 sm:ml-4 my-1 space-y-1">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card variant="glass" className="p-4 sm:p-6 lg:p-8 min-h-[600px] border-white/5 relative overflow-hidden w-full">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/[0.02] blur-[100px] pointer-events-none -mr-32 -mt-32" />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 shadow-glow-cyan/5 shrink-0">
                        <Network size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-text-primary uppercase tracking-tight">智庫語義架構 <span className="opacity-30">|</span> TAXONOMY</h2>
                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-1 opacity-60">定義全域知識網絡的維度與階層基準</p>
                    </div>
                </div>
                <Button
                    variant="cta"
                    onClick={() => handleOpenModal(null)}
                    className="h-11 px-6 rounded-xl shadow-glow-cyan/10 shrink-0 w-full sm:w-auto"
                >
                    <Plus size={16} className="mr-2" />
                    <span className="font-black uppercase tracking-widest text-[10px]">建立頂級節點</span>
                </Button>
            </div>

            <div className="bg-black/20 rounded-[32px] border border-white/5 p-4 sm:p-6 shadow-inner min-h-[400px]">
                {tree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-30">
                        <div className="p-6 rounded-3xl border border-dashed border-white/10">
                            <Binary size={48} className="text-text-tertiary" />
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">
                            Awaiting Schema Initialization...
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tree.map(node => renderNode(node))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? '編輯節點配置' : '初始化語義節點'}
                size="md"
            >
                <div className="space-y-6">
                    {/* Context Badge */}
                    {!editingCategory && parentId && (
                        <div className="flex items-center gap-4 p-4 bg-primary-500/[0.03] border border-primary-500/10 rounded-2xl">
                            <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                                <Database size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-0.5">PARENT_IDENTIFIED</p>
                                <p className="text-xs font-bold text-text-secondary">
                                    將於 「{categories.find(c => c.id === parentId)?.name}」 下建立子維度
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <Input
                            label="節點識別名稱 (NODE_NAME)"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={parentId ? "例如：招募與面試協議" : "例如：人力資源管理"}
                            required
                            className="bg-black/20"
                        />
                        <Textarea
                            label="語義定義描述 (SEMANTIC_DEF)"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="描述此節點在全域語義網路中的定位與用途..."
                            rows={4}
                            className="bg-black/20"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5 mt-8">
                        <Button
                            variant="outline"
                            onClick={handleCloseModal}
                            className="h-11 px-8 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest"
                        >
                            取消
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            className="h-11 px-10 rounded-xl shadow-glow-cyan/10 text-[10px] font-black uppercase tracking-widest"
                        >
                            <Sparkles size={16} className="mr-2" />
                            同步變更
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                open={!!deleteConfirmId}
                title="刪除分類"
                description="確定要刪除此分類嗎？此動作將會影響所有關聯文件的語義連結。"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteConfirmId(null)}
                confirmText="確認刪除"
                variant="danger"
            />
        </Card >
    );
}
