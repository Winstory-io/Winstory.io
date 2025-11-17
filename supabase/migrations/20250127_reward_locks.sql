-- ============================================
-- MIGRATION : Table reward_locks
-- Pour tracker le prélèvement des récompenses au MINT
-- ============================================

-- Table pour tracker le prélèvement des récompenses au MINT initial
CREATE TABLE IF NOT EXISTS reward_locks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_wallet TEXT NOT NULL,
  standard_total_locked DECIMAL(20,8) DEFAULT 0,
  premium_total_locked DECIMAL(20,8) DEFAULT 0,
  approval_tx_hash TEXT,
  lock_tx_hash TEXT,
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'unlocking', 'unlocked', 'failed')),
  error_message TEXT,
  locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_reward_locks_campaign ON reward_locks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_reward_locks_status ON reward_locks(status);
CREATE INDEX IF NOT EXISTS idx_reward_locks_creator ON reward_locks(creator_wallet);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_reward_locks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reward_locks_updated_at
BEFORE UPDATE ON reward_locks
FOR EACH ROW
EXECUTE FUNCTION update_reward_locks_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE reward_locks IS 'Tracks the locking of rewards at campaign MINT. Rewards are locked in Winstory smart contract to guarantee distribution.';
COMMENT ON COLUMN reward_locks.standard_total_locked IS 'Total amount of standard rewards locked (tokens/items)';
COMMENT ON COLUMN reward_locks.premium_total_locked IS 'Total amount of premium rewards locked (for Top 3)';
COMMENT ON COLUMN reward_locks.approval_tx_hash IS 'Transaction hash for token approval to Winstory contract';
COMMENT ON COLUMN reward_locks.lock_tx_hash IS 'Transaction hash for locking rewards in Winstory contract';
COMMENT ON COLUMN reward_locks.status IS 'Status: locked (initial), unlocking (in progress), unlocked (distributed), failed (error)';

