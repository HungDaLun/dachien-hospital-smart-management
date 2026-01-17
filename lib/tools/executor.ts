import { createAdminClient } from '@/lib/supabase/admin';
import { ToolContext, ToolExecutionResult, ToolImplementation } from './types';

// Import tool implementations
// We will uncomment these as we implement them
import { searchKnowledge } from './definitions/knowledge';
import { queryBusinessData } from './definitions/data';
import { sendEmail, sendNotification } from './definitions/communication';
import { exportCsv } from './definitions/export';
import { web_search, calculate_statistics } from './definitions/analysis';
import { generate_chart } from './definitions/visualization';
import { create_task, summarize_document } from './definitions/productivity';

const TOOL_IMPLEMENTATIONS: Record<string, ToolImplementation> = {
    search_knowledge: searchKnowledge,
    query_business_data: queryBusinessData,
    send_email: sendEmail,
    send_notification: sendNotification,
    export_csv: exportCsv,
    // Phase 3 tools (mapped but might be stubs for now)
    // Phase 3 tools
    web_search: web_search.execute!,
    generate_chart: generate_chart.execute!,
    create_task: create_task.execute!,
    summarize_document: summarize_document.execute!,
    calculate_statistics: calculate_statistics.execute!,
};

/**
 * Execute a tool by name with the given parameters and context.
 * Automatically logs the execution to the database.
 */
export async function executeTool(
    toolName: string,
    params: Record<string, unknown>,
    context: ToolContext
): Promise<ToolExecutionResult> {
    const supabase = createAdminClient();
    const startTime = Date.now();

    console.log(`[ToolExecutor] Starting execution of ${toolName}`, { params, context });

    // 1. Log execution start
    let logEntryId: string | null = null;
    try {
        const { data: logEntry, error: logError } = await supabase
            .from('tool_executions_log')
            .insert({
                tool_name: toolName,
                input_params: params,
                agent_id: context.agentId || null,
                session_id: context.sessionId || null,
                user_id: context.userId,
                status: 'pending' // Initial status
            })
            .select('id')
            .single();

        if (logError) {
            console.error('[ToolExecutor] Failed to create log entry:', logError);
            // We continue even if logging fails, but it's bad.
        } else {
            logEntryId = logEntry.id;
        }
    } catch (e) {
        console.error('[ToolExecutor] Exception creating log entry:', e);
    }

    try {
        // 2. Find implementation
        const implementation = TOOL_IMPLEMENTATIONS[toolName];
        if (!implementation) {
            throw new Error(`Tool implementation not found: ${toolName}`);
        }

        // 3. Update status to running
        if (logEntryId) {
            await supabase.from('tool_executions_log').update({ status: 'running' }).eq('id', logEntryId);
        }

        // 4. Execute
        const result = await implementation(params, context);

        // 5. Log success
        if (logEntryId) {
            await supabase
                .from('tool_executions_log')
                .update({
                    status: 'success',
                    output_result: result,
                    execution_time_ms: Date.now() - startTime
                })
                .eq('id', logEntryId);
        }

        console.log(`[ToolExecutor] Execution success for ${toolName}`);
        return { success: true, result };

    } catch (error: unknown) {
        console.error(`[ToolExecutor] Execution failed for ${toolName}:`, error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        // 6. Log failure
        if (logEntryId) {
            await supabase
                .from('tool_executions_log')
                .update({
                    status: 'failed',
                    error_message: errorMessage,
                    execution_time_ms: Date.now() - startTime
                })
                .eq('id', logEntryId);
        }

        return { success: false, error: errorMessage };
    }
}
