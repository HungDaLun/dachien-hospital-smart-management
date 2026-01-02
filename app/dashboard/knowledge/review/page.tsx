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
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📑 Knowledge Review Queue</h1>
                    <p className="text-gray-600">Review AI-processed documents before publishing.</p>
                </div>
                <Link href="/dashboard/knowledge">
                    <Button variant="outline">Back to Library</Button>
                </Link>
            </div>

            {!files || files.length === 0 ? (
                <Card className="p-12 text-center text-gray-500">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-medium">All caught up!</h3>
                    <p>No documents pending review.</p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {files.map((file) => (
                        <Card key={file.id} className="hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-amber-50 rounded-lg flex items-center justify-center text-2xl">
                                        📄
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{file.filename}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span>by {file.user_profiles?.display_name || 'Unknown'}</span>
                                            <span>•</span>
                                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <Badge variant="warning">Needs Review</Badge>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/dashboard/knowledge/review/${file.id}`}>
                                    <Button>Review Now →</Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
