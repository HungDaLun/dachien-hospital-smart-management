'use client';

import React, { useState } from 'react';
import { WatchTopic } from '@/lib/war-room/types';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, Input } from '@/components/ui';
import { Trash2, Edit2, X } from 'lucide-react';

interface WatchTopicManagerProps {
    initialTopics?: WatchTopic[];
    userId: string;
}

export default function WatchTopicManager({ initialTopics = [], userId }: WatchTopicManagerProps) {
    const [topics, setTopics] = useState<WatchTopic[]>(initialTopics);
    const [isAdding, setIsAdding] = useState(false);
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

    // Form State
    const [newTopicName, setNewTopicName] = useState('');
    const [newTopicKeywords, setNewTopicKeywords] = useState('');
    const [newTopicThreshold, setNewTopicThreshold] = useState<'low' | 'medium' | 'high'>('low');
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenEdit = (topic: WatchTopic) => {
        setEditingTopicId(topic.id);
        setNewTopicName(topic.name);
        setNewTopicKeywords(topic.keywords.join(', '));
        setNewTopicThreshold(topic.risk_threshold as any || 'low');
        setIsAdding(true);
    };

    const handleSaveTopic = async () => {
        if (!newTopicName.trim()) return;

        setIsSaving(true);
        const supabase = createClient();

        let updatedTopics: WatchTopic[];

        if (editingTopicId) {
            // Update existing
            updatedTopics = topics.map(t => t.id === editingTopicId ? {
                ...t,
                name: newTopicName,
                keywords: newTopicKeywords.split(/[,，、]/).map(k => k.trim()).filter(k => k),
                risk_threshold: newTopicThreshold
            } : t);
        } else {
            // Add new
            const newTopic: WatchTopic = {
                id: crypto.randomUUID(),
                name: newTopicName,
                keywords: newTopicKeywords.split(/[,，、]/).map(k => k.trim()).filter(k => k),
                competitors: [],
                suppliers: [],
                risk_threshold: newTopicThreshold
            };
            updatedTopics = [...topics, newTopic];
        }

        // Optimistic Update
        setTopics(updatedTopics);

        // Persist to Supabase
        const { data: config } = await supabase
            .from('war_room_config')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (config) {
            await supabase
                .from('war_room_config')
                .update({ watch_topics: updatedTopics })
                .eq('user_id', userId);
        } else {
            await supabase
                .from('war_room_config')
                .insert({
                    user_id: userId,
                    watch_topics: updatedTopics
                });
        }

        setIsSaving(false);
        setIsAdding(false);
        setEditingTopicId(null);
        setNewTopicName('');
        setNewTopicKeywords('');
        setNewTopicThreshold('low');
    };

    const handleDeleteTopic = async (id: string) => {
        if (!confirm('確定要刪除此監控主題嗎？這將停止接收相關情報。')) return;

        const updatedTopics = topics.filter(t => t.id !== id);
        setTopics(updatedTopics);

        const supabase = createClient();
        await supabase
            .from('war_room_config')
            .update({ watch_topics: updatedTopics })
            .eq('user_id', userId);
    };

    const getRiskLabel = (threshold: string) => {
        switch (threshold) {
            case 'high': return '預警門檻：高';
            case 'medium': return '預警門檻：中';
            case 'low': return '預警門檻：低';
            default: return threshold;
        }
    };

    return (
        <>
            <div className="p-10 rounded-3xl mb-12 bg-background-secondary/30 border border-white/5 backdrop-blur-sm relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

                <div className="flex justify-between items-end mb-10 pb-6 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary-500 rounded-full" />
                            🌐 外部情報監控主題
                        </h2>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mt-2">External Intelligence Monitoring Matrix</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingTopicId(null);
                            setNewTopicName('');
                            setNewTopicKeywords('');
                            setNewTopicThreshold('low');
                            setIsAdding(true);
                        }}
                        variant="cta"
                        size="sm"
                        className="shadow-glow-cyan/20 px-6 font-black uppercase tracking-widest text-[10px]"
                    >
                        + 新增監控主題
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.length > 0 ? topics.map(topic => (
                        <Card
                            key={topic.id}
                            variant="glass"
                            className="p-6 rounded-2xl border border-white/5 relative group hover:border-primary-500/30 transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.03]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-black text-lg text-text-primary tracking-tight group-hover:text-primary-400 transition-colors">{topic.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border
                                        ${topic.risk_threshold === 'high' ? 'bg-semantic-danger/10 text-semantic-danger border-semantic-danger/20' :
                                                topic.risk_threshold === 'medium' ? 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20' :
                                                    'bg-semantic-success/10 text-semantic-success border-semantic-success/20'}
                                    `}
                                    >
                                        {getRiskLabel(topic.risk_threshold || 'low')}
                                    </span>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenEdit(topic)}
                                            className="p-1.5 rounded-lg bg-white/5 text-text-tertiary hover:text-white hover:bg-white/10 transition-all"
                                            title="編輯"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteTopic(topic.id);
                                            }}
                                            className="p-1.5 rounded-lg bg-semantic-danger/10 text-semantic-danger hover:bg-semantic-danger/20 transition-all"
                                            title="刪除"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <span className="w-3 h-px bg-white/10" /> 監控關鍵字
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(topic.keywords || []).map((k: string, i: number) => (
                                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-text-secondary border border-white/5">{k}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-20 bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
                            <div className="text-4xl mb-4 opacity-10">📡</div>
                            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">目前沒有設定任何監控主題</p>
                        </div>
                    )}
                </div>
            </div>
            {
                isAdding && (
                    <div className="fixed inset-0 bg-background-primary/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-300">
                        <Card variant="glass" className="p-10 rounded-3xl w-full max-w-[500px] border border-white/10 shadow-glow-cyan/10 scale-in-center">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                        {editingTopicId ? '編輯監控配置' : '新增監控主題'}
                                    </h3>
                                </div>
                                <button onClick={() => setIsAdding(false)} className="text-text-tertiary hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-text-secondary mb-8 font-medium">配置 AI 代理人持續追蹤的外部情報領域與關鍵信號。</p>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-[10px] font-black text-text-tertiary mb-2 uppercase tracking-widest">主題名稱</label>
                                    <Input
                                        fullWidth
                                        placeholder="例如：半導體供應鏈變動"
                                        value={newTopicName}
                                        onChange={(e) => setNewTopicName(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white h-12"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-text-tertiary mb-2 uppercase tracking-widest">核心關鍵字 (以逗號分隔)</label>
                                    <Input
                                        fullWidth
                                        placeholder="例如：晶片短缺, ASML, 台積電, EUV"
                                        value={newTopicKeywords}
                                        onChange={(e) => setNewTopicKeywords(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white h-12"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-text-tertiary mb-2 uppercase tracking-widest">預警靈敏度 (影響門檻)</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 text-white h-12 rounded-xl px-4 text-sm focus:outline-none focus:border-primary-500/50 appearance-none"
                                        value={newTopicThreshold}
                                        onChange={(e: any) => setNewTopicThreshold(e.target.value)}
                                    >
                                        <option value="low" className="bg-background-secondary text-white">低 (僅通知重大危機)</option>
                                        <option value="medium" className="bg-background-secondary text-white">中 (標準情資預警)</option>
                                        <option value="high" className="bg-background-secondary text-white">高 (捕捉細微市場變動)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <Button
                                    onClick={() => setIsAdding(false)}
                                    variant="outline"
                                    className="font-black uppercase tracking-widest text-[10px] px-6"
                                    disabled={isSaving}
                                >
                                    取消
                                </Button>
                                <Button
                                    onClick={handleSaveTopic}
                                    variant="cta"
                                    className="font-black uppercase tracking-widest text-[10px] px-8 shadow-glow-cyan/20"
                                    disabled={isSaving || !newTopicName}
                                    loading={isSaving}
                                >
                                    {isSaving ? '同步中...' : editingTopicId ? '保存配置' : '確認部署配置'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
        </>
    );
}
