import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import Link from 'next/link';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { Hexagon } from 'lucide-react';


/**
 * 首頁元件
 * 顯示平台歡迎頁面或導向登入/儀表板
 */
export default async function HomePage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-background-primary text-text-primary flex items-center justify-center relative overflow-hidden">
      {/* 裝飾性背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 blur-[120px] rounded-full" />
        <div className="war-room-grid absolute inset-0 opacity-20" />
      </div>

      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="text-center relative z-10">
        <div className="w-24 h-24 bg-primary-500/10 border border-primary-500/20 rounded-3xl flex items-center justify-center text-primary-400 mx-auto mb-8 shadow-glow-cyan animate-pulse-slow">
          <Hexagon className="w-12 h-12" />
        </div>
        <h1 className="text-7xl font-black mb-2 uppercase tracking-tighter">
          <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent block font-heading">NEXUS</span>
          <span className="text-4xl block mt-2 text-white/90 tracking-widest font-bold">智樞</span>
        </h1>
        <div className="text-primary-400/80 tracking-[0.3em] font-mono text-base md:text-lg mb-2 font-semibold">ENTERPRISE DECISION COMMAND</div>
        <div className="text-primary-300/70 tracking-[0.15em] text-sm md:text-base mb-10 font-bold">企業戰情智能決策系統</div>
        <p className="text-text-secondary text-xl md:text-2xl mb-12 font-medium tracking-wide max-w-2xl mx-auto leading-relaxed">
          {dict.common.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-4 bg-primary-500 text-background-primary font-black rounded-xl hover:bg-primary-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary-500/20 uppercase tracking-widest text-sm"
          >
            {dict.auth.sign_in}
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-10 py-4 glass-card text-text-primary font-bold rounded-xl hover:bg-white/10 hover:scale-105 active:scale-95 transition-all border border-white/10 uppercase tracking-widest text-sm"
          >
            {dict.common.enter_dashboard}
          </Link>
        </div>
      </div>
    </main>
  );
}
