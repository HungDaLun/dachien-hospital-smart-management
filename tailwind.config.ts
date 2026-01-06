import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ===== 戰情室背景層（Base Layer）=====
        background: {
          primary: '#0A0E27',    // 深藍黑（主背景）
          secondary: '#12182E',  // 次要背景（卡片背景）
          tertiary: '#1A2238',   // 第三層背景（浮層、Modal）
          overlay: 'rgba(10, 14, 39, 0.95)', // 遮罩
        },

        // ===== 主色調（Primary Accent - 電光藍）=====
        primary: {
          50: '#E6F7FF',
          100: '#BAE7FF',
          200: '#91D5FF',
          300: '#69C0FF',
          400: '#40A9FF',
          500: '#00D9FF',  // 電光藍（主要強調色）
          600: '#00B8D9',
          700: '#0097B3',
          800: '#00768C',
          900: '#005566',
        },

        // ===== 次要色調（Secondary Accent - AI 紫光）=====
        secondary: {
          50: '#F3F0FF',
          100: '#E9E3FF',
          200: '#D4C5FF',
          300: '#BFA8FF',
          400: '#A78BFA',  // 紫光（AI、洞察相關）
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },

        // ===== 語義色彩（Semantic Colors）=====
        semantic: {
          success: '#00FF88',    // 翠綠（正向指標、達成）
          warning: '#FFB800',    // 琥珀黃（中風險、注意）
          danger: '#FF3366',     // 霓虹紅（高風險、緊急）
          info: '#00D9FF',       // 電光藍（資訊提示）
        },

        // ===== 文字色彩（Text Colors）=====
        text: {
          primary: '#FFFFFF',       // 主要文字（高對比）
          secondary: '#D1D5DB',     // 次要文字（中對比 - gray-300）
          tertiary: '#9CA3AF',      // 第三層文字（低對比 - gray-400）
          muted: '#64748B',         // 輔助文字 (slate-500)
          inverse: '#0A0E27',       // 反色文字（用於亮色按鈕）
        },

        // ===== 邊框與分隔（Borders & Dividers）=====
        border: {
          default: 'rgba(255, 255, 255, 0.1)',     // 預設邊框
          hover: 'rgba(0, 217, 255, 0.3)',         // 懸停邊框（電光藍）
          active: 'rgba(0, 217, 255, 0.6)',        // 啟用邊框
          danger: 'rgba(255, 51, 102, 0.4)',       // 危險邊框
        },

        // ===== DIKW Accent Colors =====
        accent: {
          cyan: '#06B6D4',    // Data 層節點
          sky: '#0EA5E9',     // Information 層節點
          emerald: '#10B981', // Knowledge 層節點
          violet: '#8B5CF6',  // Wisdom 層節點 / AI 功能標示
          amber: '#F59E0B',   // 警告與待審核項目
        },

        // ===== 灰階與中性色 (擴充為更專業的色階) =====
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },

        // ===== 圖表色彩（Chart Colors）=====
        chart: {
          primary: '#00D9FF',
          secondary: '#A78BFA',
          success: '#00FF88',
          warning: '#FFB800',
          danger: '#FF3366',
          teal: '#00FFFF',
          magenta: '#FF00FF',
          // 使用物件索引而非陣列以符合 Tailwind 類型規範
          s1: '#00D9FF',
          s2: '#A78BFA',
          s3: '#00FF88',
          s4: '#FFB800',
          s5: '#FF3366',
          s6: '#00FFFF',
          s7: '#FF00FF',
        },
      },

      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'], // Space Grotesk
        body: ['var(--font-body)', 'sans-serif'],       // DM Sans
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        // 舊系統相容
        sans: ['var(--font-body)', 'Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
      },

      spacing: {
        // 基礎尺度（4px 基準）
        '0': '0px',
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
        // 組件專用間距
        'card-padding': '24px',
        'section-gap': '32px',
        'container-padding': '40px',
      },

      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },

      boxShadow: {
        // 標準陰影層次
        flat: 'none',
        low: '0 1px 3px rgba(0, 0, 0, 0.1)',
        soft: '0 4px 20px hsla(230, 50%, 30%, 0.08)',
        medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
        high: '0 8px 32px rgba(0, 0, 0, 0.12)',
        strong: '0 16px 48px hsla(230, 50%, 30%, 0.16)',
        floating: '0 16px 48px rgba(0, 0, 0, 0.15)',
        // Neumorphism 陰影
        'neu-light': '5px 5px 10px rgba(37, 99, 235, 0.2), -5px -5px 10px rgba(59, 130, 246, 0.2)',
        'neu-hover': '6px 6px 12px rgba(37, 99, 235, 0.25), -6px -6px 12px rgba(59, 130, 246, 0.25)',
        // 戰情室發光陰影
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(167, 139, 250, 0.3)',
        'glow-danger': '0 0 20px rgba(255, 51, 102, 0.3)',
        'glow-success': '0 0 20px rgba(0, 255, 136, 0.3)',
        // 毛玻璃卡片陰影
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-modal': '0 12px 48px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      },

      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gradient-cta': 'linear-gradient(145deg, #3B82F6, #2563EB)',
        // 戰情室漸層
        'gradient-war-room': 'linear-gradient(to bottom right, #0A0E27, #12182E)',
        'gradient-cool': 'linear-gradient(135deg, #0080FF, #00D9FF, #00FF88)',
        'gradient-warm': 'linear-gradient(135deg, #FFB800, #FF7F00, #FF3366)',
      },

      keyframes: {
        // 舊動畫（保留）
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        thinking: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-4px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px currentColor' },
          '50%': { boxShadow: '0 0 16px currentColor' },
        },

        // 戰情室新動畫
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 51, 102, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 51, 102, 0.8)' },
        },
        'pulse-glow-cyan': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.8)' },
        },
        'card-enter': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'data-stream': {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        'border-flow': {
          '0%, 100%': { borderColor: 'rgba(0, 217, 255, 0.3)' },
          '50%': { borderColor: 'rgba(0, 217, 255, 0.8)' },
        },
      },

      animation: {
        // 舊動畫（保留）
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
        'thinking': 'thinking 1.4s infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',

        // 戰情室新動畫
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-glow-cyan': 'pulse-glow-cyan 2s ease-in-out infinite',
        'card-enter': 'card-enter 0.3s ease-out',
        'scanline': 'scanline 3s linear infinite',
        'data-stream': 'data-stream 2s ease-in-out infinite',
        'border-flow': 'border-flow 3s ease-in-out infinite',
      },

      transitionTimingFunction: {
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
        '250': '250ms',
        '350': '350ms',
        '500': '500ms',
      },

      screens: {
        'sm': '640px',   // 手機橫向
        'md': '768px',   // 平板直向
        'lg': '1024px',  // 平板橫向 / 小筆電
        'xl': '1280px',  // 桌面
        '2xl': '1536px', // 大螢幕
        '3xl': '1920px', // Full HD
        '4xl': '2560px', // 2K/4K
      },
    },
  },
  plugins: [],
};

export default config;
