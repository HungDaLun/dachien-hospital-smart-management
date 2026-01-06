import React from 'react';
import { WAR_ROOM_THEME } from '@/styles/war-room-theme';

interface KPICardProps {
    title: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down' | 'stable';
    status?: 'success' | 'warning' | 'danger' | 'info';
    icon?: React.ReactNode;
}

export default function KPICard({ title, value, subValue, trend, status = 'info', icon }: KPICardProps) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'success': return WAR_ROOM_THEME.semantic.success;
            case 'warning': return WAR_ROOM_THEME.semantic.warning;
            case 'danger': return WAR_ROOM_THEME.semantic.danger;
            default: return WAR_ROOM_THEME.semantic.info;
        }
    };

    const statusColor = getStatusColor(status);

    return (
        <div
            className="p-6 rounded-lg relative overflow-hidden transition-all hover:translate-y-[-2px]"
            style={{
                backgroundColor: WAR_ROOM_THEME.background.secondary,
                border: WAR_ROOM_THEME.border.default,
                boxShadow: WAR_ROOM_THEME.shadow.card
            }}
        >
            {/* Status Bar Indicator */}
            <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: statusColor }}
            />

            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-medium tracking-wide uppercase" style={{ color: WAR_ROOM_THEME.text.secondary }}>
                    {title}
                </h3>
                {icon && <div className="text-gray-400 opacity-50">{icon}</div>}
            </div>

            <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-white">
                    {value}
                </span>
                {subValue && (
                    <span className="text-sm font-light" style={{ color: WAR_ROOM_THEME.text.tertiary }}>
                        {subValue}
                    </span>
                )}
            </div>

            {trend && (
                <div className="text-xs mt-2 flex items-center gap-1">
                    <span style={{ color: trend === 'up' ? WAR_ROOM_THEME.semantic.success : WAR_ROOM_THEME.semantic.danger }}>
                        {trend === 'up' ? '▲' : '▼'} 趨勢
                    </span>
                </div>
            )}
        </div>
    );
}
