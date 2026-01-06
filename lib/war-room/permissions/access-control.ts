import { createClient } from '@/lib/supabase/server';
import { WarRoomAccessLevel } from '../types';

export class WarRoomAccessControl {
    /**
     * Check the access level for a given user.
     */
    async checkAccess(userId: string): Promise<WarRoomAccessLevel> {
        const supabase = await createClient();

        // 1. Get User Profile
        const { data: user, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !user) {
            console.error('Error fetching user profile:', error);
            return 'denied';
        }

        // 2. Check for Owner or C-Level Executive
        if (user.role === 'owner') {
            return 'owner';
        }

        const executiveRoles = ['ceo', 'cfo', 'cto', 'coo', 'vp'];
        if (user.role && executiveRoles.includes(user.role.toLowerCase())) {
            return 'executive';
        }

        // 3. Check for Department Head
        if (user.is_department_head) {
            return 'department';
        }

        return 'denied';
    }

    /**
     * Filter departments based on access level.
     */
    async filterVisibleDepartments(
        userId: string,
        allDepartments: any[]
    ): Promise<any[]> {
        const accessLevel = await this.checkAccess(userId);

        if (accessLevel === 'owner' || accessLevel === 'executive') {
            return allDepartments;
        }

        if (accessLevel === 'department') {
            const supabase = await createClient();
            const { data: user } = await supabase
                .from('user_profiles')
                .select('department_id')
                .eq('id', userId)
                .single();

            if (!user?.department_id) return [];

            // Logic: Visible = Own Department + Related Departments
            return allDepartments.filter(dept => {
                return dept.id === user.department_id;
            });
        }

        return [];
    }
}
