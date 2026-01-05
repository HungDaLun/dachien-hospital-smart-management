-- Add knowledge decay related columns to files table

-- decay_type: The type of knowledge decay curve to apply (e.g., stable, technical, market)
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_type VARCHAR(20) DEFAULT 'reference';

-- decay_score: A calculated score from 0.0 to 1.0 representing the freshness/validity of the knowledge
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_score DECIMAL(3,2) DEFAULT 1.0;

-- decay_status: Textual representation of the status (e.g., 'fresh', 'decaying', 'expired')
ALTER TABLE files ADD COLUMN IF NOT EXISTS decay_status VARCHAR(20) DEFAULT 'fresh';

-- valid_until: Optional absolute expiration date
ALTER TABLE files ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ DEFAULT NULL;

-- Create index for filtering by decay status (useful for finding expired or fresh content)
CREATE INDEX IF NOT EXISTS idx_files_decay_status 
    ON files(decay_status);

-- Comment on columns for documentation
COMMENT ON COLUMN files.decay_type IS 'Knowledge decay curve type (stable, technical, market, event, procedural, reference)';
COMMENT ON COLUMN files.decay_score IS 'Calculated freshness score (0.0-1.0)';
COMMENT ON COLUMN files.decay_status IS 'Current decay status (fresh, decaying, expired)';
COMMENT ON COLUMN files.valid_until IS 'Explicit expiration date if applicable';
