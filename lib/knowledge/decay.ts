import { createClient } from '@/lib/supabase/server';

/**
 * Knowledge Decay Types
 * Defines the nature of knowledge and how quickly it becomes obsolete.
 */
export enum KnowledgeDecayType {
    STABLE = 'stable',         // Regulations, policies (Long shelf life)
    TECHNICAL = 'technical',   // API docs, libraries (Medium shelf life)
    MARKET = 'market',         // Competitor analysis, news (Short shelf life)
    EVENT = 'event',           // Meeting notes, daily reports (Very short shelf life)
    PROCEDURAL = 'procedural', // SOPs, How-to guides (Medium-Long shelf life)
    REFERENCE = 'reference'    // Encyclopedic knowledge (Long shelf life)
}

/**
 * Configuration for a decay curve
 */
interface DecayCurve {
    type: KnowledgeDecayType;
    halfLife: number;       // Days until score drops to 0.5
    minValidScore: number;  // Minimum score to be considered "fresh"
    decayFunction: 'exponential' | 'linear' | 'step';
}

/**
 * Decay Curve Configurations
 */
export const DECAY_CURVES: Record<KnowledgeDecayType, DecayCurve> = {
    [KnowledgeDecayType.STABLE]: {
        type: KnowledgeDecayType.STABLE,
        halfLife: 1095, // 3 years
        minValidScore: 0.3,
        decayFunction: 'exponential'
    },
    [KnowledgeDecayType.TECHNICAL]: {
        type: KnowledgeDecayType.TECHNICAL,
        halfLife: 365, // 1 year
        minValidScore: 0.4,
        decayFunction: 'exponential'
    },
    [KnowledgeDecayType.MARKET]: {
        type: KnowledgeDecayType.MARKET,
        halfLife: 90, // 3 months
        minValidScore: 0.5,
        decayFunction: 'exponential'
    },
    [KnowledgeDecayType.EVENT]: {
        type: KnowledgeDecayType.EVENT,
        halfLife: 30, // 1 month
        minValidScore: 0.3,
        decayFunction: 'exponential'
    },
    [KnowledgeDecayType.PROCEDURAL]: {
        type: KnowledgeDecayType.PROCEDURAL,
        halfLife: 548, // 1.5 years
        minValidScore: 0.5,
        decayFunction: 'step' // Stays valid until suddenly invalid
    },
    [KnowledgeDecayType.REFERENCE]: {
        type: KnowledgeDecayType.REFERENCE,
        halfLife: 730, // 2 years
        minValidScore: 0.4,
        decayFunction: 'linear'
    }
};

/**
 * Interface for file decay update
 */
interface FileDecayUpdate {
    id: string;
    decay_score: number;
    decay_status: 'fresh' | 'decaying' | 'expired';
}

/**
 * Calculate decay score for a single file
 */
export function calculateDecayScore(
    lastUpdated: Date,
    decayType: KnowledgeDecayType = KnowledgeDecayType.REFERENCE,
    validUntil: Date | null = null
): { score: number; status: 'fresh' | 'decaying' | 'expired' } {
    const now = new Date();

    // If explicitly expired
    if (validUntil && now > validUntil) {
        return { score: 0.0, status: 'expired' };
    }

    const curve = DECAY_CURVES[decayType] || DECAY_CURVES[KnowledgeDecayType.REFERENCE];
    const ageInDays = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);

    let score = 1.0;

    switch (curve.decayFunction) {
        case 'exponential':
            // Formula: N(t) = N0 * (1/2)^(t/halfLife)
            score = Math.pow(0.5, ageInDays / curve.halfLife);
            break;
        case 'linear':
            // Linear decay: 1.0 at day 0, 0.5 at halfLife, 0.0 at 2*halfLife
            // Slope m = -0.5 / halfLife
            score = Math.max(0, 1.0 - (0.5 / curve.halfLife) * ageInDays);
            break;
        case 'step':
            // Step: 1.0 until halfLife, then drops significantly
            // We'll treat "halfLife" as the expiry point for step function here roughly
            score = ageInDays > curve.halfLife ? 0.0 : 1.0;
            break;
    }

    // Determine status
    let status: 'fresh' | 'decaying' | 'expired' = 'fresh';
    if (score < curve.minValidScore) {
        status = 'expired';
    } else if (score < curve.minValidScore + 0.2) { // Buffer zone
        status = 'decaying';
    }

    return { score: Number(score.toFixed(2)), status };
}

/**
 * Update decay scores for all synced files
 * This function is intended to be called by a cron job or admin API
 */
export async function updateAllDecayScores() {
    const supabase = await createClient();

    // 1. Fetch all synced files
    const { data: files, error } = await supabase
        .from('files')
        .select('id, updated_at, decay_type, valid_until')
        .eq('gemini_state', 'SYNCED');

    if (error) {
        console.error('Error fetching files for decay update:', error);
        throw error;
    }

    if (!files || files.length === 0) {
        return { updated: 0, message: 'No files to update' };
    }

    const updates: FileDecayUpdate[] = [];

    // 2. Calculate new scores
    for (const file of files) {
        const lastUpdated = new Date(file.updated_at);
        // Cast string from DB to enum, defaulting to reference if invalid
        const decayType = (file.decay_type as KnowledgeDecayType) || KnowledgeDecayType.REFERENCE;
        const validUntil = file.valid_until ? new Date(file.valid_until) : null;

        const result = calculateDecayScore(lastUpdated, decayType, validUntil);

        updates.push({
            id: file.id,
            decay_score: result.score,
            decay_status: result.status
        });
    }

    // 3. specific update implementation
    // Since supabase-js doesn't support bulk update with different values easily in one query without RPC,
    // we will update in batches or use a loop. For thousands of files, RPC is better, but for now we'll iterate.
    // TODO: Optimize with RPC for production with large datasets.

    let successCount = 0;

    // Processing in chunks to avoid overwhelming the DB
    const processBatch = async (batch: FileDecayUpdate[]) => {
        const promises = batch.map(update =>
            supabase
                .from('files')
                .update({
                    decay_score: update.decay_score,
                    decay_status: update.decay_status
                })
                .eq('id', update.id)
                .then(({ error }) => {
                    if (!error) successCount++;
                })
        );
        await Promise.all(promises);
    };

    const BATCH_SIZE = 50;
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        await processBatch(updates.slice(i, i + BATCH_SIZE));
    }

    return {
        total: files.length,
        updated: successCount,
        message: `Successfully updated decay scores for ${successCount} files.`
    };
}
