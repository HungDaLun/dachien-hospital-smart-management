# 企業戰情室設計系統
**Enterprise Command Center - Design System v1.0**

---

## 📋 執行摘要

### 系統重新定位

從「知識管理系統」重新定位為「企業戰情中樞」：

| 維度 | 原系統 | 戰情室系統 |
|-----|-------|----------|
| **核心價值** | 知識儲存與檢索 | **主動智慧決策支援** |
| **使用者角色** | 知識工作者 | **C-Level 高階主管** |
| **互動模式** | 查詢-回答 | **AI 主動推播 + 對話探查** |
| **視覺語言** | 辦公軟體風格 | **科技戰情室美學** |
| **資訊密度** | 中等 | **高密度 + 清晰層次** |

### 設計目標

1. **極致科技感**：Cyberpunk + Glassmorphism + Dark Mode
2. **專業權威感**：企業級資料視覺化 + 清晰資訊架構
3. **即時回饋感**：動態數據 + 脈衝警報 + 流暢動畫
4. **沉浸式體驗**：全螢幕畫布 + 無邊際宇宙背景

---

## 🎨 設計系統核心

### 1. 色彩系統（Color System）

基於 UI Pro Max 分析結果，整合「Dark Mode (OLED)」+「Cyberpunk」+「Analytics Dashboard」最佳實踐：

#### 1.1 主題色彩

```typescript
// tailwind.config.ts
const colors = {
  // 基礎背景層（Base Layer）
  background: {
    primary: '#0A0E27',    // 深藍黑（主背景，對應 Midnight Blue）
    secondary: '#12182E',  // 次要背景（卡片背景）
    tertiary: '#1A2238',   // 第三層背景（浮層、Modal）
    overlay: 'rgba(10, 14, 39, 0.95)', // 遮罩
  },

  // 主色調（Primary Accent）
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

  // 次要色調（Secondary Accent）- AI 相關
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

  // 語義色彩（Semantic Colors）
  semantic: {
    success: '#00FF88',    // 翠綠（正向指標、達成）
    warning: '#FFB800',    // 琥珀黃（中風險、注意）
    danger: '#FF3366',     // 霓虹紅（高風險、緊急）
    info: '#00D9FF',       // 電光藍（資訊提示）
  },

  // 文字色彩（Text Colors）
  text: {
    primary: '#FFFFFF',       // 主要文字（高對比）
    secondary: '#B4BCD0',     // 次要文字（中對比）
    tertiary: '#6B7280',      // 第三層文字（低對比）
    muted: '#475569',         // 輔助文字
    inverse: '#0A0E27',       // 反色文字（用於亮色按鈕）
  },

  // 邊框與分隔（Borders & Dividers）
  border: {
    default: 'rgba(255, 255, 255, 0.1)',     // 預設邊框
    hover: 'rgba(0, 217, 255, 0.3)',         // 懸停邊框（電光藍）
    active: 'rgba(0, 217, 255, 0.6)',        // 啟用邊框
    danger: 'rgba(255, 51, 102, 0.4)',       // 危險邊框
  },

  // 圖表色彩（Chart Colors）- 資料視覺化專用
  chart: {
    gradient: {
      cool: ['#0080FF', '#00D9FF', '#00FF88'], // 冷色調漸層（趨勢、成長）
      warm: ['#FFB800', '#FF7F00', '#FF3366'], // 暖色調漸層（警告、風險）
      diverging: ['#00FF88', '#FFB800', '#FF3366'], // 分歧漸層（好→中→壞）
    },
    series: [
      '#00D9FF', // 電光藍
      '#A78BFA', // 紫光
      '#00FF88', // 翠綠
      '#FFB800', // 琥珀黃
      '#FF3366', // 霓虹紅
      '#00FFFF', // 青色
      '#FF00FF', // 洋紅
    ],
  },
};
```

#### 1.2 色彩使用指南

| 元素類型 | 推薦色彩 | 使用情境 |
|---------|---------|---------|
| **主背景** | `background.primary` | 全局背景 |
| **卡片背景** | `background.secondary` + 毛玻璃效果 | KPI 卡片、部門卡片 |
| **Modal/浮層** | `background.tertiary` + backdrop-blur | 對話框、側邊欄 |
| **主要 CTA** | `primary.500` | 主要按鈕、重要連結 |
| **AI 功能** | `secondary.400` | AI 洞察、建議、摘要 |
| **成功狀態** | `semantic.success` | 達成指標、正向趨勢 |
| **警告狀態** | `semantic.warning` | 中風險、需關注 |
| **危險狀態** | `semantic.danger` | 高風險、緊急事件 |
| **數據視覺化** | `chart.series` | 多序列圖表 |

---

### 2. 字體系統（Typography System）

基於 UI Pro Max「Tech Startup」字體配對：

#### 2.1 字體定義

```typescript
// tailwind.config.ts
import { Space_Grotesk, DM_Sans } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

// Tailwind Config
export default {
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'], // Space Grotesk
        body: ['var(--font-body)', 'sans-serif'],       // DM Sans
        mono: ['JetBrains Mono', 'Courier New', 'monospace'], // 數據、代碼
      },
    },
  },
};
```

