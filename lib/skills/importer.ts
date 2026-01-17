import { EakapSkill, EakapSkillSchema, McpTool } from './types';

// Interfaces for External Formats (Simplified)

// Claude (Anthropic) - Based on their API and Project definitions
interface ClaudeProjectExport {
    name: string;
    description?: string;
    instructions: string; // System Prompt
    tools?: Array<{
        name: string;
        description?: string;
        input_schema: Record<string, unknown>;
    }>;
}

// OpenAI - Based on Assistant API
interface OpenAIAssistantExport {
    name: string;
    description?: string;
    instructions: string;
    model: string;
    tools?: Array<{
        type: 'function' | 'code_interpreter' | 'retrieval';
        function?: {
            name: string;
            description?: string;
            parameters: Record<string, unknown>;
        };
    }>;
    metadata?: Record<string, string>;
}

export class SkillsImporter {

    static detectFormat(content: any): 'claude' | 'openai' | 'eakap' | 'unknown' {
        if (content.required_frameworks && content.system_prompt_template) return 'eakap';
        if (content.instructions && content.tools?.some((t: any) => t.function)) return 'openai';
        if (content.instructions && !content.model) return 'claude'; // Heuristic
        return 'unknown';
    }

    static import(rawContent: string | object): EakapSkill {
        const content = typeof rawContent === 'string' ? JSON.parse(rawContent) : rawContent;
        const format = this.detectFormat(content);

        let skill: Partial<EakapSkill> = {};

        switch (format) {
            case 'claude':
                skill = this.importFromClaude(content);
                break;
            case 'openai':
                skill = this.importFromOpenAI(content);
                break;
            case 'eakap':
                return EakapSkillSchema.parse(content);
            default:
                throw new Error('Unknown skill format');
        }

        // Apply defaults and validate
        return EakapSkillSchema.parse({
            ...skill,
            version: '1.0.0',
            author: 'Imported',
            category: 'Imported',
        });
    }

    private static importFromClaude(data: ClaudeProjectExport): Partial<EakapSkill> {
        const mcpTools: McpTool[] = (data.tools || []).map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: t.input_schema,
        }));

        return {
            name: data.name || 'Untitled Claude Skill',
            description: data.description,
            system_prompt_template: data.instructions,
            mcp_config: {
                tools: mcpTools,
            },
            tags: ['claude-import'],
        };
    }

    private static importFromOpenAI(data: OpenAIAssistantExport): Partial<EakapSkill> {
        const mcpTools: McpTool[] = (data.tools || [])
            .filter(t => t.type === 'function' && t.function)
            .map(t => ({
                name: t.function!.name,
                description: t.function!.description,
                inputSchema: t.function!.parameters,
            }));

        return {
            name: data.name || 'Untitled OpenAI Assistant',
            description: data.description,
            system_prompt_template: data.instructions,
            mcp_config: {
                tools: mcpTools,
            },
            model_config: {
                preferred_model: 'gemini-3-flash', // Map GPT-4 to Gemini 3
                temperature: 0.7,
            },
            tags: ['openai-import'],
        };
    }
}
