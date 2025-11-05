-- Add metadata JSONB column to physical_access_rewards table
-- This allows storing additional configuration details and metadata

ALTER TABLE IF EXISTS physical_access_rewards
ADD COLUMN IF NOT EXISTS metadata JSONB;

