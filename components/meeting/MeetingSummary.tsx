'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { FileText, Award, AlertTriangle, Lightbulb } from 'lucide-react';

export default function MeetingSummary({ meetingId: _meetingId }: { meetingId: string }) {
    // Placeholder for summary visualization
    // In a real implementation, this would fetch from 'meeting_minutes' table
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> 會議總結 (預覽)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">會議結束後，系統將在此生成完整的會議記錄與洞察分析。</p>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-xl bg-blue-500/5 border-blue-500/10">
                            <h4 className="font-bold text-blue-500 mb-2 flex items-center gap-2"><Award className="w-4 h-4" /> 達成共識</h4>
                            <p className="text-xs text-muted-foreground">待生成...</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-yellow-500/5 border-yellow-500/10">
                            <h4 className="font-bold text-yellow-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />  主要分歧</h4>
                            <p className="text-xs text-muted-foreground">待生成...</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-purple-500/5 border-purple-500/10">
                            <h4 className="font-bold text-purple-500 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" />  顧問洞見</h4>
                            <p className="text-xs text-muted-foreground">待生成...</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
