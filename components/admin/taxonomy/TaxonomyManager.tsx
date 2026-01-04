'use client';

import React, { useState, useEffect } from 'react';
import { DocumentCategory } from '@/types';
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/taxonomy';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
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
    const router = useRouter();

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    // Tree building logic
    const buildTree = (cats: DocumentCategory[]) => {
        const map: Record<string, DocumentCategory & { children: any[] }> = {};
        const roots: any[] = [];

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
                // Optimistic update or wait for revalidate
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

    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此分類嗎？包含的子分類也會被移除連結（或需要遞迴刪除實作）。')) return;
        const res = await deleteCategory(id);
        if (res.success) {
            router.refresh();
        }
    };

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderNode = (node: DocumentCategory & { children: any[] }, level: number = 0) => {
        const hasChildren = node.children.length > 0;
        const isExpanded = expanded[node.id];

        return (
            <div key={node.id} className="relative select-none">
                <div
                    className={`
            group flex items-center p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors
            ${level > 0 ? 'ml-6' : ''}
          `}
                >
                    {/* Indent connector */}
                    {level > 0 && <div className="absolute left-[-1.5rem] top-1/2 w-4 h-[1px] bg-gray-300" />}

                    {/* Expand/Collapse */}
                    <button
                        onClick={() => toggleExpand(node.id)}
                        className={`mr-2 p-1 rounded-md text-gray-400 hover:text-gray-600 ${!hasChildren ? 'invisible' : ''}`}
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {/* Icon */}
                    <div className="mr-3 text-cyan-600">
                        {isExpanded ? <FolderOpen size={20} /> : <Folder size={20} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="text-gray-900 font-medium">{node.name}</h3>
                        {node.description && <p className="text-gray-500 text-xs">{node.description}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenModal(null, node)} title="編輯">
                            <Edit2 size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenModal(node.id)} title="新增子分類">
                            <Plus size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(node.id)} title="刪除">
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="pl-2 border-l border-gray-100 ml-4">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">分類架構</h2>
                    <p className="text-sm text-gray-500">管理全公司的文件分類標準</p>
                </div>
                <Button onClick={() => handleOpenModal(null)}>
                    <Plus size={16} className="mr-2" />
                    新增主分類
                </Button>
            </div>

            <div className="space-y-1">
                {tree.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        尚未建立任何與知識分類。
                    </div>
                ) : (
                    tree.map(node => renderNode(node))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? '編輯分類' : (parentId ? '新增次分類' : '新增主分類')}
            >
                <div className="space-y-4">
                    {/* 如果是新增次分類，顯示父分類資訊 */}
                    {!editingCategory && parentId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-900">
                                <span className="font-medium">父分類：</span>
                                {categories.find(c => c.id === parentId)?.name || '未知'}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                此分類將成為「{categories.find(c => c.id === parentId)?.name || '未知'}」的子分類
                            </p>
                        </div>
                    )}

                    <Input
                        label="分類名稱"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={parentId ? "例如：招募文件" : "例如：人力資源"}
                        required
                    />
                    <Textarea
                        label="描述"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="描述此分類的用途..."
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={handleCloseModal}>取消</Button>
                        <Button onClick={handleSubmit}>儲存</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
