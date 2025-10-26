-- =====================================================
-- XP TRANSACTIONS SYSTEM
-- =====================================================
-- This migration creates a comprehensive XP tracking system
-- for campaign creation, moderation, and completion events

-- Create XP transaction types enum
CREATE TYPE xp_transaction_type AS ENUM (
  -- Campaign Creation
  'B2C_MINT',
  'AGENCY_MINT',
  'INDIVIDUAL_MINT',
  'OPTION_WINSTORY_VIDEO',
  'OPTION_NO_REWARDS',
  
  -- Moderation
  'MODERATION_VALIDATED_BY_MODERATOR',
  'MODERATION_REFUSED_BY_MODERATOR',
  'CREATION_VALIDATED_FINAL',
  'CREATION_REFUSED_FINAL',
  
  -- Completion
  'COMPLETION_SUBMITTED',
  'COMPLETION_100_VALIDATED',
  
  -- Agency B2C Client
  'B2C_CLIENT_ONBOARDED',
  
  -- Manual adjustments
  'ADMIN_ADJUSTMENT',
  'BONUS',
  'PENALTY'
);

-- Create user type enum if not exists
DO $$ BEGIN
  CREATE TYPE user_type_xp AS ENUM ('B2C', 'AGENCY_B2C', 'INDIVIDUAL', 'COMPLETER', 'MODERATOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- XP Transactions Table
-- Tracks every XP gain or loss with full audit trail
CREATE TABLE IF NOT EXISTS xp_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  
  -- User identification
  user_wallet TEXT NOT NULL,
  user_type user_type_xp NOT NULL,
  
  -- Transaction details
  transaction_type xp_transaction_type NOT NULL,
  xp_amount INTEGER NOT NULL, -- Can be negative for losses
  xp_before INTEGER DEFAULT 0,
  xp_after INTEGER DEFAULT 0,
  
  -- Context
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  completion_id TEXT REFERENCES completions(id) ON DELETE SET NULL,
  moderation_vote_id TEXT, -- Reference to moderation vote if applicable
  
  -- Additional context for calculations
  mint_value_usd DECIMAL(20,2),
  mint_value_winc DECIMAL(20,8),
  
  -- Metadata
  description TEXT,
  metadata JSONB, -- Store additional context like formulas used, calculations, etc.
  
  -- Agency B2C specific fields
  agency_wallet TEXT, -- For tracking which agency caused the transaction
  client_email TEXT, -- For B2C client onboarding
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Audit
  created_by TEXT, -- System, Admin wallet, or API endpoint
  transaction_hash TEXT -- Blockchain transaction if applicable
);

-- XP Balance Summary Table
-- Quick lookup for current XP and level per wallet
CREATE TABLE IF NOT EXISTS xp_balances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL UNIQUE,
  
  -- Current XP state
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  xp_in_current_level INTEGER DEFAULT 0,
  
  -- Lifetime statistics
  total_xp_earned INTEGER DEFAULT 0, -- Sum of all positive XP
  total_xp_lost INTEGER DEFAULT 0, -- Sum of all negative XP (absolute value)
  
  -- Activity counters
  campaigns_created INTEGER DEFAULT 0,
  campaigns_validated INTEGER DEFAULT 0,
  campaigns_refused INTEGER DEFAULT 0,
  moderations_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  
  -- Timestamps
  last_xp_gain TIMESTAMP WITH TIME ZONE,
  last_xp_loss TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agency B2C Client Tracking
