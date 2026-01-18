/**
 * 超級管家按鈕 (SuperAssistantButton)
 * 懸浮在系統介面角落，點擊開啟 JARVIS 模式
 */

'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuperAssistantButton() {
    const handleOpenPopup = () => {
        // 開啟獨立視窗 (寬 500, 高 800)
        const width = 500;
        const height = 800;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        window.open(
            '/super-assistant',
            'SuperAssistant',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );
    };

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenPopup}
            className="fixed bottom-8 right-8 z-40 group p-4 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all flex items-center gap-2 overflow-hidden border border-white/20"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <Sparkles size={20} className="relative z-10" />
            <span className="relative z-10 font-bold tracking-wider text-sm">超級管家</span>
        </motion.button>
    );
}
