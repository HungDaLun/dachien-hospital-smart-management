import { ToolDefinition } from '../types';
import { z } from 'zod';

export const generate_chart: ToolDefinition = {
    name: 'generate_chart',
    description: 'Generate a structured JSON configuration for rendering charts (Bar, Line, Pie, Area) based on provided data.',
    parameters: z.object({
        chartType: z.enum(['bar', 'line', 'pie', 'area']).describe('The type of chart to generate.'),
        title: z.string().describe('The title of the chart.'),
        data: z.array(z.record(z.any())).describe('The array of data objects to visualize.'),
        xAxisKey: z.string().describe('The key in data objects to use for the X-axis (category).'),
        seriesKeys: z.array(z.string()).describe('The keys in data objects to use for data series (values).'),
        colors: z.array(z.string()).optional().describe('Optional list of hex colors for the series.'),
    }),
    execute: async ({ chartType, title, data, xAxisKey, seriesKeys, colors }) => {
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
