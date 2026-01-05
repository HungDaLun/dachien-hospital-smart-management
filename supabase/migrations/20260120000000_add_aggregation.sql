-- Create knowledge_units table
CREATE TABLE IF NOT EXISTS knowledge_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_name VARCHAR(255) NOT NULL, -- Core concept name (e.g. "Employee Onboarding")
    synthesized_knowledge TEXT, -- AI synthesized diverse knowledge
    completeness_score DECIMAL(3,2) DEFAULT 0.0,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    source_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create knowledge_unit_files table (Many-to-Many link between Units and Files)
CREATE TABLE IF NOT EXISTS knowledge_unit_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES knowledge_units(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    contribution TEXT, -- Description of what this file contributes to the unit
    weight DECIMAL(3,2) DEFAULT 1.0, -- Relevance weight
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(unit_id, file_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_unit_files_unit_id ON knowledge_unit_files(unit_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_unit_files_file_id ON knowledge_unit_files(file_id);

-- Comments
COMMENT ON TABLE knowledge_units IS 'Aggregated knowledge units synthesized from multiple file fragments.';
COMMENT ON TABLE knowledge_unit_files IS 'Link table connecting source files to knowledge units with contribution metadata.';
