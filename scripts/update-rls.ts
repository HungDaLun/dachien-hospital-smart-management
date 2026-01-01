import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}



// I will attempt to run it using supabase CLI
import { execSync } from 'child_process';
import fs from 'fs';

async function runWithCLI() {
  const sql = `
    DROP POLICY IF EXISTS "使用者可看授權的 Agent" ON agents;
    CREATE POLICY "使用者可看授權的 Agent" ON agents
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
        OR
        created_by = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() 
            AND role = 'DEPT_ADMIN' 
            AND department_id = agents.department_id
        )
        OR
        EXISTS (
          SELECT 1 FROM agent_access_control aac
          WHERE aac.agent_id = agents.id
            AND (
              aac.user_id = auth.uid()
              OR
              (
                aac.department_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM user_profiles
                  WHERE id = auth.uid() AND department_id = aac.department_id
                )
              )
            )
            AND aac.can_access = true
        )
      );
  `;

  const tmpFile = path.resolve(process.cwd(), 'update_rls.sql');
  fs.writeFileSync(tmpFile, sql);

  try {
    // If local, we can use supabase db execute (if it exists) or just generic psql
    // For now, let's try 'supabase db execute' or similar if available, 
    // but the most reliable way for me is to use the dashboard if I were a human.
    // As an agent, I'll try 'supabase migration up' or similar.

    // Actually, I'll use the 'psql' command if I can get the DB URL
    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
    console.log(`Executing SQL using psql...`);
    execSync(`psql "${dbUrl}" -f ${tmpFile}`);
    console.log('✅ RLS Policy updated successfully');
  } catch (err) {
    console.error('❌ Failed to update RLS:', err);
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

runWithCLI();
