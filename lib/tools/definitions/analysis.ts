import { ToolDefinition } from '../types';
import { z } from 'zod';

export const calculate_statistics: ToolDefinition = {
    name: 'calculate_statistics',
    description: 'Perform basic statistical analysis on a dataset.',
    parameters: z.object({
        dataset: z.array(z.number()).describe('Array of numbers to analyze.'),
        metrics: z.array(z.enum(['mean', 'median', 'mode', 'min', 'max', 'sum', 'std_dev'])).describe('List of metrics to calculate.'),
    }),
    execute: async (params) => {
        const { dataset, metrics } = params as { dataset: number[]; metrics: string[] };
        if (dataset.length === 0) {
            return { error: 'Dataset is empty.' };
        }

        const results: Record<string, number> = {};
        const sum = dataset.reduce((a: number, b: number) => a + b, 0);
        const mean = sum / dataset.length;

        dataset.sort((a: number, b: number) => a - b);

        if (metrics.includes('sum')) results.sum = sum;
        if (metrics.includes('mean')) results.mean = mean;
        if (metrics.includes('min')) results.min = dataset[0];
        if (metrics.includes('max')) results.max = dataset[dataset.length - 1];

        if (metrics.includes('median')) {
            const mid = Math.floor(dataset.length / 2);
            results.median = dataset.length % 2 !== 0 ? dataset[mid] : (dataset[mid - 1] + dataset[mid]) / 2;
        }

        // Basic Mode (first one found)
        if (metrics.includes('mode')) {
            const counts: Record<number, number> = {};
            let maxCount = 0;
            let mode = dataset[0];
            for (const n of dataset) {
                counts[n] = (counts[n] || 0) + 1;
                if (counts[n] > maxCount) {
                    maxCount = counts[n];
                    mode = n;
                }
            }
            results.mode = mode;
        }

        return {
            count: dataset.length,
            results,
            message: 'Statistics calculated successfully.'
        };
    }
};

export const web_search: ToolDefinition = {
    name: 'web_search',
    description: 'Search the public web for information. Use this when you need current information not available in your internal knowledge base.',
    parameters: z.object({
        query: z.string().describe('The search query.'),
        numResults: z.number().optional().default(3).describe('Number of results to return.'),
    }),
    execute: async (params) => {
        const { query, numResults } = params as { query: string; numResults: number };
        // Mock Web Search
        // In production, integrate with Tavily API, Google Custom Search JSON API, or Bing Search API.
        console.log(`[Mock Web Search] Query: ${query}`);

        const mockResults = [
            {
                title: `${query} - Wikipedia`,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
                snippet: `Hypertext markup for ${query} is a standard...`
            },
            {
                title: `Latest News about ${query}`,
                url: `https://news.example.com/${encodeURIComponent(query)}`,
                snippet: `Breaking news: ${query} has seen a 20% increase in adoption...`
            },
            {
                title: `Official Documentation for ${query}`,
                url: `https://docs.example.com/${encodeURIComponent(query)}`,
                snippet: `Learn how to use ${query} effectively with our comprehensive guide...`
            }
        ];

        return {
            query,
            results: mockResults.slice(0, numResults),
            source: 'Mock Search Engine',
            message: 'Search completed successfully.'
        };
    }
};
