/**
 * Framer Motion 動畫變體庫
 * 企業戰情室設計系統 - Animation Variants
 */

import { Variants } from 'framer-motion';

// ===== 基礎進場動畫 =====

/** 向上淡入動畫 */
export const fadeInUp: Variants = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.19, 1, 0.22, 1], // out-expo
        },
    },
};

/** 向下淡入動畫 */
export const fadeInDown: Variants = {
    hidden: {
        opacity: 0,
        y: -20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.19, 1, 0.22, 1],
        },
    },
};

/** 從右滑入動畫 */
export const slideInFromRight: Variants = {
    hidden: {
        x: 100,
        opacity: 0
    },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.35,
            ease: [0.19, 1, 0.22, 1],
        },
    },
};

/** 從左滑入動畫 */
export const slideInFromLeft: Variants = {
    hidden: {
        x: -100,
        opacity: 0
    },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.35,
            ease: [0.19, 1, 0.22, 1],
        },
    },
};

/** 縮放進入動畫 */
export const scaleIn: Variants = {
    hidden: {
        scale: 0.95,
        opacity: 0
    },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1], // smooth
        },
    },
};

/** 彈性縮放動畫 */
export const popIn: Variants = {
    hidden: {
        scale: 0.8,
        opacity: 0
    },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 15,
            stiffness: 300,
        },
    },
};

// ===== 容器動畫（子元素交錯）=====

/** 交錯容器動畫 */
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

/** 快速交錯容器動畫 */
export const staggerContainerFast: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.02,
        },
    },
};

/** 慢速交錯容器動畫 */
export const staggerContainerSlow: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

// ===== 互動動畫 =====

/** 懸停放大 */
export const hoverScale = {
    scale: 1.02,
    transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
    },
};

/** 懸停上移 */
export const hoverLift = {
    y: -4,
    transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
    },
};

/** 點擊縮小 */
export const tapScale = {
    scale: 0.98,
    transition: {
        duration: 0.1,
    },
};

// ===== 卡片專用動畫 =====

/** KPI 卡片動畫 */
export const kpiCardVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.19, 1, 0.22, 1],
        },
    },
};

/** 警報卡片動畫 */
export const alertCardVariants: Variants = {
    hidden: {
        opacity: 0,
        x: -20,
        scale: 0.98,
    },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.19, 1, 0.22, 1],
        },
    },
    exit: {
        opacity: 0,
        x: 20,
        scale: 0.98,
        transition: {
            duration: 0.2,
        },
    },
};

// ===== Modal 動畫 =====

/** Modal 背景遮罩動畫 */
export const modalOverlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.2,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.15,
        },
    },
};

/** Modal 內容動畫 */
export const modalContentVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 10,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: [0.19, 1, 0.22, 1],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: 0.15,
        },
    },
};

// ===== 側邊欄動畫 =====

/** 側邊欄滑入動畫 */
export const sidebarVariants: Variants = {
    hidden: {
        x: '-100%',
        opacity: 0,
    },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.19, 1, 0.22, 1],
        },
    },
    exit: {
        x: '-100%',
        opacity: 0,
        transition: {
            duration: 0.2,
        },
    },
};

// ===== 列表項目動畫 =====

/** 列表項目動畫 */
export const listItemVariants: Variants = {
    hidden: {
        opacity: 0,
        x: -10,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};

// ===== 工具函數 =====

/** 
 * 建立延遲動畫變體
 * @param delay - 延遲時間（秒）
 */
export const createDelayedFadeInUp = (delay: number): Variants => ({
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            delay,
            ease: [0.19, 1, 0.22, 1],
        },
    },
});

/**
 * 建立自訂交錯容器
 * @param staggerTime - 子元素間隔時間（秒）
 * @param delayChildren - 子元素開始延遲（秒）
 */
export const createStaggerContainer = (
    staggerTime: number = 0.1,
    delayChildren: number = 0.05
): Variants => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerTime,
            delayChildren,
        },
    },
});
