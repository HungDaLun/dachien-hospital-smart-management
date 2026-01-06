import React from 'react';
import WatchTopicManager from '@/components/war-room/intelligence/WatchTopicManager';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';

export default function ExternalIntelligencePage() {
    return (
        <div
            className="min-h-full p-8"
            style={{
                backgroundColor: WAR_ROOM_THEME.background.primary,
                color: WAR_ROOM_THEME.text.primary,
                minHeight: 'calc(100vh - 64px)'
            }}
        >
            <div className="max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">外部情報監控</h1>
                    <p style={{ color: WAR_ROOM_THEME.text.secondary }}>
                        即時 AI 監控競爭對手、供應鏈與法規變更。
                    </p>
                </div>

                <WatchTopicManager />

                <h2 className="text-xl font-bold mb-6">最新情報動態</h2>

                <div className="space-y-4">
                    {/* Placeholder for Feed Items */}
                    <div
                        className="p-6 rounded-lg border-l-4"
                        style={{
                            backgroundColor: WAR_ROOM_THEME.background.secondary,
                            borderLeftColor: WAR_ROOM_THEME.semantic.danger
                        }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1 block">重大風險 • 供應鏈</span>
                                <h3 className="text-lg font-bold">主要供應商 XYZ 暫停生產</h3>
                            </div>
                            <span className="text-sm text-gray-500">2 小時前</span>
                        </div>
                        <p className="text-gray-300 mb-4">
                            AI 摘要：XYZ 工廠因罷工暫停生產。預計元件交付將延遲 3 週。
                        </p>
                        <div className="flex gap-4 text-sm">
                            <button className="text-blue-400 hover:underline">查看來源</button>
                            <button className="text-purple-400 hover:underline">詢問 AI Agent</button>
                        </div>
                    </div>

                    <div
                        className="p-6 rounded-lg border-l-4"
                        style={{
                            backgroundColor: WAR_ROOM_THEME.background.secondary,
                            borderLeftColor: WAR_ROOM_THEME.semantic.warning
                        }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wide mb-1 block">中度風險 • 競爭對手</span>
                                <h3 className="text-lg font-bold">競爭對手 ABC 推出 AI 功能</h3>
                            </div>
                            <span className="text-sm text-gray-500">5 小時前</span>
                        </div>
                        <p className="text-gray-300 mb-4">
                            AI 摘要：競爭對手 ABC 已發布其 AI 工具的測試版。早期評論皆為正面。
                        </p>
                        <div className="flex gap-4 text-sm">
                            <button className="text-blue-400 hover:underline">查看來源</button>
                            <button className="text-purple-400 hover:underline">詢問 AI Agent</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
