-- ============================================
-- MIGRATIONS COMPLÈTES POUR LES RÉCOMPENSES
-- À exécuter dans l'ordre dans Supabase SQL Editor
-- ============================================

-- 1. Metadata pour digital_access_rewards
ALTER TABLE IF EXISTS digital_access_rewards
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 2. Metadata pour digital_access_deliveries
ALTER TABLE IF EXISTS digital_access_deliveries
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 3. Metadata pour physical_access_rewards
ALTER TABLE IF EXISTS physical_access_rewards
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 4. Beneficiary wallet pour les deliveries
ALTER TABLE IF EXISTS digital_access_deliveries
ADD COLUMN IF NOT EXISTS beneficiary_wallet TEXT,
ADD COLUMN IF NOT EXISTS beneficiary_name TEXT;

ALTER TABLE IF EXISTS physical_access_deliveries
ADD COLUMN IF NOT EXISTS beneficiary_wallet TEXT,
ADD COLUMN IF NOT EXISTS beneficiary_name TEXT;

-- 5. Table pour les demandes de transfert de récompenses
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

-- ============================================
-- VÉRIFICATION : Vérifier que tout est OK
-- ============================================
-- Exécutez cette requête pour vérifier que les colonnes existent :
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('digital_access_rewards', 'physical_access_rewards', 'digital_access_deliveries', 'physical_access_deliveries')
--   AND column_name IN ('metadata', 'beneficiary_wallet', 'beneficiary_name')
-- ORDER BY table_name, column_name;

