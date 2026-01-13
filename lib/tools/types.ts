export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any; // Allow Zod schema or JSON schema objects
  execute?: (params: any, context?: any) => Promise<any>;
}

export interface ToolContext {
  userId: string;
  agentId?: string;
  sessionId?: string;
  organizationId?: string; // Optional, might be needed for organization-level settings
}

export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
}

export interface ToolImplementation {
  (params: any, context: ToolContext): Promise<any>;
}

export interface Tool {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  category: string;
  functionDeclaration: ToolDefinition;
  requiresApiKey?: boolean;
  apiKeyConfig?: Record<string, { name: string; description: string }>;
  isPremium?: boolean;
  implementation?: ToolImplementation;
}

export interface ToolLogEntry {
  id: string;
  agent_id?: string;
  session_id?: string;
  user_id?: string;
  tool_name: string;
  input_params: any;
  output_result?: any;
  status: 'pending' | 'running' | 'success' | 'failed';
  error_message?: string;
  execution_time_ms?: number;
  created_at: string;
}
