import { ToolContext } from '../types';

// @ts-ignore
export async function export_csv(params: any, _context: ToolContext) {
    const { data, filename, columns } = params;

    if (!Array.isArray(data) || data.length === 0) {
        return { success: false, error: "Data must be a non-empty array" };
    }

    // Basic CSV generation
    const headers = columns || Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map((header: string) => {
            const val = row[header];
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');

    // In a real app, we might upload this to storage and return a signed URL.
    // Here we return the content directly or a "simulated" URL.

    return {
        success: true,
        filename: `${filename}.csv`,
        content_length: csvContent.length,
        download_url: `#mock-download/${filename}.csv`, // Frontend would handle this or we return base64
        preview: csvContent.substring(0, 200) + "..."
    };
}

export const exportCsv = export_csv;
