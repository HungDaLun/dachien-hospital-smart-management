import { ToastProvider } from '@/components/ui/Toast';
import { MeetingSidebar } from '@/components/meeting/MeetingSidebar';

export default function MeetingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <div className="flex h-screen bg-background overflow-hidden relative">
                {/* Left Sidebar */}
                <MeetingSidebar />

                {/* Main Content Area */}
                <main className="flex-1 h-full overflow-hidden relative flex flex-col bg-background/50 backdrop-blur-sm">
                    {children}
                </main>
            </div>
        </ToastProvider>
    );
}
