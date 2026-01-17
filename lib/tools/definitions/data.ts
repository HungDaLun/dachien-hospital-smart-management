import { ToolContext } from '../types';
// import { createAdminClient } from '@/lib/supabase/admin';

export async function query_business_data(params: any, _context: ToolContext) {
    const { data_type, filters, limit = 10 } = params;

    // Suppress unused warning
    console.log('[Mock Query] Filters:', filters, 'Limit:', limit);

    // This would usually connect to an external ERP or internal business tables.
    // We'll mock it or query a sample table if it existed.

    // For prototype/demo purposes, we return structured mock data based on the type.

    if (data_type === 'orders') {
        return [
            { id: 'ORD-001', customer: 'Acme Corp', amount: 5000, status: 'completed', date: '2025-12-01' },
            { id: 'ORD-002', customer: 'Globex', amount: 12000, status: 'processing', date: '2026-01-10' },
        ];
    }

    if (data_type === 'customers') {
        return [
            { id: 'CUST-001', name: 'Acme Corp', region: 'North America' },
            { id: 'CUST-002', name: 'Globex', region: 'Europe' },
        ];
    }

    return { message: `Query for ${data_type} executed (simulated)` };
}

export const queryBusinessData = query_business_data;
