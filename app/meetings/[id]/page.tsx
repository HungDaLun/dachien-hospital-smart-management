import MeetingRoom from '@/components/meeting/MeetingRoom';
// import MeetingSummary from '@/components/meeting/MeetingSummary';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return (
        <div className="h-full w-full p-4 overflow-hidden">
            <MeetingRoom meetingId={resolvedParams.id} />
        </div>
    );
}
