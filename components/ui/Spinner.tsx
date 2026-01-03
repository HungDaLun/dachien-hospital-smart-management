/**
 * Spinner 元件
 * 載入指示器，用於顯示載入狀態
 * 遵循 EAKAP 設計系統規範
 */
'use client';

/**
 * Spinner 尺寸類型
 */
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Spinner 變體類型
 */
export type SpinnerVariant = 'default' | 'pulse' | 'orbit' | 'dots';

/**
 * Spinner 屬性介面
 */
export interface SpinnerProps {
    /** 尺寸 */
    size?: SpinnerSize;
    /** 顏色（CSS 類名） */
    color?: string;
    /** 變體 */
    variant?: SpinnerVariant;
    /** 額外的 className */
    className?: string;
}

/**
 * 尺寸樣式對照
 */
const sizeStyles: Record<SpinnerSize, { container: string; border: string }> = {
    sm: { container: 'w-4 h-4', border: 'border-2' },
    md: { container: 'w-6 h-6', border: 'border-2' },
    lg: { container: 'w-10 h-10', border: 'border-3' },
    xl: { container: 'w-14 h-14', border: 'border-4' },
};

/**
 * Spinner 元件
 * 
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" variant="pulse" />
 * <Spinner variant="orbit" color="border-accent-violet" />
 * ```
 */
export function Spinner({
    size = 'md',
    color = 'border-primary-500',
    variant = 'default',
    className = ''
}: SpinnerProps) {
    const sizeConfig = sizeStyles[size];

    // 預設旋轉 Spinner
    if (variant === 'default') {
        return (
            <div
                role="status"
                aria-label="載入中"
                className={`
                    ${sizeConfig.container}
                    ${sizeConfig.border}
                    border-solid border-t-transparent
                    ${color}
                    rounded-full
                    animate-spin
                    ${className}
                `}
            />
        );
    }

    // 脈動變體
    if (variant === 'pulse') {
        return (
            <div
                role="status"
                aria-label="載入中"
                className={`
                    ${sizeConfig.container}
                    rounded-full
                    bg-primary-500
                    animate-pulse-slow
                    ${className}
                `}
            />
        );
    }

    // 軌道變體 - 雙環旋轉
    if (variant === 'orbit') {
        return (
            <div
                role="status"
                aria-label="載入中"
                className={`relative ${sizeConfig.container} ${className}`}
            >
                <div
                    className={`
                        absolute inset-0
                        ${sizeConfig.border}
                        border-solid border-t-transparent
                        ${color}
                        rounded-full
                        animate-spin
                    `}
                />
                <div
                    className={`
                        absolute inset-1
                        border-2
                        border-solid border-b-transparent
                        border-accent-violet
                        rounded-full
                        animate-spin
                    `}
                    style={{ animationDirection: 'reverse', animationDuration: '0.6s' }}
                />
            </div>
        );
    }

    // 三點變體
    if (variant === 'dots') {
        return (
            <div
                role="status"
                aria-label="載入中"
                className={`flex items-center gap-1 ${className}`}
            >
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`
                            w-2 h-2 rounded-full bg-primary-500
                            animate-thinking
                        `}
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </div>
        );
    }

    return null;
}

export default Spinner;