#### 2.2 字體層級

```typescript
// 標題層級（Headings）- 使用 Space Grotesk
const headingStyles = {
  h1: 'text-5xl md:text-6xl font-heading font-bold tracking-tight',      // 64px
  h2: 'text-4xl md:text-5xl font-heading font-bold tracking-tight',      // 48px
  h3: 'text-3xl md:text-4xl font-heading font-semibold tracking-tight',  // 36px
  h4: 'text-2xl md:text-3xl font-heading font-semibold',                 // 30px
  h5: 'text-xl md:text-2xl font-heading font-medium',                    // 24px
  h6: 'text-lg md:text-xl font-heading font-medium',                     // 20px
};

// 內文層級（Body）- 使用 DM Sans
const bodyStyles = {
  'body-xl': 'text-xl font-body font-normal',         // 20px - 重要內容
  'body-lg': 'text-lg font-body font-normal',         // 18px - 次要內容
  'body-base': 'text-base font-body font-normal',     // 16px - 預設內文
  'body-sm': 'text-sm font-body font-normal',         // 14px - 輔助文字
  'body-xs': 'text-xs font-body font-normal',         // 12px - 註解、標籤
};

// 特殊用途（Specialty）
const specialtyStyles = {
  'data-display': 'text-4xl md:text-5xl font-mono font-bold tabular-nums', // KPI 數字
  'metric-label': 'text-xs font-body font-medium uppercase tracking-wider', // 指標標籤
  'caption': 'text-xs font-body font-normal text-text-tertiary',           // 圖表說明
};
```

#### 2.3 Google Fonts 引用

```typescript
// app/layout.tsx
import { Space_Grotesk, DM_Sans } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body className={dmSans.className}>
        {children}
      </body>
    </html>
  );
}
```

---

### 3. 間距系統（Spacing System）

#### 3.1 基礎間距

```typescript
// tailwind.config.ts
export default {
  theme: {
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
      'card-padding': '24px',      // 卡片內邊距
      'section-gap': '32px',       // 區塊間距
      'container-padding': '40px', // 容器內邊距
    },
  },
};
```

#### 3.2 間距使用指南

| 元素類型 | 推薦間距 | 使用情境 |
|---------|---------|---------|
| **卡片內邊距** | `p-6` (24px) | KPI 卡片、部門卡片內容 |
| **卡片間距** | `gap-6` (24px) | Grid 佈局的卡片間距 |
| **區塊間距** | `gap-8` (32px) | 主要區塊之間 |
| **容器內邊距** | `px-10` (40px) | 頁面左右邊距 |
| **標題與內容** | `mb-4` (16px) | 標題下方間距 |
| **列表項目** | `gap-3` (12px) | 垂直列表間距 |
| **按鈕內邊距** | `px-6 py-3` | 中型按鈕 |

---

### 4. 毛玻璃效果系統（Glassmorphism）

基於 UI Pro Max「Glassmorphism」最佳實踐：

#### 4.1 毛玻璃基礎類別

```typescript
// styles/glass-effects.css
@layer components {
  /* 基礎毛玻璃 - 卡片背景 */
  .glass-card {
    background: rgba(18, 24, 46, 0.7);
    backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 8px 32px 0 rgba(0, 0, 0, 0.37),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* 強化毛玻璃 - Modal、側邊欄 */
  .glass-modal {
    background: rgba(26, 34, 56, 0.85);
    backdrop-filter: blur(24px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow:
      0 12px 48px 0 rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  /* 輕量毛玻璃 - 懸浮提示 */
  .glass-tooltip {
    background: rgba(18, 24, 46, 0.9);
    backdrop-filter: blur(12px) saturate(150%);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  /* 霓虹邊框毛玻璃 - 強調卡片 */
  .glass-glow {
    background: rgba(18, 24, 46, 0.7);
    backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(0, 217, 255, 0.3);
    box-shadow:
      0 8px 32px 0 rgba(0, 217, 255, 0.2),
      inset 0 1px 0 rgba(0, 217, 255, 0.1);
  }
}
```

#### 4.2 毛玻璃使用情境

| 元素類型 | 毛玻璃類別 | 視覺效果 |
|---------|----------|---------|
| **KPI 卡片** | `.glass-card` | 中等透明度 + 柔和模糊 |
| **部門卡片** | `.glass-card` | 同上 |
| **Modal 對話框** | `.glass-modal` | 高透明度 + 強模糊 |
| **懸浮提示** | `.glass-tooltip` | 高不透明度 + 輕模糊 |
| **警報卡片** | `.glass-glow` | 霓虹邊框 + 發光效果 |

---

### 5. 動畫系統（Animation System）

基於 UI Pro Max「Animation」UX 指南 + Framer Motion：

#### 5.1 動畫原則

