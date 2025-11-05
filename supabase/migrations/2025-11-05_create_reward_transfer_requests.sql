-- Table to track intent to transfer a reward delivery to another wallet
CREATE TABLE IF NOT EXISTS reward_transfer_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('digital', 'physical')),
  delivery_id TEXT NOT NULL,
  from_wallet TEXT NOT NULL,
  to_wallet TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


