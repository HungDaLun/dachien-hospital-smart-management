'use client';

import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { Button, Card, useToast } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Play, Pause, Square, Users, MessageSquare, Clock, FileText, X, CheckCircle, Target, ListTodo } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MeetingRoomProps {
    meetingId: string;
}

interface Citation {
    file_name?: string;
    file_id?: string;
}

interface Message {
    id: string;
    speaker_type: string;
    speaker_name: string;
    content: string;
    created_at: string;
    citations?: Citation[];
    metadata?: {
        suspected_hallucinations?: string[];
        warning?: string;
    } | null;
}

interface Participant {
    id: string;
    name: string;
    participant_type: string;
}

interface Meeting {
    id: string;
    title?: string;
    topic: string;
    status: 'scheduled' | 'in_progress' | 'paused' | 'completed';
    scheduled_start_time?: string;
    started_at?: string;
    ended_at?: string;
    duration_minutes?: number;
    current_phase?: string;
    mode?: string;
}

interface MinutesContent {
    recommended_actions?: ActionItem[];
    consensus_points?: string[];
    divergence_points?: string[];
    consultant_insights?: ConsultantInsight[];
}

interface ActionItem {
    action: string;
    responsible_department: string;
    priority: 'high' | 'medium' | 'low';
    smart_specific?: string;
    smart_measurable?: string;
    smart_achievable?: string;
    smart_relevant?: string;
    smart_time_bound?: string;
}

interface ConsultantInsight {
    consultant_name: string;
    role_perspective: string;
    key_insights: string[];
}

