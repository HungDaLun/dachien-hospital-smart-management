import { NextResponse } from 'next/server';
import { loadAllTools } from '@/lib/tools/registry';

export async function GET() {
    try {
        const tools = await loadAllTools();

        // Group tools by category and count them
        const categoryMap = new Map<string, number>();

        tools.forEach(t => {
            const count = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, count + 1);
        });

        // Define display names for categories
        const categoryDisplayNames: Record<string, string> = {
            'knowledge': '知識與文件',
            'data': '數據與報表',
            'communication': '通訊與通知',
            'export': '匯出功能',
            'external': '外部服務',
            'task': '任務管理',
            'general': '一般工具'
        };

        const categories = Array.from(categoryMap.entries()).map(([key, count]) => ({
            category: key,
            display_name: categoryDisplayNames[key] || key,
            tools_count: count
        }));

        return NextResponse.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
