import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/permissions';
import Link from 'next/link';
import { Badge, Button, Card } from '@/components/ui';

export default async function PendingReviewPage() {
    const supabase = await createClient();
    const profile = await getCurrentUserProfile();


    // Fetch pending files based on user Role
    let query = supabase
        .from('files')
        .select('*, user_profiles(display_name)')
        .eq('gemini_state', 'NEEDS_REVIEW')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (profile.role !== 'SUPER_ADMIN') {
        // Dept Admin sees dept files, Editor sees own files (or dept files if we allow peer review)
        if (profile.department_id) {
            query = query.eq('department_id', profile.department_id);
        } else {
            // If no dept, only see own? or nothing?
            query = query.eq('uploaded_by', profile.id);
        }
    }

    const { data: files } = await query;

    return (
        <div className="space-y-10 p-6 text-text-primary">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary mb-2 uppercase tracking-tight">📑 Knowledge Review Queue</h1>
                    <p className="text-text-secondary font-medium">Review AI-processed documents before publishing to the knowledge base.</p>
                </div>
                <Link href="/dashboard/knowledge">
                    <Button variant="outline" size="sm">Back to Library</Button>
                </Link>
            </div>

            {!files || files.length === 0 ? (
                <Card variant="glass" className="py-20 text-center text-text-tertiary border-dashed border-white/10">
                    <div className="text-6xl mb-6 opacity-20">✅</div>
                    <h3 className="text-xl font-bold text-text-primary mb-2 uppercase tracking-widest">All caught up!</h3>
                    <p className="text-sm">No documents pending review at this time.</p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {files.map((file) => (
                        <Card key={file.id} variant="glass" padding className="group hover:border-primary-500/30 transition-all">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 bg-semantic-warning/10 rounded-xl flex items-center justify-center text-2xl border border-semantic-warning/20 shadow-inner group-hover:scale-110 transition-transform">
                                        📄
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{file.filename}</h3>
                                        <div className="flex items-center gap-3 text-[10px] text-text-tertiary font-bold font-mono uppercase tracking-widest mt-1.5">
                                            <span className="px-2 py-0.5 rounded bg-white/[0.03]">👤 {file.user_profiles?.display_name || 'Unknown'}</span>
                                            <span>•</span>
                                            <span className="px-2 py-0.5 rounded bg-white/[0.03]">📅 {new Date(file.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <Badge variant="warning" className="text-[9px] px-1.5 font-black">Needs Review</Badge>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/dashboard/knowledge/review/${file.id}`}>
                                    <Button variant="cta" size="sm" className="shadow-lg hover:shadow-primary-500/10">Review Now →</Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
