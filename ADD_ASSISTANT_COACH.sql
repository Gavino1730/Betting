-- Add assistant_coach column to teams table
-- Run this in Supabase SQL Editor to fix team editing

ALTER TABLE teams ADD COLUMN IF NOT EXISTS assistant_coach TEXT;

-- Update existing teams with assistant coach info
UPDATE teams 
SET assistant_coach = 'John Efstathiou'
WHERE name = 'Valley Catholic Boys Basketball';

UPDATE teams 
SET assistant_coach = ''
WHERE name = 'Valley Catholic Girls Basketball';
