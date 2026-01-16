export * from './types';
export * from './processor';
export * from './layers/citation-extractor';
export * from './layers/confidence-scorer';
export * from './layers/review-detector';

import { SafeguardProcessor } from './processor';

/**
 * 快速建立高風險處理器
 */
export function createHighRiskProcessor(): SafeguardProcessor {
    return new SafeguardProcessor('high');
}

/**
 * 快速建立中風險處理器
 */
export function createMediumRiskProcessor(): SafeguardProcessor {
    return new SafeguardProcessor('medium');
}

/**
 * 快速建立低風險處理器
 */
export function createLowRiskProcessor(): SafeguardProcessor {
    return new SafeguardProcessor('low');
}
