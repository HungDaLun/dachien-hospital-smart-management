-- Add ai_summary to files table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'ai_summary') THEN
        ALTER TABLE files ADD COLUMN ai_summary TEXT;
    END IF;
END $$;
