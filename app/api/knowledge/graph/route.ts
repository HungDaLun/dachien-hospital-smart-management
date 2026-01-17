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
    data: Record<string, unknown>;
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
            .select('id, filename, mime_type, created_at, metadata_analysis, department_id, dikw_level')
            .eq('is_active', true)
            .eq('gemini_state', 'SYNCED');

        if (targetDeptId) {
            filesQuery = filesQuery.eq('department_id', targetDeptId);
        }

        const { data: files, error: filesError } = await filesQuery;
        if (filesError) {
            console.error('[Graph API] Files Fetch Error:', filesError);
            throw filesError;
        }

        // 2. Fetch Knowledge Instances (Information Layer)
        // Use the relationship name 'knowledge_frameworks' directly
        let instancesQuery = supabase
            .from('knowledge_instances')
            .select(`
                id, 
                title, 
                framework_id, 
                knowledge_frameworks(*),
                ai_summary,
                completeness,
                confidence,
                data,
                source_file_ids,
                created_at,
                department_id
            `);

        if (targetDeptId) {
            instancesQuery = instancesQuery.eq('department_id', targetDeptId);
        }

        const { data: instances, error: instancesError } = await instancesQuery;
        if (instancesError) {
            console.error('[Graph API] Instances Fetch Error:', instancesError);
            throw instancesError;
        }

        // 3. Construct Graph
        const nodes: GraphNode[] = [];
        const edges: GraphEdge[] = [];

        // Files -> Nodes (Handle potential null/undefined)
        (files || []).forEach((file) => {
            nodes.push({
                id: file.id,
                type: 'file',
                label: file.filename,
                data: {
                    mimeType: file.mime_type,
                    metadata: file.metadata_analysis,
                    // 強制校正：檔案類型的節點最高僅能出現在 Information 層，避面誤入 Knowledge/Wisdom 層
                    // 這是因為「文件」本身（不論內容）在大腦架構中皆屬於資料/資訊輸入層
                    dikwLevel: (file.dikw_level === 'knowledge' || file.dikw_level === 'wisdom')
                        ? 'information'
                        : (file.dikw_level || 'data')
                }
            });
        });

        // Instances -> Nodes & Edges
        interface KnowledgeInstance {
            id: string;
            title: string;
            framework_id: string;
            knowledge_frameworks?: {
                display_id?: string;
                name?: string;
                code?: string;
                detailed_definition?: string;
                structure_schema?: Record<string, unknown>;
                ui_config?: Record<string, unknown>;
            };
            ai_summary?: string;
            completeness?: number;
            confidence?: number;
            data?: Record<string, unknown>;
            source_file_ids?: string[];
            created_at: string;
            department_id?: string;
        }
        ((instances || []) as KnowledgeInstance[]).forEach((inst) => {
            nodes.push({
                id: inst.id,
                type: 'framework_instance',
                label: `${inst.knowledge_frameworks?.display_id || '??'} ${inst.knowledge_frameworks?.name || 'Unknown'}\n(${inst.title})`,
                data: {
                    frameworkCode: inst.knowledge_frameworks?.code,
                    frameworkName: inst.knowledge_frameworks?.name,
                    detailedDefinition: inst.knowledge_frameworks?.detailed_definition,
                    structureSchema: inst.knowledge_frameworks?.structure_schema,
                    uiConfig: inst.knowledge_frameworks?.ui_config,
                    aiSummary: inst.ai_summary,
                    completeness: inst.completeness,
                    confidence: inst.confidence,
                    contentData: inst.data
                }
            });

            // Edges from Source Files to Instance
            if (inst.source_file_ids && Array.isArray(inst.source_file_ids)) {
                inst.source_file_ids.forEach((fileId) => {
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

        console.log(`[Graph API] Returning ${nodes.length} nodes and ${edges.length} edges.`);
        return NextResponse.json({ nodes, edges });

    } catch (error) {
        return toApiResponse(error);
    }
}
