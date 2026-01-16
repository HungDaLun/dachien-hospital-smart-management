/**
 * EAKAP 設計系統常數
 * 所有 UI 元件應引用此檔案，不應使用 arbitrary values
 * 
 * 基於 UI_DESIGN_AUDIT_REPORT.md 建立
 */

// ===== Typography =====
export const TYPOGRAPHY = {
    // 頁面標題 (H1)
    pageTitle: 'text-2xl md:text-3xl font-bold text-text-primary uppercase tracking-tight',

    // 區塊標題 (H2)
    sectionTitle: 'text-lg md:text-xl font-semibold text-text-primary uppercase tracking-widest',

    // 卡片標題
    cardTitle: 'text-lg font-semibold text-text-primary',

    // 內文
    body: 'text-base font-normal text-text-secondary',
    bodySmall: 'text-sm font-normal text-text-secondary',

    // 標籤與輔助
    label: 'text-xs font-bold uppercase tracking-widest',
    caption: 'text-xs font-medium text-text-tertiary',

    // 數據展示
    metric: 'text-3xl md:text-4xl font-bold font-mono text-primary-500',
    metricLabel: 'text-xs font-medium text-text-tertiary uppercase',
};

// ===== Spacing (頁面層級) =====
export const PAGE_SPACING = {
    // 標準頁面容器：手機 p-4 -> 平板 p-6 -> 大螢幕 p-8 -> 超大螢幕 p-10
    container: 'p-4 sm:p-6 lg:p-8 xl:p-10',

    // 全寬頁面（戰情室等）
    fullWidth: 'p-4 sm:p-6 lg:p-8 xl:p-10 w-full max-w-none',

    // 內容區域（有最大寬度限制）
    content: 'p-4 sm:p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto',

    // 區段間距
    section: 'space-y-6 md:space-y-8',

    // 卡片內部間距
    card: 'p-4 md:p-6',
};

// ===== Component Sizes =====
export const COMPONENT_SIZES = {
    button: {
        sm: 'px-3 py-2 text-sm gap-1.5 rounded-lg',
        md: 'px-4 py-3 text-base gap-2 rounded-xl', // Audit 建議 md 用 rounded-xl
        lg: 'px-6 py-4 text-lg gap-2 rounded-xl',
    },
    input: {
        sm: 'px-3 py-2 text-sm rounded-lg',
        md: 'px-4 py-3 text-base rounded-xl',
        lg: 'px-5 py-4 text-lg rounded-xl',
    },
};

// ===== Form Styles =====
export const FORM_STYLES = {
    // 統一標籤樣式：bold, uppercase, tracking-widest
    label: 'block text-xs font-bold text-white mb-2.5 uppercase tracking-widest',

    // 統一輸入框基礎樣式
    input: 'bg-white/[0.03] border-white/10 focus:border-primary-500/50 focus:ring-primary-500/20 placeholder:text-white/20',

    // 錯誤訊息
    error: 'mt-2 text-xs font-bold text-semantic-danger uppercase tracking-wide',

    // 提示文字
    hint: 'mt-2 text-xs font-medium text-white/50',
};

// ===== Gap System =====
export const GAP = {
    xs: 'gap-1',      // 4px - 緊湊元素
    sm: 'gap-2',      // 8px - 同行元素
    md: 'gap-4',      // 16px - 相關元素
    lg: 'gap-6',      // 24px - 區塊間
    xl: 'gap-8',      // 32px - 大區塊
};

// ===== Z-Index System =====
export const Z_INDEX = {
    base: 'z-0',
    dropdown: 'z-10',
    sticky: 'z-20',
    overlay: 'z-30',
    modal: 'z-40',
    toast: 'z-50',
    tooltip: 'z-60',
};

// ===== Animation Constants =====
export const ANIMATION = {
    hover: 'transition-all duration-200 ease-in-out',
    active: 'active:scale-95',
};
