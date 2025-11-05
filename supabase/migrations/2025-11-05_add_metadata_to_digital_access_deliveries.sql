-- Add metadata JSONB to store extra payloads like content_type, code_type, etc.
ALTER TABLE IF EXISTS digital_access_deliveries
ADD COLUMN IF NOT EXISTS metadata JSONB;
