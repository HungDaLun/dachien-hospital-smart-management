/**
 * Spinner 元件
 * 載入指示器，用於顯示載入狀態
 * 遵循 EAKAP 設計系統規範
 */
'use client';

/**
 * Spinner 尺寸類型
 */
export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Spinner 屬性介面
 */
export interface SpinnerProps {
    /** 尺寸 */
    size?: SpinnerSize;
    /** 顏色（CSS 類名） */
    color?: string;
    /** 額外的 className */
    className?: string;
}

/**
 * 尺寸樣式對照
 */
const sizeStyles: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
};

/**
 * Spinner 元件
 * 
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" />
 * <Spinner color="border-primary-500" />
 * ```
 */
export function Spinner({
    size = 'md',
    color = 'border-primary-500',
    className = ''
}: SpinnerProps) {
    return (
        <div
            role="status"
            aria-label="載入中"
            className={`
        ${sizeStyles[size]}
        border-solid border-t-transparent
        ${color}
        rounded-full
        animate-spin
        ${className}
      `}
        />
    );
}

export default Spinner;