-- Track which clients belong to which agencies
CREATE TABLE IF NOT EXISTS agency_b2c_clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  
  agency_wallet TEXT NOT NULL,
  agency_email TEXT,
  
  client_email TEXT NOT NULL,
  client_wallet TEXT, -- Set when client connects
  client_name TEXT,
  
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- XP tracking
  xp_granted BOOLEAN DEFAULT FALSE,
  xp_granted_at TIMESTAMP WITH TIME ZONE,
  xp_transaction_id TEXT REFERENCES xp_transactions(id),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  onboarded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(agency_wallet, client_email)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- XP Transactions indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_wallet ON xp_transactions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_campaign_id ON xp_transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_completion_id ON xp_transactions(completion_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_type ON xp_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_date ON xp_transactions(user_wallet, created_at DESC);

-- XP Balances indexes
CREATE INDEX IF NOT EXISTS idx_xp_balances_total_xp ON xp_balances(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_xp_balances_level ON xp_balances(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_xp_balances_updated ON xp_balances(updated_at DESC);

-- Agency B2C Clients indexes
CREATE INDEX IF NOT EXISTS idx_agency_clients_agency_wallet ON agency_b2c_clients(agency_wallet);
CREATE INDEX IF NOT EXISTS idx_agency_clients_client_email ON agency_b2c_clients(client_email);
CREATE INDEX IF NOT EXISTS idx_agency_clients_client_wallet ON agency_b2c_clients(client_wallet);
CREATE INDEX IF NOT EXISTS idx_agency_clients_campaign_id ON agency_b2c_clients(campaign_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate XP required for any level (exponential progression)
CREATE OR REPLACE FUNCTION calculate_xp_for_level(target_level INTEGER)
RETURNS INTEGER AS $$
DECLARE
  base_xp CONSTANT INTEGER := 100;
  multiplier CONSTANT NUMERIC := 1.35;
BEGIN
  IF target_level <= 1 THEN
    RETURN 0;
  END IF;
  
  -- Formule exponentielle : base * (multiplicateur ^ (niveau - 2))
  RETURN FLOOR(base_xp * POWER(multiplier, target_level - 2))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate level from XP (infinite progression)
CREATE OR REPLACE FUNCTION calculate_xp_level(total_xp INTEGER)
RETURNS TABLE(
  level INTEGER,
  xp_to_next_level INTEGER,
  xp_in_current_level INTEGER
) AS $$
DECLARE
  current_level INTEGER := 1;
  current_level_xp INTEGER := 0;
  next_level_xp INTEGER;
  test_level INTEGER;
  test_xp INTEGER;
BEGIN
  -- Trouver le niveau actuel en itérant
  -- Commence par chercher efficacement
  test_level := 1;
  
  WHILE TRUE LOOP
    test_xp := calculate_xp_for_level(test_level);
    
    IF total_xp >= test_xp THEN
      current_level := test_level;
      current_level_xp := test_xp;
      test_level := test_level + 1;
      
      -- Limite de sécurité pour éviter les boucles infinies (niveau 1000)
      IF test_level > 1000 THEN
        EXIT;
      END IF;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  -- Calculer l'XP pour le niveau suivant
  next_level_xp := calculate_xp_for_level(current_level + 1);
  
  RETURN QUERY SELECT 
    current_level,
    GREATEST(0, next_level_xp - total_xp)::INTEGER,
    GREATEST(0, total_xp - current_level_xp)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Function to add XP transaction and update balance
CREATE OR REPLACE FUNCTION add_xp_transaction(
  p_user_wallet TEXT,
  p_user_type user_type_xp,
  p_transaction_type xp_transaction_type,
  p_xp_amount INTEGER,
  p_campaign_id TEXT DEFAULT NULL,
  p_completion_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_mint_value_usd DECIMAL DEFAULT NULL,
  p_mint_value_winc DECIMAL DEFAULT NULL,
  p_agency_wallet TEXT DEFAULT NULL,
  p_client_email TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT 'system'
)
RETURNS TEXT AS $$
DECLARE
  v_transaction_id TEXT;
  v_current_xp INTEGER;
  v_new_xp INTEGER;
  v_level_info RECORD;
BEGIN
  -- Get current XP or create balance record
  INSERT INTO xp_balances (user_wallet, total_xp)
  VALUES (p_user_wallet, 0)
  ON CONFLICT (user_wallet) DO NOTHING;
  
  SELECT total_xp INTO v_current_xp
  FROM xp_balances
  WHERE user_wallet = p_user_wallet;
  
  -- Calculate new XP (ensure it doesn't go below 0)
  v_new_xp := GREATEST(0, v_current_xp + p_xp_amount);
  
  -- Create transaction record
  INSERT INTO xp_transactions (
    user_wallet,
    user_type,
    transaction_type,
    xp_amount,
    xp_before,
    xp_after,
    campaign_id,
    completion_id,
    description,
    metadata,
    mint_value_usd,
    mint_value_winc,
    agency_wallet,
    client_email,
    created_by
  ) VALUES (
    p_user_wallet,
    p_user_type,
    p_transaction_type,
    p_xp_amount,
    v_current_xp,
    v_new_xp,
    p_campaign_id,
    p_completion_id,
    p_description,
    p_metadata,
    p_mint_value_usd,
    p_mint_value_winc,
    p_agency_wallet,
    p_client_email,
    p_created_by
  )
  RETURNING id INTO v_transaction_id;
  
  -- Calculate level
  SELECT * INTO v_level_info FROM calculate_xp_level(v_new_xp);
  
  -- Update balance
  UPDATE xp_balances
  SET 
    total_xp = v_new_xp,
    current_level = v_level_info.level,
    xp_to_next_level = v_level_info.xp_to_next_level,
    xp_in_current_level = v_level_info.xp_in_current_level,
    total_xp_earned = total_xp_earned + GREATEST(0, p_xp_amount),
    total_xp_lost = total_xp_lost + GREATEST(0, -p_xp_amount),
    last_xp_gain = CASE WHEN p_xp_amount > 0 THEN NOW() ELSE last_xp_gain END,
    last_xp_loss = CASE WHEN p_xp_amount < 0 THEN NOW() ELSE last_xp_loss END,
    updated_at = NOW()
  WHERE user_wallet = p_user_wallet;
  
  -- Also update user_dashboard_stats if it exists
  UPDATE user_dashboard_stats
  SET 
    total_xp_earned = v_new_xp,
    current_level = v_level_info.level,
    updated_at = NOW()
  WHERE user_wallet = p_user_wallet;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamp on xp_balances
CREATE OR REPLACE FUNCTION update_xp_balances_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS xp_balances_update_timestamp ON xp_balances;
CREATE TRIGGER xp_balances_update_timestamp
  BEFORE UPDATE ON xp_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_xp_balances_timestamp();

-- Auto-update timestamp on agency_b2c_clients
DROP TRIGGER IF EXISTS agency_b2c_clients_update_timestamp ON agency_b2c_clients;
CREATE TRIGGER agency_b2c_clients_update_timestamp
  BEFORE UPDATE ON agency_b2c_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_xp_balances_timestamp();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE xp_transactions IS 'Tracks all XP transactions for campaign creation, moderation, and completion activities';
COMMENT ON TABLE xp_balances IS 'Current XP balance and level for each user wallet';
COMMENT ON TABLE agency_b2c_clients IS 'Tracks B2C clients associated with agencies for XP attribution';
COMMENT ON FUNCTION add_xp_transaction IS 'Adds an XP transaction and updates user balance atomically';
COMMENT ON FUNCTION calculate_xp_level IS 'Calculates user level based on total XP';

