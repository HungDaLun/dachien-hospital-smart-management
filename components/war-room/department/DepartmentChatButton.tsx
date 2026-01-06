'use client';

import React, { useState } from 'react';
import DepartmentConversationModal from './DepartmentConversationModal';

interface Props {
    departmentId: string;
    departmentName: string;
}

export default function DepartmentChatButton({ departmentId, departmentName }: Props) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsChatOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-purple-500/30 transition-all"
            >
                <span>💬</span> 開始對談
            </button>

            {isChatOpen && (
                <DepartmentConversationModal
                    departmentId={departmentId}
                    departmentName={departmentName}
                    onClose={() => setIsChatOpen(false)}
                />
            )}
        </>
    );
}