```typescript
// 1. 尊重使用者偏好（Respect Reduced Motion）
// tailwind.config.ts
export default {
  theme: {
    extend: {
      animation: {
        // 所有動畫都需檢查 prefers-reduced-motion
      },
    },
  },
};

// 全域樣式
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### 5.2 核心動畫

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        // 1. 脈衝光暈（Pulse Glow）- 用於新通知、警報
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(255, 51, 102, 0.5)'
          },
          '50%': {
            boxShadow: '0 0 20px rgba(255, 51, 102, 0.8)'
          },
        },

        // 2. 數字滾動（Count Up）- 用於 KPI 數字
        // 註：使用 react-countup 庫實現

        // 3. 卡片進場（Card Enter）- 用於卡片載入
        'card-enter': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        // 4. 掃描線（Scanline）- Cyberpunk 效果
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },

        // 5. 資料串流（Data Stream）- 即時數據效果
        'data-stream': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-100%)'
          },
          '50%': {
            opacity: '1'
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(100%)'
          },
        },

        // 6. 邊框流動（Border Flow）- 強調邊框動畫
        'border-flow': {
          '0%, 100%': {
            borderColor: 'rgba(0, 217, 255, 0.3)'
          },
          '50%': {
            borderColor: 'rgba(0, 217, 255, 0.8)'
          },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'card-enter': 'card-enter 0.3s ease-out',
        'scanline': 'scanline 3s linear infinite',
        'data-stream': 'data-stream 2s ease-in-out infinite',
        'border-flow': 'border-flow 3s ease-in-out infinite',
      },
    },
  },
};
```

#### 5.3 緩動函數（Easing Functions）

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',      // 進場動畫
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)', // 退場動畫
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',          // 平滑過渡
      },
      transitionDuration: {
        '250': '250ms',  // 快速互動
        '350': '350ms',  // 中速動畫
        '500': '500ms',  // 慢速強調
      },
    },
  },
};
```

#### 5.4 Framer Motion 預設配置

```typescript
// lib/animation-variants.ts
import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.19, 1, 0.22, 1], // out-expo
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const slideInFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: [0.19, 1, 0.22, 1],
    },
  },
};
```

---

## 🏗️ 組件庫設計

### 1. 基礎組件（Foundation Components）

#### 1.1 Button 組件

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // 基礎樣式
  'inline-flex items-center justify-center font-medium transition-all duration-250 ease-smooth cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
  {
    variants: {
      variant: {
        // 主要按鈕（電光藍）
        primary: 'bg-primary-500 text-text-inverse hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50',

        // 次要按鈕（紫光）
        secondary: 'bg-secondary-400 text-white hover:bg-secondary-500 active:bg-secondary-600 shadow-lg shadow-secondary-400/30 hover:shadow-secondary-400/50',

        // 毛玻璃按鈕
        glass: 'glass-card text-text-primary hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/20',

        // 危險按鈕
        danger: 'bg-semantic-danger text-white hover:bg-red-600 active:bg-red-700 shadow-lg shadow-semantic-danger/30',

        // 幽靈按鈕
        ghost: 'text-text-primary hover:bg-white/5 active:bg-white/10',

        // 僅圖示按鈕
        icon: 'text-text-primary hover:bg-white/5 active:bg-white/10 rounded-full',
      },
      size: {
        sm: 'text-sm px-4 py-2 rounded-lg',
        md: 'text-base px-6 py-3 rounded-lg',
        lg: 'text-lg px-8 py-4 rounded-xl',
        icon: 'p-2 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### 1.2 Card 組件

```typescript
// components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-2xl transition-all duration-250 ease-smooth',
  {
    variants: {
      variant: {
        // 標準毛玻璃卡片
        glass: 'glass-card hover:shadow-2xl hover:shadow-primary-500/10',

        // 霓虹發光卡片（警報、強調）
        glow: 'glass-glow hover:shadow-2xl hover:shadow-primary-500/30',

        // 危險警報卡片
        danger: 'glass-card border-semantic-danger/40 hover:shadow-2xl hover:shadow-semantic-danger/20',

        // 成功狀態卡片
        success: 'glass-card border-semantic-success/40 hover:shadow-2xl hover:shadow-semantic-success/20',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      clickable: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'glass',
      padding: 'md',
      clickable: false,
    },
  }
);

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, clickable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, clickable, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4 border-b border-border-default', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-heading font-semibold text-text-primary', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-4', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent, cardVariants };
```

#### 1.3 Badge 組件

```typescript
// components/ui/Badge.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-500/20 text-primary-500 border border-primary-500/30',
        success: 'bg-semantic-success/20 text-semantic-success border border-semantic-success/30',
        warning: 'bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30',
        danger: 'bg-semantic-danger/20 text-semantic-danger border border-semantic-danger/30',
        secondary: 'bg-secondary-400/20 text-secondary-400 border border-secondary-400/30',
        outline: 'text-text-secondary border border-border-default',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
```

---

### 2. 戰情室專用組件（War Room Components）

#### 2.1 KPI Card 組件

```typescript
// components/war-room/KPICard.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fadeInUp } from '@/lib/animation-variants';
import CountUp from 'react-countup';

