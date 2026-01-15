'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Plus, Clock, CheckCircle2, ArrowLeft, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface MeetingSummary {
    id: string;
    title: string;
    topic: string;
    status: 'in_progress' | 'completed' | 'paused' | 'scheduled';
    created_at: string;
    scheduled_start_time?: string;
    mode?: string;
    current_phase?: string;
}

export function MeetingSidebar() {
    const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        fetchMeetings();

        // Listen for local updates
        const handleLocalUpdate = () => fetchMeetings();
        window.addEventListener('meeting-updated', handleLocalUpdate);

        // Realtime subscription
        const channel = supabase
            .channel('meetings-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'meetings'
                },
                (payload) => {
                    console.log('Meeting change detected:', payload);
                    fetchMeetings();
                }
            )
            .subscribe();

        // Polling check for scheduled meetings every 30s
        // (Note: The actual active interval is in the other useEffect dependent on [meetings])
        const interval = setInterval(() => {
            // checkScheduledMeetings(meetings); // This captures stale empty array, but keeping interval for now to correspond with cleanup
        }, 30000);

        return () => {
            window.removeEventListener('meeting-updated', handleLocalUpdate);
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, []);

    // Also restart interval when meetings array updates to close over new data? 
    // Actually better to pass meetings to the check function or use a ref.
    // Simplifying: re-run useEffect when meetings change is expensive for subscription.
    // Let's use a separate useEffect for the checker.

    useEffect(() => {
        const interval = setInterval(() => {
            checkScheduledMeetings(meetings);
        }, 30000);
        return () => clearInterval(interval);
    }, [meetings]);

    // Update on route change
    useEffect(() => {
        fetchMeetings();
    }, [pathname]);

    const fetchMeetings = async () => {
        const { data } = await supabase
            .from('meetings')
            .select('id, title, topic, status, created_at, scheduled_start_time, mode, current_phase')
            .order('created_at', { ascending: false });

        if (data) setMeetings(data);
    };

    const checkScheduledMeetings = async (currentMeetings: MeetingSummary[]) => {
        const now = new Date();
        const dueMeetings = currentMeetings.filter(m =>
            m.status === 'scheduled' &&
            m.scheduled_start_time &&
            new Date(m.scheduled_start_time) <= now
        );

        for (const meeting of dueMeetings) {
            console.log(`Starting scheduled meeting: ${meeting.title || meeting.topic}`);
            try {
                // Trigger start
                await fetch(`/api/meetings/${meeting.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'in_progress' })
                });
                // Realtime submission should trigger UI update
            } catch (err) {
                console.error('Failed to auto-start meeting', err);
            }
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('確定要刪除此會議記錄嗎？此動作無法復原。')) return;

        try {
            const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');

            // Optimistic update
            setMeetings(prev => prev.filter(m => m.id !== id));

            // If deleting current meeting, redirect to new meeting
            if (pathname === `/meetings/${id}`) {
                router.push('/meetings');
            }
        } catch (error) {
            console.error(error);
            alert('刪除失敗');
        }
    };

    return (
        <div className="w-80 border-r border-border/40 bg-card/30 flex flex-col h-full">
            {/* Back to Dashboard */}
            <div className="p-4 pb-0">
                <Link href="/dashboard">
                    <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2 w-full hover:bg-muted/50 rounded-lg">
                        <ArrowLeft size={14} />
                        返回儀表板
                    </button>
                </Link>
            </div>

            {/* Header / New Chat Button */}
            <div className="p-4 border-b border-border/40">
                <Link href="/meetings">
                    <button className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20",
                        "group"
                    )}>
                        <div className="p-1.5 bg-primary rounded-lg text-primary-foreground group-hover:scale-110 transition-transform">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                        <span className="font-semibold text-sm">發起新戰略會議</span>
                    </button>
                </Link>
            </div>

            {/* Meeting List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    近期會議
                </div>

                {meetings.map((meeting) => {
                    const isActive = pathname === `/meetings/${meeting.id}`;
                    return (
                        <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                            <div className={cn(
                                "group relative flex flex-col gap-1 p-3 rounded-lg transition-all duration-200 cursor-pointer border border-transparent",
                                isActive
                                    ? "bg-accent/50 border-accent/50 shadow-sm"
                                    : "hover:bg-muted/50 hover:border-border/30"
                            )}>
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className={cn(
                                        "font-medium text-sm truncate w-[160px]",
                                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                    )}>
                                        {meeting.title || meeting.topic || "未命名會議"}
                                    </h3>

                                    <div className="flex items-center gap-2">
                                        {/* Status Indicator */}
                                        {meeting.status === 'in_progress' && (
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                            </span>
                                        )}
                                        {meeting.status === 'completed' && (
                                            <CheckCircle2 size={12} className="text-green-500" />
                                        )}
                                        {meeting.status === 'scheduled' && (
                                            <Clock size={12} className="text-yellow-500" />
                                        )}

                                        {/* Delete Action (Hover only) */}
                                        <div
                                            onClick={(e) => handleDelete(e, meeting.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                                            title="刪除會議"
                                        >
                                            <Trash2 size={14} />
                                        </div>
                                    </div>
                                </div>

                                <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                                    {formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true, locale: zhTW })}
                                    {meeting.mode && (
                                        <span className={cn(
                                            "ml-auto px-1.5 py-0.5 rounded text-[9px] font-medium border",
                                            meeting.mode === 'deep_dive' ? "bg-purple-500/10 text-purple-600 border-purple-200" :
                                                meeting.mode === 'result_driven' ? "bg-blue-500/10 text-blue-600 border-blue-200" :
                                                    "bg-yellow-500/10 text-yellow-600 border-yellow-200"
                                        )}>
                                            {meeting.mode === 'deep_dive' ? '深度' : meeting.mode === 'result_driven' ? '戰略' : '日常'}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </Link>
                    );
                })}

                {meetings.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground text-xs">
                        尚無會議記錄
                    </div>
                )}
            </div>

            {/* User Profile / Footer area placeholder */}
            <div className="h-[52px] flex items-center justify-center border-t border-border/40 text-xs text-muted-foreground/50">
                Nexus Intelligence System v2.0
            </div>
        </div>
    );
}
