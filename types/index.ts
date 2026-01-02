/**
 * 全域型別定義
 * 遵循 EAKAP 資料模型規範
 */

/**
 * 使用者角色
 */
export type UserRole = 'SUPER_ADMIN' | 'DEPT_ADMIN' | 'EDITOR' | 'USER';

/**
 * Gemini 檔案狀態
 */
export type GeminiState =
  | 'PENDING'       // 上傳中/等待處理
  | 'PROCESSING'    // 背景處理中
  | 'SYNCED'        // 已同步至 Gemini
  | 'NEEDS_REVIEW'  // 品質未達標準
  | 'REJECTED'      // 管理員拒絕
  | 'FAILED';       // 系統處理失敗

/**
 * 使用者介面
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  department_id: string | null;
  created_at: string;
}

/**
 * 部門介面
 */
export interface Department {
  id: string;
  name: string;
  description: string | null;
}

/**
 * 檔案介面（Dual-Layer Design）
 */
export interface File {
  id: string;
  filename: string;

  // Layer 1: Hub (S3/MinIO)
  s3_storage_path: string | null;
  s3_etag: string | null;

  // Layer 2: Spoke (Gemini)
  gemini_file_uri: string | null;
  gemini_state: GeminiState;

  // 預留欄位（未來擴展）
  openai_file_id: string | null;
  claude_file_id: string | null;

  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  is_active: boolean;

  // Phase 2: DIKW Engine
  markdown_content: string | null;
  metadata_analysis: Record<string, any> | null;

  created_at: string;
}

/**
 * Agent 介面
 */
export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  model_version: string;
  department_id: string | null;
  created_by: string;
  created_at: string;
}

/**
 * Agent 知識綁定規則
 */
export interface AgentKnowledgeRule {
  agent_id: string;
  rule_type: 'FOLDER' | 'TAG' | 'DEPARTMENT';
  rule_value: string; // e.g., "tag:marketing"
}

/**
 * Agent 存取控制
 */
export interface AgentAccessControl {
  agent_id: string;
  user_id_or_dept_id: string;
  can_access: boolean;
}

/**
 * 知識框架定義 (Phase 2)
 */
export interface KnowledgeFramework {
  id: string;
  code: string;
  name: string;
  description: string | null;
  schema: {
    sections: Array<{
      key: string;
      label: string;
      type: 'text' | 'list' | 'number' | 'date';
      description?: string;
    }>;
    [key: string]: any;
  };
  visual_type: 'quadrant' | 'list' | 'network' | 'default';
  ui_config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * 知識實例 (Phase 2)
 */
export interface KnowledgeInstance {
  id: string;
  framework_id: string;
  title: string | null;
  data: Record<string, any>; // 對應 schema 的 key
  completeness: number;
  confidence: number;
  source_file_ids: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}
