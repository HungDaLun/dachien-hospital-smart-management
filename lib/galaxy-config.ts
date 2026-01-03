/**
 * Galaxy Graph 視覺化設定
 * Neural Galaxy 2.0 三階段效能配置
 */

export interface GalaxyVisualizationConfig {
    /** Phase A: CSS 神經脈動（永遠啟用） */
    enableCSSAnimation: boolean;

    /** Phase B: Canvas 粒子系統（節點數 < maxNodes 時啟用） */
    enableParticles: boolean;
    maxNodesForParticles: number;

    /** Phase C: WebGL 後處理（需手動啟用） */
    enableWebGL: boolean;
    bloomIntensity: number;
    depthIntensity: number;
}

/**
 * 預設配置 - 平衡效能與視覺
 */
export const DEFAULT_GALAXY_CONFIG: GalaxyVisualizationConfig = {
    // Phase A: 基礎神經脈動（CSS Only - 高效能）
    enableCSSAnimation: true,

    // Phase B: 進階粒子系統（Canvas 2D - 中效能）
    enableParticles: true,
    maxNodesForParticles: 100, // 節點超過 100 個時自動禁用

    // Phase C: 極致視覺（WebGL - 需 GPU）
    enableWebGL: false, // 預設禁用，需手動啟用
    bloomIntensity: 0.5,
    depthIntensity: 0.3,
};

/**
 * 旗艦版配置 - 極致視覺體驗（需高階硬體）
 */
export const FLAGSHIP_GALAXY_CONFIG: GalaxyVisualizationConfig = {
    enableCSSAnimation: true,
    enableParticles: true,
    maxNodesForParticles: 200,
    enableWebGL: true, // ✨ 啟用 WebGL
    bloomIntensity: 0.8,
    depthIntensity: 0.5,
};

/**
 * 效能優先配置 - 低階裝置適用
 */
export const PERFORMANCE_GALAXY_CONFIG: GalaxyVisualizationConfig = {
    enableCSSAnimation: true,
    enableParticles: false, // 禁用粒子
    maxNodesForParticles: 50,
    enableWebGL: false,
    bloomIntensity: 0,
    depthIntensity: 0,
};

/**
 * 根據環境變數或使用者偏好取得配置
 */
export function getGalaxyConfig(): GalaxyVisualizationConfig {
    // 可從環境變數讀取
    const webglEnabled = process.env.NEXT_PUBLIC_ENABLE_WEBGL === 'true';

    if (webglEnabled) {
        return FLAGSHIP_GALAXY_CONFIG;
    }

    return DEFAULT_GALAXY_CONFIG;
}
