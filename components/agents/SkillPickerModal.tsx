'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { SkillSelector } from './SkillSelector';
import { X, Check } from 'lucide-react';

interface SkillPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSkills: string[];
    onConfirm: (skillIds: string[]) => void;
}

export default function SkillPickerModal({
    isOpen,
    onClose,
    selectedSkills,
    onConfirm
}: SkillPickerModalProps) {
    const [tempSelected, setTempSelected] = useState<string[]>(selectedSkills);

    // Sync selected state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempSelected(selectedSkills);
        }
    }, [isOpen, selectedSkills]);

    const handleConfirm = () => {
        onConfirm(tempSelected);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/[0.02] flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-purple-400">⚡️</span> 選擇技能 (Skills)
                        </h2>
                        <p className="text-xs text-zinc-400 mt-1">
                            為 Agent 裝備專業技能模組
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/20">
                    <SkillSelector
                        selectedSkills={tempSelected}
                        onChange={setTempSelected}
                        className="w-full"
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-between items-center flex-shrink-0">
                    <div className="text-sm font-medium text-zinc-400">
                        已選擇 <span className="text-purple-400 font-bold ml-1">{tempSelected.length}</span> 個技能
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                            取消
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                        >
                            <Check size={16} className="mr-2" />
                            確認裝備
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
