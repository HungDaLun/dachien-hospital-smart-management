'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Card, CardHeader, CardTitle, CardBody as CardContent, CardFooter, useToast, Input, Textarea } from '@/components/ui';
import { Users, User, Briefcase, Play, Clock, Settings, Calendar, FileText } from 'lucide-react';
import { addDays, format, setHours, setMinutes, isSameDay, formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Department {
    id: string;
    name: string;
}

interface Agent {
    id: string;
    name: string;
    description: string;
    avatar_url: string | null;
}

interface MeetingSetupProps {
    initialDepartments: Department[];
    initialAgents: Agent[];
}

export default function MeetingSetup({ initialDepartments, initialAgents }: MeetingSetupProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [departments] = useState<Department[]>(initialDepartments);
    const [agents] = useState<Agent[]>(initialAgents);
    const [loading] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form State
    const [mode, setMode] = useState<'quick_sync' | 'deep_dive' | 'result_driven'>('quick_sync');
    const [title, setTitle] = useState('');
    const [agenda, setAgenda] = useState('');
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
    const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);
    const [duration, setDuration] = useState([5]);
    const [isScheduled, setIsScheduled] = useState(false);

    // Custom Date Picker State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [scheduledTime, setScheduledTime] = useState('');

    const upcomingDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
    // 24 小時制時間選項
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 00, 05, 10, 15... 55

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        updateScheduledTime(date, selectedTimeSlot);
    };

    const handleTimeSelect = (hour: string, minute: string) => {
        const time = `${hour}:${minute}`;
        setSelectedTimeSlot(time);
        updateScheduledTime(selectedDate, time);
    };

    const updateScheduledTime = (date: Date, time: string) => {
        if (!date || !time) return;
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = setMinutes(setHours(date, hours), minutes);
        setScheduledTime(newDate.toISOString());
    };

    const toggleDept = (id: string) => {
        if (selectedDepts.includes(id)) {
            setSelectedDepts(selectedDepts.filter(d => d !== id));
        } else {
            setSelectedDepts([...selectedDepts, id]);
        }
    };

    const toggleConsultant = (id: string) => {
        if (selectedConsultants.includes(id)) {
            setSelectedConsultants(selectedConsultants.filter(c => c !== id));
        } else {
            setSelectedConsultants([...selectedConsultants, id]);
        }
    };

    const formatScheduledDate = (isoString: string) => {
        if (!isoString) return '';
        return format(new Date(isoString), 'MM/dd HH:mm');
    };

    const getRelativeTime = (isoString: string) => {
        if (!isoString) return '';
        return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: zhTW });
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            toast.error('請輸入會議主題');
            return;
        }
        if (!agenda.trim()) {
            toast.error('請輸入會議討論內容');
            return;
        }
        if (selectedDepts.length === 0 && selectedConsultants.length === 0) {
            toast.error('請至少選擇一個參與部門或顧問');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    topic: agenda, // Legacy API expects 'topic' as the content/context
                    departmentIds: selectedDepts,
                    consultantAgentIds: selectedConsultants,
                    durationMinutes: duration[0],
                    scheduledStartTime: isScheduled ? scheduledTime : undefined,
                    mode: mode
                })
            });

            if (!res.ok) throw new Error('Failed to create meeting');

            const data = await res.json();
            toast.success('會議已建立，正在進入會議室...');
            router.push(`/meetings/${data.id}`);
        } catch (error: any) {
            toast.error('建立失敗: ' + error.message);
            setCreating(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar w-full">
            <div className="p-6 space-y-8 max-w-7xl mx-auto w-full">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">發起新會議</h1>
                    <p className="text-muted-foreground">配置您的 AI 戰略會議，選擇參與顧問與討論模式。</p>
                </div>

                <div className="grid gap-6">
                    {/* Topic */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> 會議主題</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                placeholder="例如：2024 Q1 行銷策略規劃..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-lg"
                            />
                        </CardContent>
                    </Card>

                    {/* Agenda / Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> 會議內容</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="請在此輸入會議背景資訊、討論重點或具體問題..."
                                value={agenda}
                                onChange={(e) => setAgenda(e.target.value)}
                                className="min-h-[120px]"
                                fullWidth
                            />
                        </CardContent>
                    </Card>

                    {/* Participants */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> 參與陣容</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Departments */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">核心部門 (Knowledge Base)</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {departments.map((dept) => (
                                        <div
                                            key={dept.id}
                                            onClick={() => toggleDept(dept.id)}
                                            className={cn(
                                                "cursor-pointer rounded-lg border p-3 flex items-center justify-between transition-all hover:bg-muted/50",
                                                selectedDepts.includes(dept.id) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                <span className="font-medium text-sm">{dept.name}</span>
                                            </div>
                                            <Checkbox checked={selectedDepts.includes(dept.id)} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Agents */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground">AI 專家顧問 (Personality)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {agents.map((agent) => (
                                        <div
                                            key={agent.id}
                                            onClick={() => toggleConsultant(agent.id)}
                                            className={cn(
                                                "cursor-pointer rounded-lg border p-3 flex items-start gap-3 transition-all hover:bg-muted/50",
                                                selectedConsultants.includes(agent.id) ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                                            )}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User className="w-4 h-4 text-purple-500" />
                                                    <span className="font-bold text-sm">{agent.name}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                                            </div>
                                            <Checkbox checked={selectedConsultants.includes(agent.id)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> 會議設定 (時)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Mode Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">會議模式</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div
                                        onClick={() => {
                                            setMode('quick_sync');
                                            setDuration([5]);
                                        }}
                                        className={cn(
                                            "cursor-pointer flex items-start justify-between p-3 rounded-lg border text-left transition-all",
                                            mode === 'quick_sync' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex-1 mr-2">
                                            <span className="font-bold text-sm block">⚡ 快速同步</span>
                                            <span className="text-xs text-muted-foreground mt-1 block">時間導向。適合日常資訊同步，時間到強制收斂。</span>
                                        </div>
                                        <Checkbox checked={mode === 'quick_sync'} className="shrink-0 mt-0.5" variant="radio" />
                                    </div>
                                    <div
                                        onClick={() => {
                                            setMode('deep_dive');
                                            setDuration([15]);
                                        }}
                                        className={cn(
                                            "cursor-pointer flex items-start justify-between p-3 rounded-lg border text-left transition-all",
                                            mode === 'deep_dive' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex-1 mr-2">
                                            <span className="font-bold text-sm block">🧠 深度研討</span>
                                            <span className="text-xs text-muted-foreground mt-1 block">回合導向。適合專案檢討，主席會引導每人充分發言。</span>
                                        </div>
                                        <Checkbox checked={mode === 'deep_dive'} className="shrink-0 mt-0.5" variant="radio" />
                                    </div>
                                    <div
                                        onClick={() => {
                                            setMode('result_driven');
                                            setDuration([30]);
                                        }}
                                        className={cn(
                                            "cursor-pointer flex items-start justify-between p-3 rounded-lg border text-left transition-all",
                                            mode === 'result_driven' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex-1 mr-2">
                                            <span className="font-bold text-sm block">🎯 戰略決策</span>
                                            <span className="text-xs text-muted-foreground mt-1 block">結果導向。無限回合，直到產出符合 SMART 的行動方案。</span>
                                        </div>
                                        <Checkbox checked={mode === 'result_driven'} className="shrink-0 mt-0.5" variant="radio" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-sm font-medium"><Clock className="w-4 h-4" /> 會議時長 (分鐘)</label>
                                    <span className="text-sm font-medium">{duration[0]} 分鐘</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="60"
                                    step="1"
                                    value={duration[0]}
                                    onChange={(e) => setDuration([parseInt(e.target.value)])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                            </div>

                            <div className="pt-4 border-t space-y-4">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> 啟動方式
                                </label>

                                {/* Mode Selection Tabs */}
                                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                                    <button
                                        onClick={() => setIsScheduled(false)}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all",
                                            !isScheduled ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                                        )}
                                    >
                                        <Play className="w-4 h-4" />
                                        立即開始
                                    </button>
                                    <button
                                        onClick={() => setIsScheduled(true)}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all",
                                            isScheduled ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                                        )}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        預約排程
                                    </button>
                                </div>

                                {isScheduled && (
                                    <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-2">

                                        {/* Date Selection */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium text-muted-foreground">選擇日期</span>
                                                <span className="text-xs font-mono">{format(selectedDate, 'yyyy/MM/dd')}</span>
                                            </div>
                                            <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar snap-x py-1">
                                                {upcomingDates.map((date, i) => {
                                                    const isSelected = isSameDay(date, selectedDate);
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => handleDateSelect(date)}
                                                            className={cn(
                                                                "flex flex-col items-center justify-center min-w-[72px] h-[80px] rounded-xl border transition-all snap-start flex-shrink-0",
                                                                isSelected
                                                                    ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 scale-100"
                                                                    : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:bg-accent/50 scale-95 opacity-80 hover:opacity-100"
                                                            )}
                                                        >
                                                            <span className="text-xs font-medium mb-1">{format(date, 'EEE', { locale: zhTW })}</span>
                                                            <span className="text-2xl font-bold tracking-tight">{format(date, 'd')}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Time Selection - Dropdowns */}
                                        <div className="space-y-2">
                                            <span className="text-xs font-medium text-muted-foreground">選擇開始時間</span>
                                            <div className="flex items-center gap-3">
                                                {/* Hour Dropdown */}
                                                <div className="flex-1">
                                                    <label className="text-xs text-muted-foreground mb-1 block">小時</label>
                                                    <select
                                                        value={selectedTimeSlot.split(':')[0] || ''}
                                                        onChange={(e) => handleTimeSelect(e.target.value, selectedTimeSlot.split(':')[1] || '00')}
                                                        className="w-full h-10 px-3 bg-card border border-border rounded-lg text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>--</option>
                                                        {hours.map((h) => (
                                                            <option key={h} value={h}>{h}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <span className="text-xl font-bold text-muted-foreground mt-5">:</span>

                                                {/* Minute Dropdown */}
                                                <div className="flex-1">
                                                    <label className="text-xs text-muted-foreground mb-1 block">分鐘</label>
                                                    <select
                                                        value={selectedTimeSlot.split(':')[1] || ''}
                                                        onChange={(e) => handleTimeSelect(selectedTimeSlot.split(':')[0] || '00', e.target.value)}
                                                        className="w-full h-10 px-3 bg-card border border-border rounded-lg text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="" disabled>--</option>
                                                        {minutes.map((m) => (
                                                            <option key={m} value={m}>{m}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {scheduledTime && (
                                            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary">
                                                <span>已預約：{formatScheduledDate(scheduledTime)}</span>
                                                <span className="font-bold">{getRelativeTime(scheduledTime)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button size="lg" onClick={handleCreate} disabled={creating || loading} className="w-full md:w-auto shadow-lg shadow-primary/20">
                                {creating ? '處理中...' :
                                    isScheduled ? <><Calendar className="w-4 h-4 mr-2" />確認預約</> :
                                        <><Play className="w-4 h-4 mr-2" /> 安排會議</>
                                }
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
