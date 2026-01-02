import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile } from '@/lib/permissions';
import { toApiResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

// Helper types for Graph
interface GraphNode {
    id: string;
    type: 'file' | 'framework_instance';
    label: string;
    data: any;
    position?: { x: number; y: number }; // Optional, usually calculated by layout engine
}

interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type: 'derived_from';
}

/**
 * GET /api/knowledge/graph
 * Get nodes and edges for the Knowledge Galaxy
 * Query params:
 * - department_id: Optional filter (if Admin)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const profile = await getCurrentUserProfile();
        const searchParams = request.nextUrl.searchParams;

        // Determine Department Scope
        let targetDeptId = profile.department_id;

        // Super Admin can switch views
        if (profile.role === 'SUPER_ADMIN') {
            const requestedDept = searchParams.get('department_id');
            if (requestedDept) {
                targetDeptId = requestedDept;
            } else {
                // If no dept specified, maybe show strict own uploads or all? 
                // Let's default to "All" for Super Admin if null, but that might be too big.
                // For now, let's keep it null means "All"
                targetDeptId = null;
            }
        }

        // 1. Fetch Files (Data Layer)
        let filesQuery = supabase
            .from('files')
            .select('id, filename, mime_type, created_at, metadata_analysis')
            .eq('is_active', true)
            .eq('gemini_state', 'SYNCED');

        if (targetDeptId) {
            filesQuery = filesQuery.eq('department_id', targetDeptId);
        }

        const { data: files, error: filesError } = await filesQuery;
        if (filesError) throw filesError;

        // 2. Fetch Knowledge Instances (Information Layer)
        let instancesQuery = supabase
            .from('knowledge_instances')
            .select(`
                id, 
                title, 
                framework_id, 
                framework:knowledge_frameworks(code, name, ui_config),
                completeness,
                confidence,
                content_data,
                source_file_ids,
                created_at
            `);

        if (targetDeptId) {
            instancesQuery = instancesQuery.eq('department_id', targetDeptId);
        }

        const { data: instances, error: instancesError } = await instancesQuery;
        if (instancesError) throw instancesError;

        // 3. Construct Graph
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];

        // Files -> Nodes
        files.forEach((file) => {
            // Simple consistent random positioning for now, or 0,0
            // Layout will be handled by React Flow or Dagre on client
            nodes.push({
                id: file.id,
                type: 'file',
                label: file.filename,
                data: {
                    mimeType: file.mime_type,
                    metadata: file.metadata_analysis
                }
            });
        });

        // Instances -> Nodes & Edges
        instances.forEach((inst) => {
            nodes.push({
                id: inst.id,
                type: 'framework_instance',
                label: inst.title,
                data: {
                    frameworkCode: (inst.framework as any)?.code,
                    frameworkName: (inst.framework as any)?.name,
                    uiConfig: (inst.framework as any)?.ui_config,
                    completeness: inst.completeness,
                    confidence: inst.confidence,
                    contentData: (inst as any).content_data // Cast simply for now as we didn't add type to query var
                }
            });

            // Edges from Source Files to Instance
            if (inst.source_file_ids && Array.isArray(inst.source_file_ids)) {
                inst.source_file_ids.forEach(fileId => {
                    // Only add edge if file node exists (it strictly should if RLS allows)
                    if (nodes.find(n => n.id === fileId)) {
                        edges.push({
                            id: `e-${fileId}-${inst.id}`,
                            source: fileId,
                            target: inst.id,
                            type: 'derived_from'
                        });
                    }
                });
            }
        });

        return NextResponse.json({ nodes, edges });

    } catch (error) {
        return toApiResponse(error);
    }
}
