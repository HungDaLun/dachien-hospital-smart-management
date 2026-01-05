import { calculateDecayScore, KnowledgeDecayType, DECAY_CURVES } from '../lib/knowledge/decay';

function runTests() {
    console.log('Starting Knowledge Decay Logic Verification...');
    let passed = 0;
    let failed = 0;

    function assert(condition: boolean, message: string) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    }

    // Test 1: Fresh file (Stable type)
    {
        const now = new Date();
        const result = calculateDecayScore(now, KnowledgeDecayType.STABLE);
        assert(result.score === 1.0, 'Fresh stable file should have score 1.0');
        assert(result.status === 'fresh', 'Fresh stable file should have status fresh');
    }

    // Test 2: Half-life (Stable type, 3 years)
    {
        const now = new Date();
        const threeYearsAgo = new Date(now.getTime() - 1095 * 24 * 60 * 60 * 1000);
        const result = calculateDecayScore(threeYearsAgo, KnowledgeDecayType.STABLE);
        // Should be around 0.5
        assert(Math.abs(result.score - 0.5) < 0.01, `Stable file at half-life should be ~0.5 (got ${result.score})`);
    }

    // Test 3: Market type (Fast decay, 90 days half life)
    {
        const now = new Date();
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const result = calculateDecayScore(ninetyDaysAgo, KnowledgeDecayType.MARKET);
        assert(Math.abs(result.score - 0.5) < 0.01, `Market file at half-life should be ~0.5 (got ${result.score})`);

        // Check status near 0.5 for market (minValidScore is 0.5, so 0.5 is edge, usually "fresh" or "decaying" depending on strictness)
        // In our logic: if score < minValid + 0.2 => decaying.
        // Market minValid is 0.5. So 0.5 < 0.7, it should be decaying.
        assert(result.status === 'decaying', `Market file at 0.5 score should be decaying (minValid 0.5 + buffer 0.2)`);
    }

    // Test 4: Step function (Procedural)
    {
        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // < 1.5 years (548 days)
        const res1 = calculateDecayScore(oneYearAgo, KnowledgeDecayType.PROCEDURAL);
        assert(res1.score === 1.0, 'Procedural file within half-life should be 1.0');

        const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000); // > 1.5 years
        const res2 = calculateDecayScore(twoYearsAgo, KnowledgeDecayType.PROCEDURAL);
        assert(res2.score === 0.0, 'Procedural file after half-life should be 0.0');
        assert(res2.status === 'expired', 'Procedural file after half-life should be expired');
    }

    // Test 5: Explicit Expiration
    {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        // Updated recently, but valid_until was yesterday
        const result = calculateDecayScore(now, KnowledgeDecayType.STABLE, yesterday);
        assert(result.score === 0.0, 'Explicitly expired file should have score 0.0');
        assert(result.status === 'expired', 'Explicitly expired file should have status expired');
    }

    console.log(`\nTests Completed. Passed: ${passed}, Failed: ${failed}`);
    if (failed > 0) process.exit(1);
}

runTests();
