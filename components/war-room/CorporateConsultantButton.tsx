'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import CorporateConsultantModal from './CorporateConsultantModal';

export default function CorporateConsultantButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-2 hover:bg-amber-500/20 hover:border-amber-500/40 hover:text-amber-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
                <Sparkles size={14} className="text-amber-400" />
                企業參謀
            </button>

            {isOpen && <CorporateConsultantModal onClose={() => setIsOpen(false)} />}
        </>
    );
}
