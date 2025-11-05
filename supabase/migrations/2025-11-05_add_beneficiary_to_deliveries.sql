-- Add beneficiary_wallet to deliveries (user can designate recipient at claim time)
ALTER TABLE IF EXISTS digital_access_deliveries
ADD COLUMN IF NOT EXISTS beneficiary_wallet TEXT;

ALTER TABLE IF EXISTS physical_access_deliveries
ADD COLUMN IF NOT EXISTS beneficiary_wallet TEXT;

