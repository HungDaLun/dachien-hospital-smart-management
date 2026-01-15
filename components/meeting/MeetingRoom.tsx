'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, useToast } from '@/components/ui';
import { Play, Pause, Square, SkipForward, Users, MessageSquare, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MeetingRoomProps {
    meetingId: string;
}

interface Message {
    id: string;
    speaker_type: string;
    speaker_name: string;
    content: string;
    created_at: string;
    citations?: any[];
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const { toast } = useToast();
    const [participants, setParticipants] = useState<any[]>([]);
    const [meeting, setMeeting] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [processing, setProcessing] = useState(false);
    // 串流相關 state
    const [streamingMessage, setStreamingMessage] = useState<string>('');
    const [currentSpeaker, setCurrentSpeaker] = useState<{ name: string; type: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const supabase = createClient();

    useEffect(() => {
        loadMeeting();
        const subscription = supabase
            .channel(`meeting-${meetingId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meeting_messages', filter: `meeting_id=eq.${meetingId}` }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'meetings', filter: `id=eq.${meetingId}` }, (payload) => {
                setMeeting((prev: any) => ({ ...prev, ...payload.new }));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [meetingId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-play logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && !processing) {
            interval = setInterval(async () => {
                if (processing) return;
                await triggerNextTurn();
            }, 3000); // 3 seconds delay between turns
        }
        return () => clearInterval(interval);
    }, [isPlaying, processing]);

    const loadMeeting = async () => {
        const { data: m } = await supabase.from('meetings').select('*').eq('id', meetingId).single();
        if (m) setMeeting(m);

        const { data: parts } = await supabase.from('meeting_participants').select('*').eq('meeting_id', meetingId);
        if (parts) setParticipants(parts);

        const { data: msgs } = await supabase.from('meeting_messages').select('*').eq('meeting_id', meetingId).order('sequence_number', { ascending: true });
        if (msgs) setMessages(msgs);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const togglePlay = async () => {
        if (!meeting) return;
        const newStatus = isPlaying ? 'paused' : 'in_progress';

        // Optimistic UI
        setIsPlaying(!isPlaying);

        await fetch(`/api/meetings/${meetingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
    };

    const triggerNextTurn = async () => {
        setProcessing(true);
        setStreamingMessage('');
        setCurrentSpeaker(null);

        try {
            const res = await fetch(`/api/meetings/${meetingId}/turn`, { method: 'POST' });

            // 檢查是否為 SSE 串流
            const contentType = res.headers.get('content-type');

            if (contentType?.includes('text/event-stream')) {
                // 處理 SSE 串流
                const reader = res.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) throw new Error('No reader available');

                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    // 解析 SSE 事件
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || ''; // 保留未完成的部分

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));

                                if (data.type === 'speaker') {
                                    // 設定當前發言者
                                    setCurrentSpeaker({
                                        name: data.speaker_name,
                                        type: data.speaker_type
                                    });
                                } else if (data.type === 'text') {
                                    // 串流文字
                                    setStreamingMessage(prev => prev + data.content);
                                } else if (data.type === 'done' && data.message) {
                                    // 完成，加入到 messages 列表
                                    setMessages(prev => {
                                        const exists = prev.some(m => m.id === data.message.id);
                                        if (exists) return prev;
                                        return [...prev, data.message as Message];
                                    });
                                    // 清除串流狀態
                                    setStreamingMessage('');
                                    setCurrentSpeaker(null);
                                } else if (data.type === 'error') {
                                    throw new Error(data.error);
                                }
                            } catch (parseError) {
                                // 忽略解析錯誤，可能是不完整的 JSON
                            }
                        }
                    }
                }
            } else {
                // 非串流回應（null message 表示沒有下一位）
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Turn failed');

                if (data.message) {
                    setMessages(prev => {
                        const exists = prev.some(m => m.id === data.message.id);
                        if (exists) return prev;
                        return [...prev, data.message as Message];
                    });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('發言生成失敗: ' + (error as Error).message);
            setIsPlaying(false);
        } finally {
            setProcessing(false);
            setStreamingMessage('');
            setCurrentSpeaker(null);
        }
    };

    const handleStop = async () => {
        setIsPlaying(false);
        const confirm = window.confirm('確定要結束會議嗎？');
        if (!confirm) return;

        await fetch(`/api/meetings/${meetingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        });

        // Ideally generate summary here or navigate to summary view
        toast.success('會議已結束，您可以查看會議摘要或開始新會議。');
        loadMeeting();
    };

    const handleForceStart = async () => {
        setIsPlaying(true);
        // Optimistic update
        setMeeting((prev: any) => ({ ...prev, status: 'in_progress' }));

        await fetch(`/api/meetings/${meetingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'in_progress' })
        });
        loadMeeting();
    };

    if (!meeting) return <div className="p-10 text-center">載入中...</div>;

    // Scheduled View
    if (meeting.status === 'scheduled') {
        const scheduledDate = meeting.scheduled_start_time ? new Date(meeting.scheduled_start_time) : new Date();
        return (
            <div className="flex flex-col items-center justify-center h-full gap-8 p-10 bg-card/30 rounded-xl border border-border/50">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 rounded-full bg-yellow-500/10 mb-4 animate-pulse">
                        <Clock className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{meeting.title || meeting.topic}</h2>
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <p>會議已排程於</p>
                        <p className="text-2xl font-mono text-foreground font-semibold">
                            {scheduledDate.toLocaleString('zh-TW', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="flex gap-2 justify-center mt-4">
                        {participants.map(p => (
                            <div key={p.id} className="text-xs bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                                {p.participant_type === 'consultant' ? '🤖' : '👥'} {p.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-md text-center text-sm text-muted-foreground bg-muted/50 p-6 rounded-lg">
                    <p>Agent 團隊正在後台分析相關資料與文檔。</p>
                    <p>當時間到達時，系統將自動啟動戰略會議。您無需在線上等待。</p>
                </div>

                <Button size="lg" onClick={handleForceStart} className="gap-2">
                    <Play className="w-4 h-4" /> 立即開始會議
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            {/* Header */}
            <div className="flex flex-col gap-3 bg-card p-4 rounded-xl border shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {meeting.title || meeting.topic}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${meeting.status === 'in_progress' ? 'bg-green-500/10 text-green-500' :
                                meeting.status === 'completed' ? 'bg-gray-500/10 text-gray-500' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                {meeting.status === 'in_progress' ? '進行中' : meeting.status === 'completed' ? '已結束' : '準備中/暫停'}
                            </span>
                        </h2>
                        {meeting.title && meeting.topic !== meeting.title && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                議案：{meeting.topic}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isPlaying ? (
                            <Button variant="outline" size="sm" onClick={togglePlay} disabled={processing}>
                                <Pause className="w-4 h-4 mr-2" /> 暫停
                            </Button>
                        ) : (
                            meeting.status !== 'completed' && (
                                <Button size="sm" onClick={togglePlay} disabled={processing}>
                                    <Play className="w-4 h-4 mr-2" /> 繼續
                                </Button>
                            )
                        )}
                        {meeting.status !== 'completed' && (
                            <Button variant="outline" size="sm" onClick={triggerNextTurn} disabled={isPlaying || processing}>
                                <SkipForward className="w-4 h-4 mr-2" /> 下一位
                            </Button>
                        )}
                        {meeting.status !== 'completed' && (
                            <Button variant="danger" size="sm" onClick={handleStop} disabled={processing}>
                                <Square className="w-4 h-4 mr-2" /> 結束
                            </Button>
                        )}
                    </div>
                </div>

                {/* Participants Bar */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3 overflow-x-auto">
                    <span className="font-semibold flex-shrink-0">出席人員：</span>
                    {participants.map(p => (
                        <div key={p.id} className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded border border-border/50 whitespace-nowrap">
                            <span>{p.participant_type === 'consultant' ? '🤖' : '👥'}</span>
                            <span className="font-medium text-foreground">{p.name}</span>
                        </div>
                    ))}
                    {participants.length === 0 && <span>載入中...</span>}
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 overflow-hidden flex flex-col pt-4">
                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                    <div className="space-y-6 pb-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.speaker_type === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.speaker_type === 'department' ? 'bg-blue-500/10 text-blue-500' :
                                    msg.speaker_type === 'consultant' ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-gray-500/10 text-gray-500'
                                    }`}>
                                    {msg.speaker_type === 'department' ? <Users size={14} /> :
                                        msg.speaker_type === 'consultant' ? <MessageSquare size={14} /> :
                                            <Users size={14} />}
                                </div>

                                {/* Content */}
                                <div className={`flex flex-col max-w-[80%] ${msg.speaker_type === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-muted-foreground">{msg.speaker_name}</span>
                                        <span className="text-[10px] text-muted-foreground/60">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.speaker_type === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' :
                                        'bg-muted text-foreground rounded-tl-none'
                                        }`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                    {/* Citations */}
                                    {msg.citations && Array.isArray(msg.citations) && msg.citations.length > 0 && (
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {msg.citations.map((c: any, i: number) => (
                                                <div key={i} className="text-[10px] px-2 py-0.5 bg-muted/50 border rounded-md text-muted-foreground">
                                                    📎 {c.file_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* 串流中的訊息 */}
                        {(currentSpeaker || streamingMessage) && (
                            <div className="flex gap-3">
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${currentSpeaker?.type === 'department' ? 'bg-blue-500/10 text-blue-500' :
                                    currentSpeaker?.type === 'consultant' ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-gray-500/10 text-gray-500'
                                    }`}>
                                    {currentSpeaker?.type === 'department' ? <Users size={14} /> :
                                        currentSpeaker?.type === 'consultant' ? <MessageSquare size={14} /> :
                                            <Users size={14} />}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col max-w-[80%] items-start">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {currentSpeaker?.name || '發言中...'}
                                        </span>
                                        <span className="text-[10px] text-green-500 animate-pulse">● 發言中</span>
                                    </div>
                                    <div className="p-3 rounded-2xl text-sm bg-muted text-foreground rounded-tl-none">
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            {streamingMessage || <span className="animate-pulse">思考中...</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* 處理中但沒有串流內容時的 fallback */}
                        {processing && !currentSpeaker && !streamingMessage && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm p-4">
                                <span className="animate-pulse">準備下一位發言者...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* User Input (Optional, for interruption) */}
                <div className="p-4 border-t bg-muted/20">
                    {/* Placeholder for user input if needed later */}
                    <div className="text-center text-xs text-muted-foreground">
                        {meeting.status === 'completed' ? '會議已結束' : '您隨時可以發言插話 (Coming Soon)'}
                    </div>
                </div>
            </Card>
        </div>
    );
}
