'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FileList from '@/components/files/FileList';
import FileUploader from '@/components/files/FileUploader';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { Spinner, Button } from '@/components/ui';
import { BrainCircuit, Activity, Layout, UploadCloud } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Dynamic import GalaxyGraph
const GalaxyGraph = dynamic(
    () => import('@/components/visualization/GalaxyGraph'),
    {
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <Spinner size="lg" />
                    <span className="text-gray-400 animate-pulse">Initializing Galaxy...</span>
                </div>
            </div>
        ),
        ssr: false
    }
);

interface ControlCenterProps {
    canUpload: boolean;
    dict: Dictionary;
    initialFiles?: any[];
    initialTotal?: number;
    initialDepartments: Array<{ id: string; name: string }>;
    currentUserRole?: string;
}

type ViewMode = 'list' | 'split' | 'graph';

export default function ControlCenter({
    canUpload,
    dict,
    initialFiles,
    initialTotal,
    initialDepartments,
    currentUserRole
}: ControlCenterProps) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list'); // Default: List only
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Resizing State
    const [splitPos, setSplitPos] = useState(40); // Percentage: 40% FileList
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleUploadSuccess = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
        setIsUploadOpen(false);
    }, []);

    const handleFileSelect = useCallback((id: string) => {
        if (viewMode === 'list') {
            setViewMode('split');
            // If switching to split from list, maybe set a nice default? 40% is good.
        }
        setSelectedFileId(id);
    }, [viewMode]);

    // Resize Handlers
    const startResize = useCallback((e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    }, []);

    const stopResize = useCallback(() => {
        setIsResizing(false);
    }, []);

    const onResize = useCallback((e: MouseEvent) => {
        if (!isResizing || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Clamp between 20% and 80%
        setSplitPos(Math.min(80, Math.max(20, newWidth)));
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', onResize);
            window.addEventListener('mouseup', stopResize);
        } else {
            window.removeEventListener('mousemove', onResize);
            window.removeEventListener('mouseup', stopResize);
        }
        return () => {
            window.removeEventListener('mousemove', onResize);
            window.removeEventListener('mouseup', stopResize);
        };
    }, [isResizing, onResize, stopResize]);

    // Define Header Actions (Upload Button)
    const renderHeaderActions = (
        canUpload && (
            <Button
                size="sm"
                variant="primary"
                className="flex items-center gap-1.5 px-3 h-8 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                onClick={() => setIsUploadOpen(true)}
            >
                <UploadCloud size={14} />
                <span>上傳檔案</span>
            </Button>
        )
    );

    return (
        <div
            ref={containerRef}
            className="flex h-full w-full overflow-hidden bg-gray-50 relative group/app select-none"
        >
            {/* View Mode Controls (Docked Bottom Center) - Unobtrusive & Higher Z-Index */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 opacity-80 hover:opacity-100 pointer-events-auto">
                <div className="flex gap-2 p-1.5 bg-[#1A1B1E]/90 backdrop-blur-md border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    <Button
                        size="sm"
                        variant={viewMode === 'list' ? 'primary' : 'ghost'}
                        onClick={() => setViewMode('list')}
                        className={`rounded-full w-9 h-9 p-0 transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg scale-110' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="檔案列表 (List View)"
                    >
                        <Layout size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'split' ? 'primary' : 'ghost'}
                        onClick={() => setViewMode('split')}
                        className={`rounded-full w-9 h-9 p-0 transition-all ${viewMode === 'split' ? 'bg-indigo-500 text-white shadow-lg scale-110' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="分割檢視 (Brain Split)"
                    >
                        <Activity size={16} />
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'graph' ? 'primary' : 'ghost'}
                        onClick={() => setViewMode('graph')}
                        className={`rounded-full w-9 h-9 p-0 transition-all ${viewMode === 'graph' ? 'bg-indigo-500 text-white shadow-lg scale-110' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="沉浸式大腦 (Immersion)"
                    >
                        <BrainCircuit size={16} />
                    </Button>
                </div>
            </div>

            {/* Left Panel: File List */}
            <div
                className={`
                    h-full flex flex-col bg-white shadow-xl z-20 relative transition-[width] ease-linear
                    ${viewMode === 'list' ? 'w-full' : viewMode === 'split' ? '' : 'w-0 overflow-hidden border-none opacity-0'}
                `}
                style={{
                    width: viewMode === 'split' ? `${splitPos}%` : undefined,
                    maxWidth: viewMode === 'split' ? '80%' : undefined,
                    minWidth: viewMode === 'split' ? '20%' : undefined,
                }}
            >
                {/* File List Area (Include Header Actions) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-0">
                    <FileList
                        canManage={canUpload}
                        dict={dict}
                        refreshTrigger={refreshTrigger}
                        initialFiles={initialFiles}
                        initialTotal={initialTotal}
                        onFileSelect={handleFileSelect}
                        headerActions={renderHeaderActions}
                    />
                </div>
            </div>

            {/* Resizer Handle (Only in Split Mode) */}
            {viewMode === 'split' && (
                <div
                    className={`
                        w-1.5 h-full bg-gray-900 cursor-col-resize z-30 flex items-center justify-center hover:bg-indigo-500 transition-colors
                        ${isResizing ? 'bg-indigo-600 w-2' : ''}
                    `}
                    onMouseDown={startResize}
                >
                    <div className="h-8 w-0.5 bg-gray-600 rounded-full" />
                </div>
            )}

            {/* Right Panel: Galaxy Graph */}
            <div
                className={`
                    h-full bg-black transition-all duration-300 ease-in-out relative overflow-hidden
                    ${viewMode === 'list' ? 'w-0 opacity-0' : 'flex-1 opacity-100'}
                `}
            >
                <div className="absolute inset-0 w-full h-full">
                    <GalaxyGraph
                        initialDepartments={initialDepartments}
                        currentUserRole={currentUserRole}
                        focusNodeId={selectedFileId}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>

            {/* Upload Dialog */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>上傳知識檔案</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                        <FileUploader dict={dict} onUploadSuccess={handleUploadSuccess} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
