import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/permissions';
import ReviewWorkspace from '@/components/knowledge/ReviewWorkspace';

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const profile = await getCurrentUserProfile();

    const { data: file } = await supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .single();

    if (!file) notFound();

    // Basic permission check
    if (profile.role !== 'SUPER_ADMIN' && file.department_id && file.department_id !== profile.department_id) {
        redirect('/dashboard/knowledge/review'); // Kick out
    }

    // Generate a signed URL or proxy URL for seeing the original file
    // For MVP, we use the `s3_storage_path` if accessible publicly or assume internal access.
    // Actually, we need an API to fetch the file content or a signed URL.
    // Let's rely on a hypothetical helper or component that can fetch via API.

    return (
        <div className="h-[calc(100vh-65px)] -m-6 flex flex-col overflow-hidden bg-background-primary">
            <div className="border-b border-white/5 px-8 py-4 bg-background-secondary/80 backdrop-blur-md flex justify-between items-center z-10">
                <div>
                    <h2 className="text-xl font-black text-text-primary flex items-center gap-3 uppercase tracking-tight">
                        🔍 Review Information
                        <span className="text-[10px] font-black text-primary-400 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest">{file.filename}</span>
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <ReviewWorkspace file={file} />
            </div>
        </div>
    );
}
