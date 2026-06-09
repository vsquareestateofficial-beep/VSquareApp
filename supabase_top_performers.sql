-- Create top_performers table
CREATE TABLE IF NOT EXISTS top_performers (
    id INTEGER PRIMARY KEY DEFAULT 1,
    performers JSONB DEFAULT '[]'::jsonb,
    expiry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint to ensure only one record exists
ALTER TABLE top_performers
ADD CONSTRAINT single_top_performers_record
CHECK (id = 1);

-- Insert initial empty record if not exists
INSERT INTO top_performers (id, performers, expiry_at)
SELECT 1, '[]'::jsonb, NULL
WHERE NOT EXISTS (SELECT 1 FROM top_performers WHERE id = 1);
