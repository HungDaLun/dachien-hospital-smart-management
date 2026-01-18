import { ToolDefinition } from '../types';
import { SchemaType } from '@google/generative-ai';

export const create_task: ToolDefinition = {
    name: 'create_task',
    description: 'Create a new task in the project management system.',
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            title: {
                type: SchemaType.STRING,
                description: 'Task title'
            },
            description: {
                type: SchemaType.STRING,
                description: 'Task description'
            },
            assignee: {
                type: SchemaType.STRING,
                description: 'Email or name of the assignee'
            },
            dueDate: {
                type: SchemaType.STRING,
                description: 'Due date in ISO format (YYYY-MM-DD)'
            },
            priority: {
                type: SchemaType.STRING,
                enum: ['low', 'medium', 'high'],
                description: 'Task priority'
            }
        },
        required: ['title']
    },
    execute: async (params) => {
        const { title, description: _description, assignee: _assignee, dueDate: _dueDate, priority: _priority } = params as {
            title: string;
            description?: string;
            assignee?: string;
            dueDate?: string;
            priority?: string;
        };

        // Mock implementation - would typically insert into a 'tasks' table
        console.log('[Mock Tool] Creating Task:', params);

        return {
            taskId: `TASK-${Date.now().toString().slice(-4)}`,
            status: 'created',
            details: params,
            message: `Task '${title}' created successfully.`
        };
    }
};

export const summarize_document: ToolDefinition = {
    name: 'summarize_document',
    description: 'Summarize a long piece of text or specific content.',
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            content: {
                type: SchemaType.STRING,
                description: 'The text content to summarize.'
            },
            maxLength: {
                type: SchemaType.NUMBER,
                description: 'Approximate maximum length of the summary in words.'
            },
            format: {
                type: SchemaType.STRING,
                enum: ['bullet_points', 'paragraph'],
                description: 'Format of the summary.'
            }
        },
        required: ['content']
    },
    execute: async (params) => {
        const { content, maxLength: _maxLength, format } = params as { content: string; maxLength?: number; format: string };
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
