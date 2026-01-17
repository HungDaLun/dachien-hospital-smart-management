import { z } from 'zod';

/**
 * 技能 (Skill) 相關的型別定義
 */

export const McpToolSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    inputSchema: z.any(), // JSON Schema
});

export type McpTool = z.infer<typeof McpToolSchema>;

export const EakapSkillSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    category: z.string().default('General'),
    system_prompt_template: z.string(),
    input_schema: z.any().optional(), // JSON Schema for variables in prompt

    // Knowledge Requirements
    required_frameworks: z.array(z.string()).optional(),
    required_dikw_levels: z.array(z.string()).optional(),
    department_scope: z.array(z.string()).optional(),

    // Metadata
    author: z.string().optional(),
    version: z.string().default('1.0.0'),
    license: z.string().optional(),
    tags: z.array(z.string()).optional(),

    // Config
    mcp_config: z.object({
        tools: z.array(McpToolSchema).optional(),
    }).optional(),

    model_config: z.object({
        preferred_model: z.string().optional(),
        temperature: z.number().optional(),
    }).optional(),
});

export type EakapSkill = z.infer<typeof EakapSkillSchema>;

export interface Skill {
    id: string; // UUID
    name: string; // English ID (e.g., 'customer_service_sop')
    display_name: string; // Traditional Chinese Name
    description: string;
    category: string;
    version: string;
    prompt_instruction: string; // The instruction injected into System Prompt
    author?: string;
    is_official: boolean;
    is_active: boolean;
    icon?: string;
    created_at: string;
    updated_at: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
}

export interface SkillCategory {
    id: string;
    name: string;
    display_name: string;
    description?: string;
}

/**
 * 技能載入結果
 */
export interface LoadedSkill {
    name: string;
    display_name: string;
    instruction: string;
}
