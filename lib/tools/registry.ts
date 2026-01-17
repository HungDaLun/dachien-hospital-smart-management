import { createAdminClient } from '@/lib/supabase/admin';
import { Tool, ToolDefinition } from './types';

// Cache to store tool definitions to reduce DB hits
// In a serverless environment, this might be cleared often, but helps within the same container execution
let toolsCache: Tool[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Load all active tools from the database
 * @param forceRefresh Force a refresh from the database
 */
export async function loadAllTools(forceRefresh = false): Promise<Tool[]> {
    const now = Date.now();
    if (!forceRefresh && toolsCache && (now - lastCacheTime < CACHE_TTL_MS)) {
        return toolsCache;
    }

    const supabase = createAdminClient();
    const { data: tools, error } = await supabase
        .from('tools_registry')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('Error loading tools from registry:', error);
        return [];
    }

    interface ToolRegistryRow {
        name: string;
        display_name: string;
        description: string;
        icon?: string;
        category: string;
        function_declaration: ToolDefinition;
        requires_api_key?: boolean;
        api_key_config?: Record<string, { name: string; description: string }>;
        is_premium?: boolean;
    }

    toolsCache = (tools as unknown as ToolRegistryRow[]).map((t) => ({
        name: t.name,
        displayName: t.display_name,
        description: t.description,
        icon: t.icon,
        category: t.category,
        functionDeclaration: t.function_declaration,
        requiresApiKey: t.requires_api_key,
        apiKeyConfig: t.api_key_config,
        isPremium: t.is_premium
    }));

    lastCacheTime = now;
    return toolsCache;
}

/**
 * Load specific tools by name
 */
export async function loadToolsByName(names: string[]): Promise<Tool[]> {
    const allTools = await loadAllTools();
    return allTools.filter(t => names.includes(t.name));
}

/**
 * Get tool definition (FunctionDeclaration) for Gemini
 */
export async function getToolDeclarations(names: string[]): Promise<{ functionDeclarations: ToolDefinition[] }> {
    const tools = await loadToolsByName(names);
    return {
        functionDeclarations: tools.map(t => t.functionDeclaration)
    };
}
