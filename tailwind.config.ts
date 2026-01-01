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
        // 主色調
        primary: {
          50: 'hsl(230, 100%, 97%)',
          100: 'hsl(230, 96%, 94%)',
          200: 'hsl(230, 94%, 86%)',
          500: 'hsl(230, 85%, 60%)',
          600: 'hsl(230, 80%, 52%)',
          700: 'hsl(230, 75%, 44%)',
        },
        // 輔助色
        secondary: {
          400: 'hsl(280, 70%, 65%)',
          500: 'hsl(280, 65%, 55%)',
        },
        // 中性色
        gray: {
          50: 'hsl(220, 20%, 98%)',
          100: 'hsl(220, 18%, 96%)',
          200: 'hsl(220, 15%, 91%)',
          400: 'hsl(220, 10%, 62%)',
          600: 'hsl(220, 12%, 42%)',
          800: 'hsl(220, 15%, 22%)',
          900: 'hsl(220, 18%, 12%)',
        },
        // 語意色
        success: {
          50: 'hsl(145, 80%, 96%)',
          500: 'hsl(145, 65%, 42%)',
        },
        warning: {
          50: 'hsl(38, 95%, 95%)',
          500: 'hsl(38, 90%, 50%)',
        },
        error: {
          50: 'hsl(0, 85%, 97%)',
          500: 'hsl(0, 75%, 55%)',
        },
        info: {
          50: 'hsl(200, 90%, 96%)',
          500: 'hsl(200, 85%, 50%)',
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
        soft: '0 4px 20px hsla(230, 50%, 30%, 0.08)',
        medium: '0 8px 32px hsla(230, 50%, 30%, 0.12)',
        strong: '0 16px 48px hsla(230, 50%, 30%, 0.16)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, hsl(230, 85%, 60%) 0%, hsl(280, 70%, 60%) 100%)',
        'gradient-card': 'linear-gradient(180deg, hsl(0, 0%, 100%) 0%, hsl(220, 20%, 98%) 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
        'thinking': 'thinking 1.4s infinite',
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
      },
    },
  },
  plugins: [],
};

export default config;
