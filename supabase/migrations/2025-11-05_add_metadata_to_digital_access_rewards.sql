-- Add metadata column to digital_access_rewards to persist content_type/code_type
ALTER TABLE IF EXISTS digital_access_rewards
ADD COLUMN IF NOT EXISTS metadata JSONB;


