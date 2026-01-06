import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';
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
    let summaryText = `系統已從 ${dept.name} 的 ${fileCount} 份最近文件中提取關鍵情報。`;
    if (files && files.length > 0) {
        // Find files with summaries
        const filesWithSummary = files.filter((f: any) => f.metadata_analysis?.summary);
        if (filesWithSummary.length > 0) {
            const keyPoints = filesWithSummary.slice(0, 3).map((f: any) => f.metadata_analysis.summary).join(' 此外，');
            summaryText += ` 重點發現：${keyPoints}`;
        } else {
            summaryText += " 目前文件尚待 AI 進一步深度解析。";
        }
    }

    const brief = {
        ai_summary: summaryText,
        top_updates: files?.slice(0, 5).map((f: any) => `新增文件：${f.filename} (${new Date(f.created_at).toLocaleDateString()})`) || [],
        urgent_items: []
    };

    return (
        <div
            className="min-h-full p-8"
            style={{
                backgroundColor: WAR_ROOM_THEME.background.primary,
                color: WAR_ROOM_THEME.text.primary,
                minHeight: 'calc(100vh - 64px)'
            }}
        >
            <div className="max-w-[1200px] mx-auto">
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="mr-2">←</span> 返回總覽
                    </Link>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{dept.name} 戰情室</h1>
                        <p className="text-gray-400">每日情報簡報</p>
                    </div>
                    <DepartmentChatButton departmentId={dept.id} departmentName={dept.name} />
                </div>

                {/* Daily Brief Card */}
                <div
                    className="p-8 rounded-lg border mb-8"
                    style={{
                        backgroundColor: WAR_ROOM_THEME.background.secondary,
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}
                >
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-blue-400">今日高層簡報</h2>
                        <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold text-white mb-2 uppercase text-sm tracking-wider">執行摘要</h3>
                        <p className="text-lg leading-relaxed text-gray-300">{brief.ai_summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-black/20 p-4 rounded">
                            <h4 className="font-bold text-green-400 mb-3 border-b border-green-400/20 pb-2">重點更新</h4>
                            <ul className="space-y-2">
                                {brief.top_updates.length > 0 ? (
                                    brief.top_updates.map((u: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-gray-300">
                                            <span className="text-green-500">✓</span> {u}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500">無近期更新</li>
                                )}
                            </ul>
                        </div>

                        <div className="bg-black/20 p-4 rounded">
                            <h4 className="font-bold text-red-400 mb-3 border-b border-red-400/20 pb-2">緊急事項</h4>
                            <ul className="space-y-2">
                                {brief.urgent_items.length > 0 ? (
                                    brief.urgent_items.map((u: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-gray-300">
                                            <span className="text-red-500">⚠</span> {u}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500">目前無緊急事項</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Files List Snapshot */}
                <div className="rounded-lg p-6" style={{ backgroundColor: WAR_ROOM_THEME.background.secondary }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">部門知識庫 ({fileCount})</h3>
                        <span className="text-xs text-gray-500">顯示最近 10 筆</span>
                    </div>

                    {fileCount > 0 ? (
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="border-b border-gray-700 pb-2">
                                <tr>
                                    <th className="pb-2">檔案名稱</th>
                                    <th className="pb-2">上傳日期</th>
                                    <th className="pb-2">狀態</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files?.map((file: any) => (
                                    <tr key={file.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                        <td className="py-3 text-white">{file.filename}</td>
                                        <td className="py-3">{new Date(file.created_at).toLocaleString()}</td>
                                        <td className="py-3">
                                            <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs">
                                                已同步
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            此部門尚無相關與連結的文件。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
