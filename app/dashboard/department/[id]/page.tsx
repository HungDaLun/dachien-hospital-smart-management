import React from 'react';
import { createClient } from '@/lib/supabase/server';
import DepartmentChatButton from '@/components/war-room/department/DepartmentChatButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function DepartmentWarRoomPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    // 1. Fetch Department Details
    const { data: dept } = await supabase
        .from('departments')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!dept) {
        notFound();
    }

    // 2. Fetch Linked Files
    const { data: files } = await supabase
        .from('files')
        .select('*')
        .eq('department_id', params.id)
        .order('created_at', { ascending: false })
        .limit(10);

    // 3. Generate "Real" Brief
    const fileCount = files?.length || 0;

    // Construct summary from recent files
    interface FileWithMetadata {
        id: string;
        filename: string;
        created_at: string;
        metadata_analysis?: { summary?: string };
    }
    let summaryText = `系統已從 ${dept.name} 的 ${fileCount} 份最近文件中提取關鍵情報。`;
    if (files && files.length > 0) {
        // Find files with summaries
        const filesWithSummary = (files as FileWithMetadata[]).filter((f) => f.metadata_analysis?.summary);
        if (filesWithSummary.length > 0) {
            const keyPoints = filesWithSummary.slice(0, 3).map((f) => f.metadata_analysis?.summary || '').join(' 此外，');
            summaryText += ` 重點發現：${keyPoints}`;
        } else {
            summaryText += " 目前文件尚待 AI 進一步深度解析。";
        }
    }

    const brief = {
        ai_summary: summaryText,
        top_updates: (files as FileWithMetadata[] | null)?.slice(0, 5).map((f) => `新增文件：${f.filename} (${new Date(f.created_at).toLocaleDateString()})`) || [],
        urgent_items: [] as string[]
    };

    return (
        <div
            className="min-h-full p-8 bg-background-primary text-text-primary"
            style={{ minHeight: 'calc(100vh - 65px)' }}
        >
            {/* 背景網格效果 */}
            <div className="war-room-grid fixed inset-0 pointer-events-none z-0 opacity-20" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-8 overflow-hidden">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm font-black text-text-tertiary hover:text-primary-400 transition-all uppercase tracking-[0.2em] group"
                    >
                        <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> 返回總覽
                    </Link>
                </div>

                <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-text-primary mb-2 uppercase tracking-tight">{dept.name} 戰情室</h1>
                        <p className="text-text-secondary font-medium tracking-wide">每日戰術情報簡報 • COMMAND BRIEFING</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <DepartmentChatButton departmentId={dept.id} departmentName={dept.name} />
                    </div>
                </div>

                {/* Daily Brief Card */}
                <div
                    className="p-10 rounded-3xl border border-white/5 mb-10 glass-card relative overflow-hidden"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    }}
                >
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />

                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary-500 shadow-glow-cyan" />
                            <h2 className="text-xl font-black text-primary-400 uppercase tracking-[0.1em]">今日高層簡報</h2>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-text-tertiary bg-white/5 px-3 py-1 rounded-full border border-white/10">{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-[10px] font-black text-text-tertiary mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-4 h-px bg-white/10" /> 執行摘要
                        </h3>
                        <p className="text-xl leading-relaxed text-text-secondary font-medium italic">"{brief.ai_summary}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:border-primary-500/20 transition-colors">
                            <h4 className="text-sm font-black text-secondary-400 mb-6 border-b border-secondary-500/10 pb-4 uppercase tracking-widest flex items-center justify-between">
                                重點更新
                                <span className="text-[10px] bg-secondary-500/10 px-2 py-0.5 rounded">NEW</span>
                            </h4>
                            <ul className="space-y-4">
                                {brief.top_updates.length > 0 ? (
                                    brief.top_updates.map((u: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-text-secondary font-medium group">
                                            <span className="text-secondary-400 group-hover:scale-110 transition-transform">✦</span> {u}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-text-tertiary text-xs italic">無近期更新</li>
                                )}
                            </ul>
                        </div>

                        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 hover:border-semantic-danger/20 transition-colors">
                            <h4 className="text-sm font-black text-semantic-danger mb-6 border-b border-semantic-danger/10 pb-4 uppercase tracking-widest flex items-center justify-between">
                                緊急事項
                                <span className="animate-pulse">⚠️</span>
                            </h4>
                            <ul className="space-y-4">
                                {brief.urgent_items.length > 0 ? (
                                    brief.urgent_items.map((u: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-sm text-text-secondary font-medium group">
                                            <span className="text-semantic-danger group-hover:scale-110 transition-transform">⚠</span> {u}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-text-tertiary text-xs italic">目前無緊急事項</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Files List Snapshot */}
                <div className="rounded-3xl p-8 bg-background-secondary/50 border border-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black text-text-primary uppercase tracking-tight flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                            部門知識庫 ({fileCount})
                        </h3>
                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/10">顯示最近 10 筆</span>
                    </div>

                    {fileCount > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/5 text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">
                                        <th className="pb-4 px-2">檔案名稱</th>
                                        <th className="pb-4 px-2">上傳日期</th>
                                        <th className="pb-4 px-2 text-right">狀態</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {(files as FileWithMetadata[])?.map((file) => (
                                        <tr key={file.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-5 px-2 font-bold text-text-primary tracking-tight group-hover:text-primary-400 transition-colors">{file.filename}</td>
                                            <td className="py-5 px-2 font-mono text-xs text-text-tertiary">{new Date(file.created_at).toLocaleString()}</td>
                                            <td className="py-5 px-2 text-right">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[10px] font-black uppercase tracking-widest">
                                                    已同步
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-text-tertiary bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                            <div className="text-4xl mb-4 opacity-10">📂</div>
                            <p className="text-sm font-bold uppercase tracking-widest">此部門尚無相關連結文件</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
