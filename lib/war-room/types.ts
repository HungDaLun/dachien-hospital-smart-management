export type WarRoomAccessLevel = 'denied' | 'department' | 'executive' | 'owner';

export interface WarRoomConfig {
    id: string;
    user_id: string;
    watch_topics: WatchTopic[];
    layout_config: {
        kpi_order: string[];
        department_display_mode: 'grid' | 'list';
        show_ai_insights: boolean;
    };
    notification_preferences: {
        email_daily_summary: boolean;
        push_critical_risks: boolean;
        push_high_opportunities: boolean;
    };
    created_at: string;
    updated_at: string;
}

export interface WatchTopic {
    id: string;
    name: string;
    keywords: string[];
    competitors: string[];
    suppliers: string[];
    risk_threshold: 'low' | 'medium' | 'high';
    sync_mode: 'manual' | 'auto';
    sync_interval_value?: number;
    sync_interval_unit?: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    last_synced_at?: string;
}

export interface MetricDefinition {
    id: string;
    name: string;
    unit: string;
    granularity: 'daily' | 'monthly' | 'quarterly';
    keywords: string[];
    conflict_policy: 'latest_wins' | 'human_review';
}

export interface MetricValue {
    id: string;
    metric_id: string;
    value: number;
    timestamp: string;
    dimensions: Record<string, string>;
    source_file_id?: string;
    confidence: number;
    is_active: boolean;
    created_at: string;
    user_id: string;
}

export interface InsightSnippet {
    id: string;
    source_file_id?: string;
    department_id?: string;
    content: string;
    tags: string[];
    significance: number;
    is_pushed: boolean;
    created_at: string;
    user_id: string;
}

export interface ExternalIntelligence {
    id: string;
    user_id: string;
    topic_id: string;
    title: string;
    source: string;
    url?: string;
    content?: string;
    published_at: string;
    fetched_at: string;
    relevance_score: number;
    risk_level?: 'low' | 'medium' | 'high' | 'critical';
    impact_areas: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    ai_summary?: string;
    key_points: string[];
    affected_entities: Record<string, string[]>;
    recommended_actions: string[];
    is_read: boolean;
    is_bookmarked: boolean;
    user_notes?: string;
    status: 'pending' | 'resolved' | 'dismissed';
}

export interface DepartmentDailyBrief {
    id: string;
    department_id: string;
    brief_date: string;
    top_updates: string[];
    key_metrics: {
        label: string;
        value: string;
        trend: 'up' | 'down' | 'stable';
        change_percentage?: number;
    }[];
    urgent_items: string[];
    ai_summary: string;
    insights: string[];
    stats: {
        total_files: number;
        files_updated_today: number;
        active_agents: number;
        conversations_count: number;
        knowledge_health_score: number;
    };
    generated_at: string;
}

export interface StrategicRecommendation {
    id: string;
    user_id: string;
    week_start_date: string;
    priority: 'high' | 'medium' | 'low';
    category: 'risk_mitigation' | 'opportunity' | 'efficiency' | 'innovation';
    title: string;
    problem?: string;
    recommendation: string;
    expected_benefit?: string;
    evidence_files: string[];
    next_steps: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'deferred';
    assigned_to?: string;
    due_date?: string;
    completed_at?: string;
    user_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CrossDepartmentInsight {
    id: string;
    user_id: string;
    type: 'opportunity' | 'risk' | 'conflict';
    title: string;
    description?: string;
    departments: string[];
    related_files: string[];
    importance_score: number;
    recommended_action?: string;
    status: 'active' | 'archived';
    created_at: string;
    expires_at?: string;
}