interface KPICardProps {
  title: string;
  value: number;
  unit?: string;
  change?: number; // 變化百分比
  trend?: 'up' | 'down' | 'stable';
  status?: 'success' | 'warning' | 'danger' | 'default';
  icon?: React.ReactNode;
  description?: string;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  unit = '',
  change,
  trend = 'stable',
  status = 'default',
  icon,
  description,
  onClick,
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-semantic-success';
      case 'down':
        return 'text-semantic-danger';
      default:
        return 'text-text-tertiary';
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
    >
      <Card
        variant={status === 'danger' ? 'danger' : status === 'success' ? 'success' : 'glass'}
        clickable={!!onClick}
        onClick={onClick}
        className="relative overflow-hidden group"
      >
        {/* 掃描線效果（Cyberpunk） */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none">
          <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-scanline" />
        </div>

        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 rounded-lg bg-primary-500/20 text-primary-500">
                  {icon}
                </div>
              )}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {status !== 'default' && (
              <Badge variant={status}>
                {status === 'success' && '達成'}
                {status === 'warning' && '注意'}
                {status === 'danger' && '警告'}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* 主要數值 */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl md:text-5xl font-mono font-bold text-text-primary tabular-nums">
              <CountUp
                end={value}
                duration={1.5}
                separator=","
                decimals={value % 1 !== 0 ? 1 : 0}
              />
            </span>
            {unit && (
              <span className="text-xl text-text-secondary font-body">{unit}</span>
            )}
          </div>

          {/* 變化趨勢 */}
          {change !== undefined && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-sm text-text-tertiary ml-1">vs 上週</span>
            </div>
          )}

          {/* 描述 */}
          {description && (
            <p className="text-sm text-text-secondary mt-3">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

#### 2.2 Department Card 組件

```typescript
// components/war-room/DepartmentCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, FileText, Activity } from 'lucide-react';
import { fadeInUp } from '@/lib/animation-variants';

interface DepartmentCardProps {
  departmentName: string;
  departmentIcon: React.ReactNode;
  stats: {
    totalFiles: number;
    filesUpdatedToday: number;
    activeAgents: number;
    knowledgeHealthScore: number;
  };
  aiSummary: string;
  topUpdates: string[];
  onChatClick: () => void;
  onViewDetailsClick: () => void;
}

export function DepartmentCard({
  departmentName,
  departmentIcon,
  stats,
  aiSummary,
  topUpdates,
  onChatClick,
  onViewDetailsClick,
}: DepartmentCardProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-semantic-success';
    if (score >= 60) return 'text-semantic-warning';
    return 'text-semantic-danger';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary-500/20 text-primary-500">
                {departmentIcon}
              </div>
              <CardTitle>{departmentName}</CardTitle>
            </div>
            <Badge variant={getHealthStatus(stats.knowledgeHealthScore)}>
              健康度 {stats.knowledgeHealthScore}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* 統計數據 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-text-primary">
                {stats.totalFiles}
              </div>
              <div className="text-xs text-text-tertiary mt-1">總檔案數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-primary-500">
                {stats.filesUpdatedToday}
              </div>
              <div className="text-xs text-text-tertiary mt-1">今日更新</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-secondary-400">
                {stats.activeAgents}
              </div>
              <div className="text-xs text-text-tertiary mt-1">活躍 Agent</div>
            </div>
          </div>

          {/* AI 摘要 */}
          <div className="glass-tooltip rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-secondary-400" />
              <span className="text-xs font-medium text-secondary-400 uppercase tracking-wider">
                AI 日報摘要
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{aiSummary}</p>
          </div>

          {/* 重要更新 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-text-tertiary" />
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                本日重點
              </span>
            </div>
            <ul className="space-y-1">
              {topUpdates.slice(0, 3).map((update, index) => (
                <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  <span className="flex-1">{update}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 操作按鈕 */}
          <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border-default">
            <Button variant="glass" size="sm" onClick={onChatClick}>
              <MessageSquare className="w-4 h-4 mr-2" />
              對話
            </Button>
            <Button variant="ghost" size="sm" onClick={onViewDetailsClick}>
              查看詳情
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

#### 2.3 Alert Card 組件（AI 洞察警報）

```typescript
// components/war-room/AlertCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { fadeInUp } from '@/lib/animation-variants';

interface AlertCardProps {
  type: 'opportunity' | 'risk' | 'conflict';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  departments: string[];
  recommendedAction: string;
  onResolve: () => void;
  onDismiss: () => void;
}

export function AlertCard({
  type,
  priority,
  title,
  description,
  departments,
  recommendedAction,
  onResolve,
  onDismiss,
}: AlertCardProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'opportunity':
        return 'text-semantic-success';
      case 'risk':
        return 'text-semantic-danger';
      case 'conflict':
        return 'text-semantic-warning';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'opportunity':
        return <CheckCircle className="w-5 h-5" />;
      case 'risk':
      case 'conflict':
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getPriorityVariant = () => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'default';
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={priority === 'high' ? 'animate-pulse-glow' : ''}
    >
      <Card variant={type === 'risk' ? 'danger' : 'glow'}>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            {/* 左側內容 */}
            <div className="flex-1">
              {/* 標題列 */}
              <div className="flex items-center gap-3 mb-3">
                <div className={getTypeColor()}>{getTypeIcon()}</div>
                <h4 className="text-lg font-heading font-semibold text-text-primary">
                  {title}
                </h4>
                <Badge variant={getPriorityVariant()}>
                  {priority === 'high' && '高優先級'}
                  {priority === 'medium' && '中優先級'}
                  {priority === 'low' && '低優先級'}
                </Badge>
              </div>

              {/* 描述 */}
              <p className="text-sm text-text-secondary mb-3">{description}</p>

              {/* 受影響部門 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-text-tertiary">影響部門：</span>
                {departments.map((dept, index) => (
                  <Badge key={index} variant="outline">
                    {dept}
                  </Badge>
                ))}
              </div>

              {/* 建議行動 */}
              <div className="glass-tooltip rounded-lg p-3 mb-4">
                <div className="text-xs font-medium text-secondary-400 uppercase tracking-wider mb-1">
                  AI 建議
                </div>
                <p className="text-sm text-text-secondary">{recommendedAction}</p>
              </div>

              {/* 操作按鈕 */}
              <div className="flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={onResolve}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  標記已處理
                </Button>
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  稍後處理
                </Button>
              </div>
            </div>

            {/* 右側關閉按鈕 */}
            <button
              onClick={onDismiss}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

---

## 📐 佈局系統（Layout System）

### 1. 全寬畫布佈局（Full-Width Canvas）

```typescript
// app/war-room/layout.tsx
export default function WarRoomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* 背景效果 */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 漸層背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-background-primary via-background-secondary to-background-primary opacity-80" />

        {/* 網格線（Cyberpunk） */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* 光暈效果 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl" />
      </div>

      {/* 主內容區 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```

### 2. 網格系統（Grid System）

```typescript
// components/war-room/WarRoomDashboard.tsx
'use client';

import { motion } from 'framer-motion';
import { staggerContainer } from '@/lib/animation-variants';

export function WarRoomDashboard() {
  return (
    <div className="w-full px-6 py-8">
      {/* 5 大 KPI 區塊 */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className="text-3xl font-heading font-bold text-text-primary mb-6">
          全局態勢感知
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* KPI Cards */}
        </div>
      </motion.section>

      {/* 部門戰情模組 */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className="text-3xl font-heading font-bold text-text-primary mb-6">
          部門戰情
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Department Cards */}
        </div>
      </motion.section>

      {/* AI 洞察面板 */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-heading font-bold text-text-primary mb-6">
          AI 智能洞察
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert Cards */}
        </div>
      </motion.section>
    </div>
  );
}
```

### 3. 響應式斷點（Responsive Breakpoints）

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',   // 手機橫向
      'md': '768px',   // 平板直向
      'lg': '1024px',  // 平板橫向 / 小筆電
      'xl': '1280px',  // 桌面
      '2xl': '1536px', // 大螢幕
      '3xl': '1920px', // Full HD（可選）
      '4xl': '2560px', // 2K/4K（可選）
    },
  },
};
```

| 斷點 | 裝置 | KPI 卡片佈局 | 部門卡片佈局 |
|-----|-----|------------|------------|
| `sm` (640px) | 手機橫向 | 1 列 | 1 列 |
| `md` (768px) | 平板直向 | 2 列 | 2 列 |
| `lg` (1024px) | 平板橫向 | 3 列 | 3 列 |
| `xl` (1280px) | 桌面 | 5 列 | 3 列 |
| `2xl` (1536px) | 大螢幕 | 5 列 | 4 列 |
| `3xl` (1920px) | Full HD | 5 列 | 4 列 |
| `4xl` (2560px) | 2K/4K | 5 列 | 5 列 |

#### 推薦的 Grid 欄位配置

```typescript
// ✅ 推薦配置（自動適應）
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"

// 斷點對應：
// < 768px   → 1 欄（手機）
// 768-1024  → 2 欄（平板）
// 1024-1280 → 3 欄（筆電）
// 1280-1536 → 4 欄（桌面）
// > 1536px  → 5 欄（大螢幕）
```

---

## 📐 響應式佈局設計規範

### 全域佈局原則

為了確保整個系統的視覺一致性與**大螢幕全寬展示**，採用以下統一規範：

#### 1. **戰情室頁面**（主儀表板、知識庫、情報中心、部門戰情室）

```typescript
// ✅ 標準模板 - 全寬設計
<div className="min-h-screen p-6 xl:p-10" style={{ backgroundColor: WAR_ROOM_THEME.background.primary }}>
  <div className="w-full mx-auto space-y-10">
    {/* 內容 */}
  </div>
</div>
```

**特點**：
- ✅ 全寬設計（`w-full`）- 在 1920px+ 螢幕上無留白
- ✅ 統一內邊距（`p-6 xl:p-10`）
- ✅ 深色背景（戰情室主題）
- ✅ 無最大寬度限制

**視覺效果**：
- 📺 1920px 螢幕：100% 空間利用
- 📺 2560px 螢幕：完全撐滿，無黑邊
- 📺 3440px 超寬螢幕：影院級視覺震撼

---

#### 2. **管理頁面**（Agent、用戶、部門、分類管理）

```typescript
// ✅ 標準模板 - 全寬 + 自適應 Grid
<div className="w-full px-6 xl:px-10 py-6 space-y-6">
  <div className="flex items-center justify-between mb-8">
    <h1 className="text-3xl font-bold">標題</h1>
    <Button>操作</Button>
  </div>

  {/* Grid 佈局 - 自動適應欄位數 */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
    {/* 卡片 */}
  </div>
</div>
```

**特點**：
- ✅ 全寬設計（`w-full`）
- ✅ Grid 自動適應（1→2→3→4→5 欄）
- ✅ 統一卡片間距（`gap-6`）

**視覺效果**：
- 📺 1920px 螢幕：顯示 4 欄
- 📺 2560px 螢幕：顯示 5 欄
- 📺 更高效利用空間

---

#### 3. **表單頁面**（設定、新增/編輯頁面）

```typescript
// ✅ 標準模板 - 限制內容寬度保持可讀性
<div className="w-full flex justify-center px-6 xl:px-10 py-6">
  <div className="w-full max-w-6xl space-y-6">
    {/* 表單內容 */}
  </div>
</div>
```

**特點**：
- ✅ 外層全寬（`w-full`）
- ✅ 內容限制在 `max-w-6xl` (1152px) 保持可讀性
- ✅ 居中顯示

---

### 響應式佈局審查報告

#### 現有頁面佈局狀態

| 頁面 | 當前狀態 | 自適應等級 | 需要改進 |
|-----|---------|-----------|---------|
| **主儀表板** (`/dashboard`) | ✅ 全寬設計 | **優秀 (A+)** | ❌ 無需改進 |
| **知識庫戰情室** (`/dashboard/knowledge`) | ✅ 全寬設計 | **優秀 (A+)** | ❌ 無需改進 |
| **外部情報中心** (`/dashboard/intelligence`) | ⚠️ 有限制 | **良好 (B+)** | ✅ 建議移除 max-w |
| **部門戰情室** (`/dashboard/department/[id]`) | ⚠️ 有限制 | **良好 (B+)** | ✅ 建議移除 max-w |
| **Agent 管理頁** (`/dashboard/agents`) | ⚠️ 有限制 | **普通 (C)** | ✅ 需要改進 |
| **設定頁面** (`/dashboard/settings`) | ⚠️ 有限制 | **普通 (C)** | ✅ 需要改進 |
| **聊天頁面** (`/dashboard/chat`) | ⚠️ 有限制 | **普通 (C)** | ✅ 需要改進 |

#### 改進前後對比

| 螢幕解析度 | 修改前 | 修改後 | 改進幅度 |
|-----------|-------|-------|---------|
| **1920x1080** | 66.7% 使用率 | **100% 使用率** | **+50% 空間** |
| **2560x1440** | 50% 使用率 | **100% 使用率** | **+100% 空間** |
| **3440x1440** (超寬) | 37% 使用率 | **100% 使用率** | **+170% 空間** |
| **5120x1440** (5K) | 25% 使用率 | **100% 使用率** | **+300% 空間** |

#### 具體修正方案

**修正 1: 外部情報中心** (`app/dashboard/intelligence/page.tsx`)
```typescript
// 修改前（第 49 行）
<div className="max-w-[1600px] mx-auto">

// 修改後
<div className="w-full">
```

**修正 2: 部門戰情室** (`app/dashboard/department/[id]/page.tsx`)
```typescript
// 修改前（第 61 行）
<div className="max-w-[1200px] mx-auto">

// 修改後
<div className="w-full">
```

**修正 3: Agent 管理頁** (`app/dashboard/agents/page.tsx`)
```typescript
// 修改前（第 35 行）
<div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
  // ...
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 修改後
<div className="w-full px-6 xl:px-10 py-6 space-y-6">
  // ...
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
```

**修正 4: 聊天頁面** (`app/dashboard/chat/page.tsx`)
```typescript
// 修改前
<div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">

// 修改後
<div className="w-full px-6 xl:px-10 h-[calc(100vh-120px)]">
```

**修正 5: 設定頁面** (`app/dashboard/settings/page.tsx`)
```typescript
// 修改前
<div className="max-w-4xl mx-auto p-4 md:p-6">

// 修改後（提高寬度限制，保持可讀性）
<div className="max-w-6xl mx-auto p-4 md:p-6">
```

---

## 📊 圖表設計規範

### 1. Recharts 圖表配置

基於 UI Pro Max「Chart」建議：

#### 1.1 折線圖（Line Chart）- 趨勢分析

```typescript
// components/charts/TrendLineChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface TrendLineChartProps {
  data: Array<{ name: string; value: number; forecast?: number }>;
  showForecast?: boolean;
}

export function TrendLineChart({ data, showForecast = false }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          {/* 漸層填充 */}
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* 網格 */}
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />

        {/* 座標軸 */}
        <XAxis
          dataKey="name"
          stroke="#6B7280"
          tick={{ fill: '#B4BCD0', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fill: '#B4BCD0', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
        />

        {/* 提示框 */}
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(26, 34, 56, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            backdropFilter: 'blur(12px)',
            color: '#FFFFFF',
          }}
          labelStyle={{ color: '#B4BCD0' }}
        />

        {/* 實際值 */}
        <Area
          type="monotone"
          dataKey="value"
          stroke="#00D9FF"
          strokeWidth={2}
          fill="url(#colorValue)"
          dot={{ fill: '#00D9FF', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, strokeWidth: 0, fill: '#00D9FF' }}
        />

        {/* 預測值 */}
        {showForecast && (
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#A78BFA"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorForecast)"
            dot={{ fill: '#A78BFA', strokeWidth: 2, r: 4 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

#### 1.2 雷達圖（Radar Chart）- 多維度比較

```typescript
// components/charts/OperationalRadarChart.tsx
'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface OperationalRadarChartProps {
  data: Array<{
    metric: string;
    currentValue: number;
    targetValue: number;
  }>;
}

export function OperationalRadarChart({ data }: OperationalRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />

        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: '#B4BCD0', fontSize: 12 }}
          stroke="rgba(255, 255, 255, 0.1)"
        />

        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#B4BCD0', fontSize: 10 }}
          stroke="rgba(255, 255, 255, 0.1)"
        />

        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(26, 34, 56, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            backdropFilter: 'blur(12px)',
            color: '#FFFFFF',
          }}
        />

        {/* 目標值 */}
        <Radar
          name="目標"
          dataKey="targetValue"
          stroke="#6B7280"
          fill="#6B7280"
          fillOpacity={0.1}
          strokeDasharray="3 3"
        />

        {/* 當前值 */}
        <Radar
          name="當前"
          dataKey="currentValue"
          stroke="#00D9FF"
          fill="#00D9FF"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

#### 1.3 環形進度圖（Radial Progress）- 戰略執行度

```typescript
// components/charts/RadialProgressChart.tsx
'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface RadialProgressChartProps {
  percentage: number;
  label: string;
}

export function RadialProgressChart({ percentage, label }: RadialProgressChartProps) {
  const data = [
    {
      name: label,
      value: percentage,
      fill: percentage >= 80 ? '#00FF88' : percentage >= 60 ? '#FFB800' : '#FF3366',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar
          background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          dataKey="value"
          cornerRadius={10}
          animationDuration={1500}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-text-primary"
        >
          <tspan x="50%" dy="-10" fontSize="48" fontWeight="bold" fontFamily="JetBrains Mono">
            {percentage}%
          </tspan>
          <tspan x="50%" dy="30" fontSize="14" className="fill-text-secondary">
            {label}
          </tspan>
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
```

### 2. D3.js 進階圖表

#### 2.1 知識流動熱力圖（Knowledge Flow Heatmap）

```typescript
// components/charts/KnowledgeFlowHeatmap.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface FlowData {
  source: string;
  target: string;
  value: number;
}

interface KnowledgeFlowHeatmapProps {
  data: FlowData[];
  departments: string[];
}

export function KnowledgeFlowHeatmap({ data, departments }: KnowledgeFlowHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // 清除舊圖表
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 50, right: 50, bottom: 50, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X 軸比例尺
    const x = d3.scaleBand().range([0, width]).domain(departments).padding(0.05);

    // Y 軸比例尺
    const y = d3.scaleBand().range([0, height]).domain(departments).padding(0.05);

    // 色彩比例尺（冷到熱）
    const maxValue = d3.max(data, (d) => d.value) || 0;
    const color = d3
      .scaleSequential()
      .interpolator(d3.interpolateRgb('#0080FF', '#FF3366'))
      .domain([0, maxValue]);

    // 繪製熱力圖方格
    svg
      .selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.source) || 0)
      .attr('y', (d) => y(d.target) || 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', (d) => color(d.value))
      .style('opacity', 0.8)
      .on('mouseover', function () {
        d3.select(this).style('opacity', 1).style('stroke', '#00D9FF').style('stroke-width', 2);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 0.8).style('stroke', 'none');
      });

    // X 軸標籤
    svg
      .append('g')
      .style('font-size', 12)
      .style('color', '#B4BCD0')
      .call(d3.axisTop(x).tickSize(0))
      .select('.domain')
      .remove();

    // Y 軸標籤
    svg
      .append('g')
      .style('font-size', 12)
      .style('color', '#B4BCD0')
      .call(d3.axisLeft(y).tickSize(0))
      .select('.domain')
      .remove();
  }, [data, departments]);

  return (
    <div className="flex justify-center">
      <svg ref={svgRef} />
    </div>
  );
}
```

---

## 🔧 Tailwind CSS 完整配置

```typescript
// tailwind.config.ts
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
        background: {
          primary: '#0A0E27',
          secondary: '#12182E',
          tertiary: '#1A2238',
          overlay: 'rgba(10, 14, 39, 0.95)',
        },
        primary: {
          50: '#E6F7FF',
          100: '#BAE7FF',
          200: '#91D5FF',
          300: '#69C0FF',
          400: '#40A9FF',
          500: '#00D9FF',
          600: '#00B8D9',
          700: '#0097B3',
          800: '#00768C',
          900: '#005566',
        },
        secondary: {
          50: '#F3F0FF',
          100: '#E9E3FF',
          200: '#D4C5FF',
          300: '#BFA8FF',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        semantic: {
          success: '#00FF88',
          warning: '#FFB800',
          danger: '#FF3366',
          info: '#00D9FF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B4BCD0',
          tertiary: '#6B7280',
          muted: '#475569',
          inverse: '#0A0E27',
        },
        border: {
          default: 'rgba(255, 255, 255, 0.1)',
          hover: 'rgba(0, 217, 255, 0.3)',
          active: 'rgba(0, 217, 255, 0.6)',
          danger: 'rgba(255, 51, 102, 0.4)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 51, 102, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 51, 102, 0.8)' },
        },
        'card-enter': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
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
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'card-enter': 'card-enter 0.3s ease-out',
        scanline: 'scanline 3s linear infinite',
        'data-stream': 'data-stream 2s ease-in-out infinite',
        'border-flow': 'border-flow 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '500': '500ms',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## ✅ 實施檢查清單

### Phase 1: 設計系統建立（1 週）

- [ ] 安裝依賴套件
  ```bash
  npm install tailwindcss framer-motion recharts d3 react-countup class-variance-authority lucide-react
  npm install -D @types/d3
  ```
- [ ] 配置 Tailwind CSS（複製上方完整配置）
- [ ] 設定 Google Fonts（Space Grotesk + DM Sans）
- [ ] 建立毛玻璃效果 CSS 類別
- [ ] 建立動畫變體庫（`lib/animation-variants.ts`）

### Phase 2: 基礎組件開發（1 週）

- [ ] 實作 Button 組件（7 種變體）
- [ ] 實作 Card 組件（4 種變體）
- [ ] 實作 Badge 組件（6 種變體）
- [ ] 建立 Storybook 文件（可選）

### Phase 3: 戰情室組件開發（2 週）

- [ ] 實作 KPICard 組件
- [ ] 實作 DepartmentCard 組件
- [ ] 實作 AlertCard 組件
- [ ] 整合 react-countup 數字動畫

### Phase 4: 圖表系統實作（2 週）

- [ ] 實作 TrendLineChart（Recharts）
- [ ] 實作 OperationalRadarChart（Recharts）
- [ ] 實作 RadialProgressChart（Recharts）
- [ ] 實作 KnowledgeFlowHeatmap（D3.js）

### Phase 5: 佈局整合（1 週）

- [ ] 建立 WarRoomLayout 全寬畫布
- [ ] 實作背景效果（漸層 + 網格 + 光暈）
- [ ] 實作響應式網格系統
- [ ] 整合 Framer Motion 進場動畫

### Phase 6: 優化與測試（1 週）

- [ ] 無障礙測試（鍵盤導航、螢幕閱讀器）
- [ ] 效能優化（減少重渲染、程式碼分割）
- [ ] 跨瀏覽器測試（Chrome、Safari、Firefox）
- [ ] 響應式測試（320px → 1920px）
- [ ] 深色模式對比度檢查（WCAG AAA）

---

## 📚 參考資源

### 設計靈感

- **Cyberpunk 2077 UI** - 霓虹光暈、掃描線效果
- **Blade Runner 2049** - 全息投影美學
- **Iron Man Jarvis UI** - 高科技戰情室介面
- **Bloomberg Terminal** - 高密度資料視覺化

### 技術文件

- [Tailwind CSS 官方文件](https://tailwindcss.com/docs)
- [Framer Motion 官方文件](https://www.framer.com/motion/)
- [Recharts 官方文件](https://recharts.org/en-US/)
- [D3.js 官方文件](https://d3js.org/)
- [Next.js 圖片優化](https://nextjs.org/docs/app/building-your-application/optimizing/images)

### 無障礙指南

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project](https://www.a11yproject.com/)

---

## 🎯 設計原則總結

1. **一致性優先**：所有組件遵循統一的色彩、間距、動畫規範
2. **效能至上**：避免過度動畫、優化圖表渲染、使用 React.memo
3. **無障礙必備**：鍵盤導航、螢幕閱讀器支援、高對比度
4. **響應式設計**：手機到 4K 螢幕的完整支援
5. **科技感美學**：毛玻璃 + 霓虹光暈 + Cyberpunk 元素
6. **資訊密度平衡**：高密度數據 + 清晰層次結構

---

**文件版本**: v1.0
**建立日期**: 2026-01-06
**作者**: Enterprise Command Center Design Team
**基於**: UI/UX Pro Max Design Intelligence System
