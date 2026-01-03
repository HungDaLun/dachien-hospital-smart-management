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
        // 主色調 (Deep Tech Blue)
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          900: '#1E3A8A',
        },
        // 輔助色
        secondary: {
          400: 'hsl(280, 70%, 65%)',
          500: 'hsl(280, 65%, 55%)',
        },
        // DIKW Accent Colors (DIKW 層次視覺化)
        accent: {
          cyan: '#06B6D4',    // Data 層節點
          sky: '#0EA5E9',     // Information 層節點
          emerald: '#10B981', // Knowledge 層節點
          violet: '#8B5CF6',  // Wisdom 層節點 / AI 功能標示
          amber: '#F59E0B',   // 警告與待審核項目
        },
        // 中性色
        gray: {
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
        },
        // 語意色
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        info: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        // 8px 基礎單位系統
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.5rem',    // 24px
        '6': '2rem',      // 32px
        '8': '3rem',      // 48px
        '10': '4rem',     // 64px
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
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
        // Neumorphism 陰影 (CTA 按鈕專用)
        'neu-light': '5px 5px 10px rgba(37, 99, 235, 0.2), -5px -5px 10px rgba(59, 130, 246, 0.2)',
        'neu-hover': '6px 6px 12px rgba(37, 99, 235, 0.25), -6px -6px 12px rgba(59, 130, 246, 0.25)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gradient-cta': 'linear-gradient(145deg, #3B82F6, #2563EB)',
      },
      transitionTimingFunction: {
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
        'thinking': 'thinking 1.4s infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
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
      },
    },
  },
  plugins: [],
};

export default config;

