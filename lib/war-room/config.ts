import { createClient } from '@/lib/supabase/server';
import { WarRoomConfig } from './types';

export class WarRoomConfigManager {
    /**
     * Get configuration for a specific user.
     * If config doesn't exist, create a default one.
     */
    async getConfig(userId: string): Promise<WarRoomConfig | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('war_room_config')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Not found, create default
            return this.createDefaultConfig(userId);
        }

        if (error) {
            console.error('Error fetching war room config:', error);
            return null;
        }

        return data as WarRoomConfig;
    }

    /**
     * Create default configuration
     */
    private async createDefaultConfig(userId: string): Promise<WarRoomConfig | null> {
        const supabase = await createClient();

        const defaultConfig = {
            user_id: userId,
            watch_topics: [],
            layout_config: {
                kpi_order: ["strategy", "operations", "financial", "risk", "intelligence"],
                department_display_mode: "grid",
                show_ai_insights: true
            },
            notification_preferences: {
                email_daily_summary: true,
                push_critical_risks: true,
                push_high_opportunities: false
            }
        };

        const { data, error } = await supabase
            .from('war_room_config')
            .insert(defaultConfig)
            .select()
            .single();

        if (error) {
            console.error('Error creating default config:', error);
            return null;
        }

        return data as WarRoomConfig;
    }

    /**
     * Update configuration
     */
    async updateConfig(userId: string, updates: Partial<WarRoomConfig>): Promise<WarRoomConfig | null> {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('war_room_config')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating war room config:', error);
            return null;
        }

        return data as WarRoomConfig;
    }
}