interface MinutesData {
    meeting_id: string;
    executive_summary: string;
    content: MinutesContent;
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const { toast } = useToast();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [meeting, setMeeting] = useState<Meeting | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [processing, setProcessing] = useState(false);
    const processingRef = useRef(false); // 用 ref 追蹤 processing 狀態，避免 closure 問題
    const [isEnding, setIsEnding] = useState(false); // 新增：正在結束會議的狀態
    const [endConfirmOpen, setEndConfirmOpen] = useState(false);
    const hasShownEndToast = useRef(false); // Ref to prevent duplicate toasts
    // 串流相關 state
    const [streamingMessage, setStreamingMessage] = useState<string>('');
    const [currentSpeaker, setCurrentSpeaker] = useState<{ name: string; type: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isStreamingRef = useRef(false); // 追蹤是否正在串流中，避免 loadMeeting 覆蓋

    // Minutes State
    const [minutesData, setMinutesData] = useState<MinutesData | null>(null);
    const [showMinutes, setShowMinutes] = useState(false);

    // 倒數計時狀態（每秒更新）
    const [currentTime, setCurrentTime] = useState(Date.now());

    const supabase = createClient();

    useEffect(() => {
        loadMeeting();
        const subscription = supabase
            .channel(`meeting-${meetingId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meeting_messages', filter: `meeting_id=eq.${meetingId}` }, (payload) => {
                // 防止重複：SSE 串流的 'done' 事件可能已經加入了這則訊息
                const newMsg = payload.new as Message;
                setMessages(prev => {
                    const exists = prev.some(m => m.id === newMsg.id);
                    if (exists) return prev; // 避免重複加入，防止閃爍
                    return [...prev, newMsg];
                });
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'meetings', filter: `id=eq.${meetingId}` }, (payload) => {
                setMeeting((prev) => prev ? ({ ...prev, ...payload.new } as Meeting) : null);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'meeting_minutes', filter: `meeting_id=eq.${meetingId}` }, (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    setMinutesData(payload.new as MinutesData);
                    toast.success('會議記錄已生成！');
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [meetingId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 【核心修復】倒數計時器 - 永遠每秒更新 currentTime（只要會議存在且未結束）
    useEffect(() => {
        // 只有在會議存在且處於預約中或進行中時才需要計時
        if (!meeting || (meeting.status !== 'scheduled' && meeting.status !== 'in_progress')) {
            return;
        }

        // 立即更新一次
        setCurrentTime(Date.now());

        // 建立穩定的每秒更新計時器
        const timerId = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timerId);
    }, [meeting?.status]); // 只依賴 status，減少不必要的重建

    // 【獨立】自動啟動檢查 - 依賴 currentTime 變化來觸發
    useEffect(() => {
        if (meeting?.status !== 'scheduled' || !meeting?.scheduled_start_time) return;

        const scheduledTime = new Date(meeting.scheduled_start_time).getTime();

        if (currentTime >= scheduledTime) {
            console.log('[MeetingRoom] 預約時間已到，觸發自動啟動...');
            handleForceStart();
        }
    }, [currentTime, meeting?.status, meeting?.scheduled_start_time]);

    // 自動播放邏輯：當會議變為進行中且尚無訊息時，自動開啟對談
    useEffect(() => {
        if (meeting?.status === 'in_progress' && !isPlaying && !processingRef.current && messages.length === 0) {
            console.log('[MeetingRoom] 會議已啟動且無訊息，自動開始 AI 對話...');
            setIsPlaying(true);
        }
    }, [meeting?.status, messages.length]);

    // Auto-play logic - 使用 ref 來避免 closure 問題
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const scheduleNextTurn = () => {
            // 使用 ref 來檢查真正的 processing 狀態，避免 closure 陷阱
            if (!isPlaying || processingRef.current) {
                // 如果正在處理中，等待後再檢查
                if (isPlaying) {
                    timeoutId = setTimeout(scheduleNextTurn, 1000);
                }
                return;
            }

            // 觸發下一輪，完成後再排程
            triggerNextTurn().finally(() => {
                if (isPlaying) {
                    timeoutId = setTimeout(scheduleNextTurn, 3000);
                }
            });
        };

        if (isPlaying) {
            // 初始延遲後開始
            timeoutId = setTimeout(scheduleNextTurn, 1000);
        }

        return () => clearTimeout(timeoutId);
    }, [isPlaying]); // 只依賴 isPlaying，processing 用 ref 追蹤

    // 會議超時自動結束邏輯
    useEffect(() => {
        if (!meeting || meeting.status !== 'in_progress' || !meeting.started_at || !meeting.duration_minutes) return;

        const checkTimeout = async () => {
            const startTime = new Date(meeting.started_at!).getTime();
            const durationMs = meeting.duration_minutes! * 60 * 1000;
            const endTime = startTime + durationMs;
            const now = Date.now();

            if (now >= endTime) {
                if (hasShownEndToast.current) return; // Prevent multiple toasts
                hasShownEndToast.current = true;

                console.log('[MeetingRoom] 會議時間已到，自動結束會議...');
                setIsPlaying(false);
                setIsEnding(true); // 設置結束狀態，顯示進度條
                toast.info('會議時間已到，正在生成會議記錄...');

                try {
                    const res = await fetch(`/api/meetings/${meetingId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'completed' })
                    });

                    if (res.ok) {
                        setMeeting((prev) => prev ? ({ ...prev, status: 'completed' as const, ended_at: new Date().toISOString() }) : null);
                        toast.success('會議記錄已生成完成！');
                        window.dispatchEvent(new Event('meeting-updated'));
                        loadMeeting(true); // 會議結束，強制重新載入訊息
                        setIsEnding(false); // 結束後關閉進度條
                    }
                } catch (error) {
                    console.error('自動結束會議失敗:', error);
                    setIsEnding(false);
                }
            }
        };

        // 立即檢查一次
        checkTimeout();

        // 每 5 秒檢查一次
        const interval = setInterval(checkTimeout, 5000);

        return () => clearInterval(interval);
    }, [meeting?.id, meeting?.status, meeting?.started_at, meeting?.duration_minutes, meetingId]);

    const loadMeeting = async (forceReloadMessages = false) => {
        const { data: m } = await supabase.from('meetings').select('*').eq('id', meetingId).single();
        if (m) setMeeting(m);

        const { data: parts } = await supabase.from('meeting_participants').select('*').eq('meeting_id', meetingId);
        if (parts) setParticipants(parts);

        // 只有在不在串流中時才重載訊息，避免覆蓋正在串流的內容
        if (!isStreamingRef.current || forceReloadMessages) {
            const { data: msgs } = await supabase.from('meeting_messages').select('*').eq('meeting_id', meetingId).order('sequence_number', { ascending: true });
            if (msgs) setMessages(msgs);
        }

        const { data: mins } = await supabase.from('meeting_minutes').select('*').eq('meeting_id', meetingId).single();
        if (mins) setMinutesData(mins);
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
        // 同時設置 state 和 ref
        setProcessing(true);
        processingRef.current = true;
        isStreamingRef.current = true;

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
                let receivedFullText = ''; // 保存完整的串流文字作為 fallback
                let receivedSpeaker: { name: string; type: string } | null = null;
                let messageAddedSuccessfully = false;

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
                                    receivedSpeaker = {
                                        name: data.speaker_name,
                                        type: data.speaker_type
                                    };
                                    setCurrentSpeaker(receivedSpeaker);
                                } else if (data.type === 'text') {
                                    // 串流文字
                                    receivedFullText += data.content;
                                    setStreamingMessage(prev => prev + data.content);
                                } else if (data.type === 'done' && data.message) {
                                    console.log('[MeetingRoom] 收到 done 事件，訊息 ID:', data.message.id);

                                    // 【關鍵修復】使用 flushSync 確保訊息先被加入，再清除串流
                                    // 這樣可以避免短暫的空白畫面
                                    flushSync(() => {
                                        setMessages(prev => {
                                            const exists = prev.some(m => m.id === data.message.id);
                                            if (exists) {
                                                console.log('[MeetingRoom] 訊息已存在，跳過');
                                                return prev;
                                            }
                                            console.log('[MeetingRoom] 新增訊息到列表');
                                            messageAddedSuccessfully = true;
                                            return [...prev, data.message as Message];
                                        });
                                    });

                                    // 確保訊息已加入後，才清除串流狀態
                                    // 使用微任務確保 React 已經渲染完成
                                    await new Promise(resolve => setTimeout(resolve, 50));

                                    setStreamingMessage('');
                                    setCurrentSpeaker(null);

                                } else if (data.type === 'error') {
                                    throw new Error(data.error);
                                }
                            } catch (parseError) {
                                // 忽略解析錯誤，可能是不完整的 JSON
                                console.warn('[MeetingRoom] SSE 解析錯誤:', parseError);
                            }
                        }
                    }
                }

                // 串流結束後，如果沒有成功加入訊息，嘗試從資料庫重新載入
                if (!messageAddedSuccessfully && receivedFullText) {
                    console.warn('[MeetingRoom] 串流完成但沒有收到 done 事件或訊息加入失敗，重新載入訊息');
                    // 給一點時間讓資料庫寫入完成
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const { data: msgs } = await supabase
                        .from('meeting_messages')
                        .select('*')
                        .eq('meeting_id', meetingId)
                        .order('sequence_number', { ascending: true });
                    if (msgs) {
                        setMessages(msgs);
                    }
                    setStreamingMessage('');
                    setCurrentSpeaker(null);
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
            // 重置所有狀態
            setProcessing(false);
            processingRef.current = false;
            isStreamingRef.current = false;
        }
    };

    const handleStop = async () => {
        setIsPlaying(false);
        setEndConfirmOpen(true);
    };

    const confirmStop = async () => {
        setEndConfirmOpen(false);

        setIsEnding(true); // 開始結束流程
        // Optimistic update to prevent auto-end timer from firing
        setMeeting((prev) => prev ? ({ ...prev, status: 'completed' as const }) : null);

        try {
            await fetch(`/api/meetings/${meetingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' })
            });

            // Ideally generate summary here or navigate to summary view
            toast.success('會議已結束，正在生成會議記錄...');
            await loadMeeting(true); // 會議結束，強制重新載入訊息
            window.dispatchEvent(new Event('meeting-updated'));
            setIsEnding(false); // 結束流程完成
        } catch (error) {
            console.error('Failed to end meeting:', error);
            setIsEnding(false); // 失敗則重置
        }
    };

    const handleForceStart = async () => {
        setIsPlaying(true);
        // Optimistic update
        setMeeting((prev) => prev ? ({ ...prev, status: 'in_progress' as const }) : null);

        await fetch(`/api/meetings/${meetingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'in_progress' })
        });
        window.dispatchEvent(new Event('meeting-updated'));
        loadMeeting(true); // 開始會議，強制重新載入訊息
    };

    if (!meeting) return <div className="p-10 text-center">載入中...</div>;

    // Scheduled View
    if (meeting.status === 'scheduled') {
        const scheduledDate = meeting.scheduled_start_time ? new Date(meeting.scheduled_start_time) : new Date();
        const diff = scheduledDate.getTime() - currentTime;
        const isTimeUp = diff <= 0;

        // 計算倒數時間
        const totalSeconds = Math.max(0, Math.floor(diff / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return (
            <div className="flex flex-col items-center justify-center h-full gap-8 p-10 bg-background-secondary/30 rounded-xl border border-border/50">
                <div className="text-center space-y-4">
                    <div className={`inline-flex p-4 rounded-full mb-4 ${isTimeUp ? 'bg-green-500/10' : 'bg-yellow-500/10 animate-pulse'}`}>
                        <Clock className={`w-12 h-12 ${isTimeUp ? 'text-green-500' : 'text-yellow-500'}`} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{meeting.title || meeting.topic}</h2>
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <p>{isTimeUp ? '會議時間已到' : '會議已排程於'}</p>
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

                    {/* 倒數計時 */}
                    {!isTimeUp && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                            <p className="text-xs text-muted-foreground mb-2">距離自動啟動還有</p>
                            <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold text-primary">
                                {hours > 0 && (
                                    <>
                                        <span className="bg-primary/20 px-3 py-1 rounded">{hours.toString().padStart(2, '0')}</span>
                                        <span>:</span>
                                    </>
                                )}
                                <span className="bg-primary/20 px-3 py-1 rounded">{mins.toString().padStart(2, '0')}</span>
                                <span>:</span>
                                <span className="bg-primary/20 px-3 py-1 rounded">{secs.toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    )}

                    {isTimeUp && (
                        <div className="mt-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20 animate-pulse">
                            <p className="text-green-500 font-medium">⏳ 正在自動啟動會議...</p>
                        </div>
                    )}

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
                    <p>當時間到達時，系統將自動啟動戰略會議。{isTimeUp ? '' : '您無需在此等待。'}</p>
                </div>

                <Button size="lg" onClick={handleForceStart} className="gap-2">
                    <Play className="w-4 h-4" /> 立即開始會議
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-col gap-3 bg-background-secondary p-4 rounded-xl border shadow-sm mb-4 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {meeting.title || meeting.topic}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${meeting.status === 'in_progress' ? 'bg-green-500/10 text-green-500' :
                                meeting.status === 'completed' ? 'bg-gray-500/10 text-gray-500' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                {meeting.status === 'in_progress' ? '進行中' : meeting.status === 'completed' ? '已結束' : '準備中/暫停'}
                            </span>

                            {/* Phase Indicator - Only show for modes that support phases */}
                            {meeting.current_phase && meeting.mode !== 'quick_sync' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold border border-purple-200">
                                    階段: {
                                        meeting.current_phase === 'diverge' ? '擴散 (Diverge)' :
                                            meeting.current_phase === 'debate' ? '辯論 (Debate)' :
                                                meeting.current_phase === 'converge' ? '收斂 (Converge)' :
                                                    meeting.current_phase === 'audit' ? '審計 (SMART Audit)' : meeting.current_phase
                                    }
                                </span>
                            )}
                            {/* 剩餘時間顯示 */}
                            {meeting.status === 'in_progress' && meeting.started_at && meeting.duration_minutes && (() => {
                                const startTime = new Date(meeting.started_at).getTime();
                                const endTime = startTime + meeting.duration_minutes * 60 * 1000;
                                const remaining = Math.max(0, endTime - currentTime);
                                const mins = Math.floor(remaining / 60000);
                                const secs = Math.floor((remaining % 60000) / 1000);
                                return (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${remaining < 60000 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-blue-500/10 text-blue-500'}`}>
                                        ⏱️ {mins}:{secs.toString().padStart(2, '0')}
                                    </span>
                                );
                            })()}
                        </h2>
                        {meeting.title && meeting.topic !== meeting.title && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                議案：{meeting.topic}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isEnding ? (
                            <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl border border-primary/30">
                                {/* 旋轉的載入圖示 */}
                                <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-primary">正在生成會議記錄</span>
                                    <span className="text-xs text-muted-foreground">AI 正在分析對話並提取 SMART 行動計畫...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {meeting.status === 'completed' && (
                                    <Button variant="primary" size="sm" onClick={() => setShowMinutes(true)}>
                                        <FileText className="w-4 h-4 mr-2" /> 查看會議記錄
                                    </Button>
                                )}

                                {(meeting.status === 'in_progress' || meeting.status === 'paused') && (
                                    <>

                                        {/* 1. 開始/暫停/繼續 按鈕 */}
                                        {meeting.status === 'in_progress' && isPlaying ? (
                                            <Button variant="outline" size="sm" onClick={togglePlay} disabled={processing}>
                                                <Pause className="w-4 h-4 mr-2" /> 暫停
                                            </Button>
                                        ) : (
                                            // 尚未開始或已暫停
                                            // 判斷依據：如果有歷史訊息，表示是「暫停中」-> 顯示「繼續」
                                            // 如果沒有歷史訊息，表示是「剛進來」-> 顯示「開始」
                                            messages.length > 0 && meeting.status === 'in_progress' ? (
                                                <Button size="sm" variant="primary" onClick={togglePlay} disabled={processing} className='bg-green-600 hover:bg-green-700'>
                                                    <Play className="w-4 h-4 mr-2" /> 繼續
                                                </Button>
                                            ) : (
                                                <Button size="sm" onClick={handleForceStart} disabled={processing}>
                                                    <Play className="w-4 h-4 mr-2" /> 開始
                                                </Button>
                                            )
                                        )}

                                        {/* 2. 結束按鈕 - 永遠顯示 (除非已結束) */}
                                        <Button variant="danger" size="sm" onClick={handleStop} disabled={processing}>
                                            <Square className="w-4 h-4 mr-2" /> 結束
                                        </Button>
                                    </>
                                )}
                            </>
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
            <Card className="flex-1 overflow-hidden flex flex-col pt-4 rounded-b-none">
                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                    <div className="space-y-6 pb-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.speaker_type === 'user' || msg.speaker_type === 'chairperson' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.speaker_type === 'department' ? 'bg-blue-500/10 text-blue-500' :
                                    msg.speaker_type === 'consultant' ? 'bg-purple-500/10 text-purple-500' :
                                        msg.speaker_type === 'chairperson' ? 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/50' :
                                            'bg-gray-500/10 text-gray-500'
                                    }`}>
                                    {msg.speaker_type === 'department' ? <Users size={14} /> :
                                        msg.speaker_type === 'consultant' ? <MessageSquare size={14} /> :
                                            msg.speaker_type === 'chairperson' ? <Target size={14} /> :
                                                <Users size={14} />}
                                </div>

                                {/* Content */}
                                <div className={`flex flex-col max-w-[80%] ${msg.speaker_type === 'user' || msg.speaker_type === 'chairperson' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-muted-foreground">{msg.speaker_name}</span>
                                        <span className="text-[10px] text-muted-foreground/60">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${msg.speaker_type === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' :
                                        msg.speaker_type === 'chairperson' ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-tr-none dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800' :
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
                                            {msg.citations.map((c, i: number) => (
                                                <div key={i} className="text-[10px] px-2 py-0.5 bg-muted/50 border rounded-md text-muted-foreground">
                                                    📎 {c.file_name || 'Unknown'}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* 幻覺警告 */}
                                    {msg.metadata?.suspected_hallucinations && msg.metadata.suspected_hallucinations.length > 0 && (
                                        <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-md">
                                            <div className="text-[10px] font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1">
                                                ⚠️ 此發言引用的文件未在知識庫中找到：
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {msg.metadata.suspected_hallucinations.map((citation: string, i: number) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded">
                                                        {citation}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* 融合式渲染：將串流訊息視為列表的一部分，但保持其「進行中」的狀態樣式 */}
                        {(currentSpeaker || streamingMessage) && (
                            <div className={`flex gap-3 animate-in fade-in duration-300 ${currentSpeaker?.type === 'chairperson' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${currentSpeaker?.type === 'department' ? 'bg-blue-500/10 text-blue-500' :
                                    currentSpeaker?.type === 'consultant' ? 'bg-purple-500/10 text-purple-500' :
                                        currentSpeaker?.type === 'chairperson' ? 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/50' :
                                            'bg-gray-500/10 text-gray-500'
                                    }`}>
                                    {currentSpeaker?.type === 'department' ? <Users size={14} /> :
                                        currentSpeaker?.type === 'consultant' ? <MessageSquare size={14} /> :
                                            currentSpeaker?.type === 'chairperson' ? <Target size={14} /> :
                                                <Users size={14} />}
                                </div>

                                {/* Content */}
                                <div className={`flex flex-col max-w-[80%] ${currentSpeaker?.type === 'chairperson' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            {currentSpeaker?.name || '發言中...'}
                                        </span>
                                        <span className="text-[10px] text-green-500 animate-pulse">● 發言中</span>
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm transition-all duration-200 ${currentSpeaker?.type === 'chairperson' ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-tr-none dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-800' : 'bg-muted text-foreground rounded-tl-none'}`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown>{streamingMessage || '思考中...'}</ReactMarkdown>
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
            </Card >

            {/* Footer - positioned outside Card for alignment with Sidebar */}
            < div className="h-[52px] flex items-center justify-center border-t border-border/40 bg-muted/20 shrink-0" >
                <div className="text-xs text-muted-foreground">
                    {meeting.status === 'completed' ? '會議已結束' : '您隨時可以發言插話 (Coming Soon)'}
                </div>
            </div >
            {/* Minutes Modal */}
            {
                showMinutes && minutesData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <Card className="w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md">
                            <div className="p-6 border-b flex items-center justify-between shrink-0">
                                <div>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        <Target className="w-6 h-6 text-primary" />
                                        會議結論與行動計畫
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1">SMART 原則導向紀錄</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowMinutes(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                                {/* Executive Summary */}
                                <section className="space-y-3">
                                    <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                                        <FileText className="w-5 h-5" /> 執行摘要
                                    </h2>
                                    <div className="p-4 bg-muted/50 rounded-lg text-sm leading-relaxed border">
                                        {minutesData.executive_summary}
                                    </div>
                                </section>

                                {/* SMART Actions */}
                                <section className="space-y-4">
                                    <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                                        <ListTodo className="w-5 h-5" /> SMART 行動計畫
                                    </h2>
                                    <div className="grid gap-4">
                                        {(minutesData.content.recommended_actions || []).map((action, idx: number) => (
                                            <div key={idx} className="border rounded-xl p-5 bg-background-secondary hover:border-primary/50 transition-colors shadow-sm">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{action.action}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                                                                負責：{action.responsible_department}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${action.priority === 'high' ? 'bg-red-500/10 text-red-600' :
                                                                action.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                                                                    'bg-green-500/10 text-green-600'
                                                                }`}>
                                                                優先級：{action.priority?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-primary block">S (Specific 具體)</span>
                                                        <p className="text-muted-foreground">{action.smart_specific || '(未提及)'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-primary block">M (Measurable 可衡量)</span>
                                                        <p className="text-muted-foreground">{action.smart_measurable || '(未提及)'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-primary block">A (Achievable 可達成)</span>
                                                        <p className="text-muted-foreground">{action.smart_achievable || '(未提及)'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="font-bold text-primary block">R (Relevant 相關)</span>
                                                        <p className="text-muted-foreground">{action.smart_relevant || '(未提及)'}</p>
                                                    </div>
                                                    <div className="col-span-2 pt-2 border-t mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-primary" />
                                                            <span className="font-bold text-primary">T (Time-bound 時限):</span>
                                                            <span className="text-foreground font-medium">{action.smart_time_bound || '(未提及)'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </section >

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Consensus */}
                                    <section className="space-y-3">
                                        <h2 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                                            <CheckCircle className="w-5 h-5" /> 達成共識
                                        </h2>
                                        <ul className="list-none space-y-2">
                                            {(minutesData.content.consensus_points || []).map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-green-500/5">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    {/* Divergence */}
                                    <section className="space-y-3">
                                        <h2 className="text-lg font-semibold flex items-center gap-2 text-orange-600">
                                            <Target className="w-5 h-5" /> 待解決/分歧
                                        </h2>
                                        <ul className="list-none space-y-2">
                                            {(minutesData.content.divergence_points || []).map((point: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-orange-500/5">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>

                                {/* Consultant Insights */}
                                {
                                    minutesData.content.consultant_insights && minutesData.content.consultant_insights.length > 0 && (
                                        <section className="space-y-3 pt-4 border-t">
                                            <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                                                <MessageSquare className="w-5 h-5" /> 專家觀點摘要
                                            </h2>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {minutesData.content.consultant_insights.map((cons, i: number) => (
                                                    <div key={i} className="p-4 border rounded-lg bg-card text-sm">
                                                        <div className="font-bold mb-2 flex items-center gap-2">
                                                            🤖 {cons.consultant_name}
                                                            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                                {cons.role_perspective}
                                                            </span>
                                                        </div>
                                                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                            {cons.key_insights.slice(0, 3).map((insight: string, j: number) => (
                                                                <li key={j}>{insight}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )
                                }

                            </div >
                        </Card >
                    </div >
                )
            }

            <ConfirmDialog
                open={endConfirmOpen}
                title="結束會議"
                description="確定要結束會議嗎？這將會停止所有討論並生成會議記錄。"
                onConfirm={confirmStop}
                onCancel={() => setEndConfirmOpen(false)}
                confirmText="結束會議"
                variant="danger"
                loading={isEnding}
            />
        </div >
    );
}
