'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, Card, CardHeader, CardTitle, CardBody as CardContent, CardFooter, Textarea, useToast, Input } from '@/components/ui';
import { Users, User, Briefcase, Play, Clock, Settings, Calendar } from 'lucide-react';
import { addDays, format, setHours, setMinutes, isSameDay } from 'date-fns';
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
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
    const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);
    const [duration, setDuration] = useState([5]);
    const [isScheduled, setIsScheduled] = useState(false);

    // Custom Date Picker State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [scheduledTime, setScheduledTime] = useState('');

    const upcomingDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00", "17:30", "18:00", "19:00", "20:00", "21:00"
    ];

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        updateScheduledTime(date, selectedTimeSlot);
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTimeSlot(time);
        updateScheduledTime(selectedDate, time);
    };

    const updateScheduledTime = (date: Date, time: string) => {
        if (!date || !time) return;
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = setMinutes(setHours(date, hours), minutes);
        setScheduledTime(newDate.toISOString());
    };

    const handleCreate = async () => {
        if (!title.trim() && !topic.trim()) {
            toast.error('請至少輸入會議名稱或議案');
            return;
        }

        if (selectedDepts.length === 0 && selectedConsultants.length === 0) {
            toast.error('請至少選擇一個參與者');
            return;
        }

        if (isScheduled && !scheduledTime) {
            toast.error('請選擇預定開始時間');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title || topic,
                    topic: topic || title,
                    departmentIds: selectedDepts,
                    consultantAgentIds: selectedConsultants,
                    durationMinutes: duration[0],
                    scheduledStartTime: isScheduled ? scheduledTime : undefined
                })
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            router.push(`/meetings/${data.id}`);
        } catch (error: any) {
            toast.error('建立會議失敗: ' + error.message);
            setCreating(false);
        }
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
        if (!isoString) return '請選擇時間...';
        const date = new Date(isoString);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getRelativeTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diff = date.getTime() - now.getTime();

        if (diff <= 0) return '時間已過，將立即開始';

        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `約 ${minutes} 分鐘後開始`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `約 ${hours} 小時 ${mins} 分鐘後開始`;
    };

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">發起戰略會議</h1>
                <p className="text-muted-foreground">定義人、事、時，讓 Agent 團隊為您進行沙盤推演。</p>
            </div>

            <div className="grid gap-6">
                {/* Topic Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> 會議主題 (事)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full gap-2">
                            <label htmlFor="title" className="text-sm font-medium leading-none">會議名稱</label>
                            <Input
                                id="title"
                                placeholder="例如：2026 年度預算審查會議"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid w-full gap-2">
                            <label htmlFor="topic" className="text-sm font-medium leading-none">討論議案 (Agent 將根據此內容發言)</label>
                            <Textarea
                                id="topic"
                                placeholder="詳細描述需要討論的背景、限制條件與目標..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Participants */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Departments */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> 參與部門 (人)</CardTitle>
                            <p className="text-sm text-muted-foreground">選擇代表公司內部立場的部門</p>
                        </CardHeader>
                        <CardContent className="h-[200px] overflow-y-auto space-y-2">
                            {loading ? <p className="text-sm text-muted-foreground">載入中...</p> :
                                departments.length === 0 ? <p className="text-sm text-muted-foreground">無可用部門</p> :
                                    departments.map(dept => (
                                        <div key={dept.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={dept.id}
                                                checked={selectedDepts.includes(dept.id)}
                                                onChange={() => toggleDept(dept.id)}
                                            />
                                            <label htmlFor={dept.id} className="cursor-pointer font-medium text-sm">{dept.name}</label>
                                        </div>
                                    ))}
                        </CardContent>
                    </Card>

                    {/* Consultants */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> 顧問 Agent (人)</CardTitle>
                            <p className="text-sm text-muted-foreground">邀請您的 AI 代理作為外部專家</p>
                        </CardHeader>
                        <CardContent className="h-[200px] overflow-y-auto space-y-2">
                            {loading ? <p className="text-sm text-muted-foreground">載入中...</p> :
                                agents.length === 0 ? <p className="text-sm text-muted-foreground">無可用 Agent。請先至「智能代理」建立。</p> :
                                    agents.map(agent => (
                                        <div key={agent.id} className="flex items-start space-x-2">
                                            <Checkbox
                                                id={agent.id}
                                                checked={selectedConsultants.includes(agent.id)}
                                                onChange={() => toggleConsultant(agent.id)}
                                            />
                                            <div className="grid gap-0.5">
                                                <label htmlFor={agent.id} className="cursor-pointer font-medium text-sm flex items-center gap-1">
                                                    {agent.avatar_url && <span className="text-xs">🤖</span>}
                                                    {agent.name}
                                                </label>
                                                <span className="text-xs text-muted-foreground line-clamp-1">{agent.description}</span>
                                            </div>
                                        </div>
                                    ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> 會議設定 (時)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-medium"><Clock className="w-4 h-4" /> 會議時長 (分鐘)</label>
                                <span className="text-sm font-medium">{duration[0]} 分鐘</span>
                            </div>
                            <input
                                type="range"
                                min="3"
                                max="30"
                                step="1"
                                value={duration[0]}
                                onChange={(e) => setDuration([parseInt(e.target.value)])}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />

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

                                        {/* Time Selection */}
                                        <div className="space-y-2">
                                            <span className="text-xs font-medium text-muted-foreground">選擇開始時間</span>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                {timeSlots.map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => handleTimeSelect(time)}
                                                        className={cn(
                                                            "py-2 px-1 text-sm rounded-lg border text-center transition-all",
                                                            selectedTimeSlot === time
                                                                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                                                                : "bg-card hover:bg-accent hover:border-accent-foreground/30 text-foreground/80 border-border"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
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
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button size="lg" onClick={handleCreate} disabled={creating || loading} className="w-full md:w-auto shadow-lg shadow-primary/20">
                            {creating ? '處理中...' :
                                isScheduled ? <><Calendar className="w-4 h-4 mr-2" />確認預約</> :
                                    <><Play className="w-4 h-4 mr-2" /> 立即開始會議</>
                            }
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
