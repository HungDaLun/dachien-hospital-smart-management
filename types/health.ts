/**
 * 健康檢查相關型別
 */

export interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  components: {
    database: ComponentHealth;
    storage: ComponentHealth;
    geminiApi: ComponentHealth;
    cache?: ComponentHealth;
  };
}
