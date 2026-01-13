import { ToolDefinition } from '../types';
import { z } from 'zod';

export const create_task: ToolDefinition = {
    name: 'create_task',
    description: 'Create a new task in the project management system.',
    parameters: z.object({
        title: z.string().describe('Task title'),
        description: z.string().optional().describe('Task description'),
        assignee: z.string().optional().describe('Email or name of the assignee'),
        dueDate: z.string().optional().describe('Due date in ISO format (YYYY-MM-DD)'),
        priority: z.enum(['low', 'medium', 'high']).default('medium').describe('Task priority'),
    }),
    execute: async (params) => {
        // Mock implementation - would typically insert into a 'tasks' table
        console.log('[Mock Tool] Creating Task:', params);

        return {
            taskId: `TASK-${Date.now().toString().slice(-4)}`,
            status: 'created',
            details: params,
            message: `Task '${params.title}' created successfully.`
        };
    }
};

export const summarize_document: ToolDefinition = {
    name: 'summarize_document',
    description: 'Summarize a long piece of text or specific content.',
    parameters: z.object({
        content: z.string().describe('The text content to summarize.'),
        maxLength: z.number().optional().default(200).describe('Approximate maximum length of the summary in words.'),
        format: z.enum(['bullet_points', 'paragraph']).default('paragraph').describe('Format of the summary.'),
    }),
    execute: async ({ content, maxLength: _maxLength, format }) => {
        // In a real implementation, this might call a separate LLM chain or use a specialized summarization model.
        // For this mock/demo, we'll simulate a summary.

        // Simple truncation for mock purposes if content is very long, to simulate processing
        const mockSummary = content.length > 500
            ? content.substring(0, 500) + '... (Summarized content would go here)'
            : `Summary of provided text: ${content}`;

        return {
            summary: mockSummary,
            originalLength: content.length,
            format,
            message: 'Content summarized successfully.'
        };
    }
};
