/**
 * MCP Servers 管理 API
 * 僅 SUPER_ADMIN 可以存取
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUserProfile, requireSuperAdmin } from '@/lib/permissions';
import { toApiResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/system/mcp-servers
 * 取得所有 MCP Servers
 */
export async function GET(_request: NextRequest) {
  try {
    // 檢查權限（僅 SUPER_ADMIN）
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);

    const supabase = createAdminClient();

    const { data: servers, error } = await supabase
      .from('mcp_servers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: servers || []
    });

  } catch (error: unknown) {
    console.error('[MCP Servers API] GET Error:', error);
    return toApiResponse(error);
  }
}

/**
 * POST /api/system/mcp-servers
 * 建立新的 MCP Server
 */
export async function POST(request: NextRequest) {
  try {
    // 檢查權限（僅 SUPER_ADMIN）
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);

    const body = await request.json();
    const {
      name,
      display_name,
      description,
      server_url,
      server_type = 'http',
      api_key,
      capabilities = []
    } = body;

    // 驗證必填欄位
    if (!name || !display_name || !server_url) {
      return NextResponse.json(
        { error: { message: 'name, display_name, server_url 為必填欄位' } },
        { status: 400 }
      );
    }

    // 驗證 capabilities 格式
    if (!Array.isArray(capabilities)) {
      return NextResponse.json(
        { error: { message: 'capabilities 必須是陣列' } },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('mcp_servers')
      .insert({
        name,
        display_name,
        description,
        server_url,
        server_type,
        api_key: api_key || null,
        capabilities,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: { message: `名稱 "${name}" 已存在` } },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: unknown) {
    console.error('[MCP Servers API] POST Error:', error);
    return toApiResponse(error);
  }
}

/**
 * PUT /api/system/mcp-servers/:id
 * 更新 MCP Server
 */
export async function PUT(request: NextRequest) {
  try {
    // 檢查權限（僅 SUPER_ADMIN）
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);

    const body = await request.json();
    const {
      id,
      name,
      display_name,
      description,
      server_url,
      server_type,
      api_key,
      capabilities,
      is_active
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: { message: 'id 為必填欄位' } },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 構建更新物件（只包含提供的欄位）
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (display_name !== undefined) updates.display_name = display_name;
    if (description !== undefined) updates.description = description;
    if (server_url !== undefined) updates.server_url = server_url;
    if (server_type !== undefined) updates.server_type = server_type;
    if (api_key !== undefined) updates.api_key = api_key || null;
    if (capabilities !== undefined) {
      if (!Array.isArray(capabilities)) {
        return NextResponse.json(
          { error: { message: 'capabilities 必須是陣列' } },
          { status: 400 }
        );
      }
      updates.capabilities = capabilities;
    }
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from('mcp_servers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: { message: `名稱 "${name}" 已存在` } },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: unknown) {
    console.error('[MCP Servers API] PUT Error:', error);
    return toApiResponse(error);
  }
}

/**
 * DELETE /api/system/mcp-servers/:id
 * 刪除 MCP Server
 */
export async function DELETE(request: NextRequest) {
  try {
    // 檢查權限（僅 SUPER_ADMIN）
    const profile = await getCurrentUserProfile();
    requireSuperAdmin(profile);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: { message: 'id 為必填欄位' } },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('mcp_servers')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'MCP Server 已刪除'
    });

  } catch (error: unknown) {
    console.error('[MCP Servers API] DELETE Error:', error);
    return toApiResponse(error);
  }
}
