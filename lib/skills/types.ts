import { z } from 'zod';

// MCP Tool Definition (compatible with Model Context Protocol)
export const McpToolSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    inputSchema: z.record(z.any()), // JSON Schema for arguments
});

// MCP Resource Definition
export const McpResourceSchema = z.object({
    uri: z.string(),
    name: z.string(),
    description: z.string().optional(),
    mimeType: z.string().optional(),
});

// MCP Server Configuration
export const McpServerConfigSchema = z.object({
    command: z.string(),
    args: z.array(z.string()).default([]),
    env: z.record(z.string()).optional(),
});

// EAKAP Skill Schema (Our standard for Agent Recipes)
export const EakapSkillSchema = z.object({
    // Core Metadata
    id: z.string().uuid().optional(), // Optional for new imports
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    category: z.string().default("Custom"),
    author: z.string().default("Anonymous"),
    version: z.string().default("1.0.0"),
    license: z.string().default("MIT"),
    tags: z.array(z.string()).default([]),

    // Knowledge Requirements
    required_frameworks: z.array(z.string()).default([]), // codes from knowledge_frameworks table
    required_dikw_levels: z.array(z.enum(['data', 'information', 'knowledge', 'wisdom'])).default([]),
    department_scope: z.array(z.string()).default([]),

    // Prompt Engineering
    system_prompt_template: z.string().min(1, "System Prompt is required"),
    input_schema: z.record(z.any()).default({}), // Variables needed for template

    // MCP & Tool Use
    mcp_config: z.object({
        servers: z.record(McpServerConfigSchema).optional(),
        tools: z.array(McpToolSchema).optional(),
        resources: z.array(McpResourceSchema).optional(),
    }).default({}),

    // Model Preferences
    model_config: z.object({
        preferred_model: z.string().default("gemini-3-flash"),
        temperature: z.number().min(0).max(2).default(0.7),
        thinking_level: z.enum(['low', 'high']).optional(),
    }).default({}),
});

export type EakapSkill = z.infer<typeof EakapSkillSchema>;
export type McpTool = z.infer<typeof McpToolSchema>;
export type McpResource = z.infer<typeof McpResourceSchema>;
export type McpServerConfig = z.infer<typeof McpServerConfigSchema>;
