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
        <div className="h-[calc(100vh-4rem)] -m-6 flex flex-col">
            <div className="border-b px-6 py-3 bg-white flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        🔍 Review Information
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{file.filename}</span>
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <ReviewWorkspace file={file} />
            </div>
        </div>
    );
}
