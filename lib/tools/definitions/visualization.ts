import { ToolDefinition } from '../types';
import { SchemaType } from '@google/generative-ai';

export const generate_chart: ToolDefinition = {
    name: 'generate_chart',
    description: 'Generate a structured JSON configuration for rendering charts (Bar, Line, Pie, Area) based on provided data.',
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            chartType: {
                type: SchemaType.STRING,
                enum: ['bar', 'line', 'pie', 'area'],
                description: 'The type of chart to generate.'
            },
            title: {
                type: SchemaType.STRING,
                description: 'The title of the chart.'
            },
            data: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.OBJECT },
                description: 'The array of data objects to visualize.'
            },
            xAxisKey: {
                type: SchemaType.STRING,
                description: 'The key in data objects to use for the X-axis (category).'
            },
            seriesKeys: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'The keys in data objects to use for data series (values).'
            },
            colors: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
                description: 'Optional list of hex colors for the series.'
            }
        },
        required: ['chartType', 'title', 'data', 'xAxisKey', 'seriesKeys']
    },
    execute: async (params) => {
        const { chartType, title, data, xAxisKey, seriesKeys, colors } = params as {
            chartType: string;
            title: string;
            data: Record<string, unknown>[];
            xAxisKey: string;
            seriesKeys: string[];
            colors?: string[];
        };
        // In a real scenario, we might do data validation or transformation here.
        // For now, we return the config that the frontend can use to render a Recharts component.

        // Default colors if not provided
        const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
        const finalColors = colors || defaultColors;

        return {
            type: 'chart_config',
            config: {
                chartType,
                title,
                data,
                xAxisKey,
                seriesKeys,
                colors: finalColors.slice(0, seriesKeys.length)
            },
            message: `Chart configuration for '${title}' generated successfully.`
        };
    }
};
