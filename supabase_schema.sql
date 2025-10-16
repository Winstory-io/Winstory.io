-- =====================================================
-- SCHEMA SUPABASE POUR WINSTORY.IO
-- =====================================================
-- Ce script crée toutes les tables nécessaires pour les workflows :
-- - Creation (B2C, AgencyB2C, Individual)
-- - Moderation
-- - Completion  
-- - My Win
-- =====================================================

-- =====================================================
-- 1. ENUMS ET TYPES
-- =====================================================

-- Statuts des campagnes
CREATE TYPE campaign_status AS ENUM (
  'PENDING_MODERATION', -- En attente de modération (pas encore ouverte)
  'IN_REVIEW', -- En cours de modération
  'PENDING_WINSTORY_VIDEO', -- En attente de création vidéo par Winstory (24h)
  'APPROVED', -- Approuvé
  'REJECTED', -- Rejeté
  'COMPLETED' -- Terminé
);

-- Types de campagnes
CREATE TYPE campaign_type AS ENUM (
  'INITIAL',
  'COMPLETION'
);

-- Types de créateurs
CREATE TYPE creator_type AS ENUM (
  'B2C_AGENCIES',
  'INDIVIDUAL_CREATORS', 
  'FOR_B2C',
  'FOR_INDIVIDUALS'
);

-- Niveaux de récompenses
CREATE TYPE reward_tier AS ENUM (
  'standard',
  'premium'
);

-- Types de récompenses
CREATE TYPE reward_type AS ENUM (
  'token',
  'item',
  'digital_access',
  'physical_access'
);

-- Types d'accès digital
CREATE TYPE digital_access_type AS ENUM (
  'Private Link',
  'Content',
  'Code/Key',
  'File/Media'
);

-- Standards de tokens
CREATE TYPE token_standard AS ENUM (
  'ERC20',
  'ERC721',
  'ERC1155',
  'SPL',
  'BRC20',
  'BRC721'
);

-- Statuts de distribution
CREATE TYPE distribution_status AS ENUM (
  'success',
  'failed',
  'pending'
);

-- Types de votes
CREATE TYPE vote_type AS ENUM (
  'campaign',
  'completion'
);

-- Décisions de modération
CREATE TYPE moderation_decision AS ENUM (
  'approve',
  'reject',
  'abstain'
);

-- Statuts des complétions
CREATE TYPE completion_status AS ENUM (
  'in_progress',
  'pending_moderation',
  'approved',
  'rejected',
  'rewarded',
  'expired'
);

-- Statuts de validation des conditions 3/3
CREATE TYPE validation_status AS ENUM (
  'pending',
  'validated',
  'rejected',
  'expired'
);

-- Nouveaux enums pour les fonctionnalités manquantes
-- Types de paiements MINT
CREATE TYPE payment_method AS ENUM (
  'USDC_Base',
  'Credit_Card',
  'Stripe',
  'PayPal',
  'Google_Pay',
  'Apple_Pay',
  'WINC'
);

-- Statuts de paiement
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- Types de récompenses WINC
CREATE TYPE winc_reward_type AS ENUM (
  'creation',
  'completion',
  'moderation',
  'top3',
  'bonus'
);

-- Types de wallets
CREATE TYPE wallet_type AS ENUM (
  'metamask',
  'walletconnect',
  'thirdweb',
  'email'
);

-- Types de notifications
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Types de notifications système
CREATE TYPE system_notification_type AS ENUM (
  'validation_required',
  'rewards_ready',
  'deadline_approaching',
  'moderation_complete',
  'staking_required',
  'completion_deadline',
  'winstory_video_ready',
  'super_moderation_required'
);

-- Types de contrats déployés
CREATE TYPE contract_type AS ENUM (
  'reward_distributor',
  'staking_pool',
  'governance',
  'nft_collection',
  'token_contract'
);

-- Types de staking
CREATE TYPE stake_type AS ENUM (
  'active',
  'passive',
  'delegated'
);

-- Types de métriques
CREATE TYPE metric_period AS ENUM (
  'hourly',
  'daily',
  'weekly',
  'monthly'
);

-- Types d'activités utilisateur
CREATE TYPE user_activity_type AS ENUM (
  'creation',
  'completion',
  'moderation',
  'staking',
  'rewards_claim'
);

-- Types de deadlines de completion
CREATE TYPE deadline_type AS ENUM (
  'fixed_date',
  'completion_based',
  'dynamic'
);


-- Types de modération
CREATE TYPE moderation_level AS ENUM (
  'standard', -- Modérateur standard
  'super', -- Super modérateur (B2C initiale / Agence B2C)
  'winstory' -- Modération Winstory (anti-complot)
);

-- Types de validation blockchain
CREATE TYPE blockchain_validation_type AS ENUM (
  'free_transaction', -- Transaction gratuite (pas de gas fees)
  'staking_validation', -- Validation via staking
  'super_moderation_override' -- Override par super modérateur
);

-- Nouveaux enums pour les fonctionnalités manquantes
-- Rôles utilisateur
CREATE TYPE user_role AS ENUM (
  'creator',
  'completer',
  'moderator',
  'super_moderator',
  'winstory_admin'
);

-- Statuts KYC
CREATE TYPE kyc_status AS ENUM (
  'pending',
  'verified',
  'rejected',
  'expired'
);

-- Types de vérification
CREATE TYPE verification_type AS ENUM (
  'email',
  'phone',
  'wallet_signature',
  'identity_document'
);

-- Statuts de livraison des récompenses
CREATE TYPE fulfillment_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'returned',
  'failed'
);

-- Statuts de minting NFT
CREATE TYPE minting_status AS ENUM (
  'pending',
  'minting',
  'minted',
  'failed',
  'retry'
);

-- Types de notifications
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'discord',
  'webhook',
  'in_app'
);

-- Types de politiques
CREATE TYPE policy_type AS ENUM (
  'terms_of_service',
  'privacy_policy',
  'cookie_policy',
  'data_retention'
);

-- Types de consentement
CREATE TYPE consent_purpose AS ENUM (
  'marketing',
  'analytics',
  'essential',
  'third_party'
);

-- Types de coûts
CREATE TYPE cost_category AS ENUM (
  'storage',
  'transcoding',
  'gas_fees',
  'processor_fees',
  'fulfillment'
);

-- Types de réputation IP
CREATE TYPE ip_reputation_score AS ENUM (
  'excellent',
  'good',
  'neutral',
  'poor',
  'blocked'
);

-- =====================================================
-- 2. TABLES D'AUTHENTIFICATION (NEXTAUTH)
-- =====================================================

-- Utilisateurs
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comptes (providers OAuth)
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tokens de vérification
CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(identifier, token)
);

-- =====================================================
-- 2A. LOGS DE CREATION DE CAMPAGNE (B2C & INDIVIDUAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.campaign_creation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Horodatage explicite de soumission (utile pour audit)
  submission_timestamp_iso TEXT,
  submission_timestamp_local TEXT,

  -- Contexte campagne
  campaign_type TEXT,                        -- 'INDIVIDUAL' ou 'B2C'
  wallet_address TEXT,
  wallet_source TEXT,                        -- 'thirdweb_account' | 'localStorage.walletAddress' | 'reward_config.walletAddress'

  -- Métadonnées de base
  user_email TEXT,
  company_name TEXT,
  story_title TEXT,
  story_guideline TEXT,

  -- Vidéo
  film_video_id TEXT,
  film_file_name TEXT,
  film_format TEXT,                          -- 'horizontal' | 'vertical'

  -- B2C (fiat USD)
  b2c_currency TEXT,                         -- 'USD' si B2C, sinon NULL
  b2c_unit_value_usd NUMERIC,
  b2c_net_profit_usd NUMERIC,
  b2c_max_completions INT,
  b2c_is_free_reward BOOLEAN,
  b2c_is_no_reward BOOLEAN,

  -- Individual ($WINC)
  individual_currency TEXT,                  -- 'WINC' si Individual, sinon NULL
  individual_winc_value NUMERIC,
  individual_max_completions INT,
  individual_duration_days INT,

  -- Payload complet pour audit/debug
  raw_payload JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ccl_created_at ON public.campaign_creation_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_ccl_campaign_type ON public.campaign_creation_logs (campaign_type);
CREATE INDEX IF NOT EXISTS idx_ccl_wallet_address ON public.campaign_creation_logs (wallet_address);

-- =====================================================
-- 2B. TABLES DE GESTION DES WALLETS (NOUVELLES)
-- =====================================================

-- Wallets connectés et leurs réseaux
CREATE TABLE connected_wallets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  wallet_type wallet_type NOT NULL,
  primary_network TEXT NOT NULL,
  supported_networks TEXT[],
  is_primary BOOLEAN DEFAULT FALSE,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions de connexion wallet
CREATE TABLE wallet_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  wallet_address TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  network TEXT NOT NULL,
  chain_id INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2C. TABLES D'IDENTITÉ, RÔLES ET KYC (NOUVELLES)
-- =====================================================

-- Rôles utilisateur par wallet
-- Campagnes principales
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status campaign_status DEFAULT 'PENDING_MODERATION',
  type campaign_type NOT NULL,
  creator_type creator_type NOT NULL,
  original_campaign_company_name TEXT,
  original_creator_wallet TEXT,
  completer_wallet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rôles utilisateur par wallet
CREATE TABLE user_roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  wallet_address TEXT NOT NULL,
  role user_role NOT NULL,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  granted_by TEXT, -- Wallet qui a accordé le rôle
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vérification KYC légère
CREATE TABLE kyc_verifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  wallet_address TEXT NOT NULL,
  verification_type verification_type NOT NULL,
  verification_data TEXT, -- Données de vérification (email, phone, etc.)
  kyc_status kyc_status DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signatures de message pour preuve de propriété de wallet
CREATE TABLE wallet_signatures (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  message TEXT NOT NULL,
  signature TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLES DE CREATION (CORE)
-- =====================================================

-- Campagnes principales

-- Informations des créateurs
CREATE TABLE creator_infos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT UNIQUE NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  company_name TEXT,
  agency_name TEXT,
  wallet_address TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contenu des campagnes
CREATE TABLE campaign_contents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT UNIQUE NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_orientation TEXT DEFAULT 'horizontal' CHECK (video_orientation IN ('horizontal', 'vertical')),
  starting_story TEXT NOT NULL,
  guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métadonnées des campagnes
CREATE TABLE campaign_metadata (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT UNIQUE NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  total_completions INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration des prix et ROI
CREATE TABLE campaign_pricing_configs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT UNIQUE NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  unit_value DECIMAL(10,2),
  net_profit DECIMAL(10,2),
  max_completions INTEGER,
  is_free_reward BOOLEAN DEFAULT FALSE,
  no_reward BOOLEAN DEFAULT FALSE,
  base_mint DECIMAL(10,2),
  ai_option BOOLEAN DEFAULT FALSE,
  no_reward_option BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABLES DE RECOMPENSES (NOUVELLES FONCTIONNALITÉS)
-- =====================================================

-- Configuration générale des récompenses
CREATE TABLE campaign_rewards_configs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_tier reward_tier NOT NULL,
  reward_type reward_type NOT NULL,
  is_configured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, reward_tier, reward_type)
);

-- Récompenses d'accès digital
CREATE TABLE digital_access_rewards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_tier reward_tier NOT NULL,
  access_name TEXT NOT NULL,
  access_description TEXT NOT NULL,
  access_type digital_access_type NOT NULL,
  access_url TEXT NOT NULL,
  max_accesses INTEGER,
  blockchain TEXT NOT NULL,
  token_standard token_standard NOT NULL,
  contract_address TEXT,
  token_id TEXT,
  is_auto_mint BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Récompenses d'accès physique
CREATE TABLE physical_access_rewards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_tier reward_tier NOT NULL,
  access_name TEXT NOT NULL,
  access_description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  event_location TEXT NOT NULL,
  max_accesses INTEGER,
  blockchain TEXT NOT NULL,
  token_standard token_standard NOT NULL,
  contract_address TEXT,
  token_id TEXT,
  is_auto_mint BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Récompenses de tokens
CREATE TABLE token_rewards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_tier reward_tier NOT NULL,
  token_name TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  token_standard token_standard NOT NULL,
  amount_per_user DECIMAL(20,8) NOT NULL,
  total_amount DECIMAL(20,8) NOT NULL,
  decimals INTEGER NOT NULL,
  has_enough_balance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Récompenses d'items
CREATE TABLE item_rewards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_tier reward_tier NOT NULL,
  item_name TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  blockchain TEXT NOT NULL,
  item_standard token_standard NOT NULL,
  amount_per_user INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  decimals INTEGER NOT NULL,
  has_enough_balance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4B. TABLES DE PAIEMENTS MINT (NOUVELLES)
-- =====================================================

-- Paiements MINT (B2C, AgencyB2C, Individual)
CREATE TABLE mint_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  payer_wallet TEXT NOT NULL,
  payment_method payment_method NOT NULL,
  base_amount DECIMAL(10,2) NOT NULL, -- 1000$ de base
  ai_option_amount DECIMAL(10,2) DEFAULT 0, -- +500$ si option AI
  no_rewards_amount DECIMAL(10,2) DEFAULT 0, -- +1000$ si pas de récompenses
  total_amount DECIMAL(10,2) NOT NULL,
  transaction_hash TEXT,
  blockchain TEXT NOT NULL,
  status payment_status DEFAULT 'pending',
  gas_fees DECIMAL(10,8),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- TABLES DE COMPLETIONS
-- =====================================================

-- Complétions soumises
CREATE TABLE completions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  original_campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completer_wallet TEXT NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  status completion_status DEFAULT 'in_progress',
  score_avg DECIMAL(5,2),
  ranking INTEGER,
  roi_earned DECIMAL(20,8),
  validation_status validation_status DEFAULT 'pending',
  validation_conditions_met BOOLEAN DEFAULT FALSE,
  validation_date TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);-- Configuration des processeurs de paiement
CREATE TABLE payment_processors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  processor_name TEXT NOT NULL UNIQUE,
  payment_method payment_method NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  api_keys JSONB, -- Clés API sécurisées
  webhook_url TEXT,
  supported_currencies TEXT[],
  processing_fees_percentage DECIMAL(5,4) DEFAULT 0,
  processing_fees_fixed DECIMAL(10,2) DEFAULT 0,
  min_amount DECIMAL(10,2),
  max_amount DECIMAL(10,2),
  supported_countries TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historique des frais de gas
CREATE TABLE gas_fees_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  blockchain TEXT NOT NULL,
  average_gas_price DECIMAL(20,8),
  gas_limit INTEGER,
  estimated_cost DECIMAL(10,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4C. TABLES DE RÉCOMPENSES WINC ET XP (NOUVELLES)
-- =====================================================

-- Système de récompenses WINC
CREATE TABLE winc_rewards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_id TEXT REFERENCES completions(id) ON DELETE CASCADE,
  reward_type winc_reward_type NOT NULL,
  winc_amount DECIMAL(20,8) NOT NULL,
  completion_rate DECIMAL(5,2) DEFAULT 0, -- Taux de completion de la campagne
  ranking_position INTEGER, -- Position dans le classement (1, 2, 3, etc.)
  ranking_tier TEXT CHECK (ranking_tier IN ('top1', 'top3', 'top10', 'standard')),
  performance_multiplier DECIMAL(5,2) DEFAULT 1.0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Système XP et niveaux
CREATE TABLE user_xp_progression (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  achievements TEXT[],
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multiplicateurs de performance
CREATE TABLE performance_multipliers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_rate DECIMAL(5,2),
  xp_multiplier DECIMAL(5,2) DEFAULT 1.0,
  winc_multiplier DECIMAL(5,2) DEFAULT 1.0,
  threshold_min DECIMAL(5,2),
  threshold_max DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4E. TABLES DE SUIVI DES RÉCOMPENSES (NOUVELLES)
-- =====================================================

-- Livraison des accès digitaux
CREATE TABLE digital_access_deliveries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  completion_id TEXT NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  digital_reward_id TEXT NOT NULL REFERENCES digital_access_rewards(id) ON DELETE CASCADE,
  access_code TEXT,
  access_link TEXT,
  file_url TEXT,
  file_hash TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redemption_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Livraison des accès physiques
CREATE TABLE physical_access_deliveries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  completion_id TEXT NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  physical_reward_id TEXT NOT NULL REFERENCES physical_access_rewards(id) ON DELETE CASCADE,
  shipping_address JSONB, -- Adresse de livraison complète
  fulfillment_status fulfillment_status DEFAULT 'pending',
  tracking_number TEXT,
  shipping_carrier TEXT,
  estimated_delivery DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  return_reason TEXT,
  return_tracking TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs de fulfillment des récompenses physiques
CREATE TABLE reward_fulfillment_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  physical_delivery_id TEXT NOT NULL REFERENCES physical_access_deliveries(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('shipping', 'tracking_update', 'delivery_confirmation', 'return_processing')),
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  priority TEXT DEFAULT 'normal',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignation des NFTs/Items par completion
CREATE TABLE completion_nft_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  completion_id TEXT NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  item_reward_id TEXT NOT NULL REFERENCES item_rewards(id) ON DELETE CASCADE,
  minting_status minting_status DEFAULT 'pending',
  token_id TEXT,
  contract_address TEXT,
  transaction_hash TEXT,
  gas_used DECIMAL(20,8),
  gas_price DECIMAL(20,8),
  minting_cost DECIMAL(20,8),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  minted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Règles d'éligibilité premium/standard
CREATE TABLE reward_eligibility_rules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_tier reward_tier NOT NULL,
  eligibility_type TEXT NOT NULL CHECK (eligibility_type IN ('top3', 'score_threshold', 'ranking_window', 'completion_order')),
  threshold_value DECIMAL(10,2),
  ranking_window_hours INTEGER,
  max_eligible_completions INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4D. TABLES D'ORGANISATIONS ET RELATIONS B2C/AGENCY (NOUVELLES)
-- =====================================================

-- Entreprises B2C
CREATE TABLE companies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  company_name TEXT NOT NULL,
  legal_name TEXT,
  vat_number TEXT,
  country TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  industry TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agences B2C
CREATE TABLE agencies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  agency_name TEXT NOT NULL,
  legal_name TEXT,
  vat_number TEXT,
  country TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  services TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  verification_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relations agence-client (une agence gère plusieurs entreprises)
CREATE TABLE agency_clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  agency_id TEXT NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'client',
  contract_start_date DATE,
  contract_end_date DATE,
  commission_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration des prix et options de campagne (persistance localStorage)

-- =====================================================
-- 5. TABLES DE MODERATION
-- =====================================================

-- Progression de la modération (stakers, votes, scores)
CREATE TABLE moderation_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  total_stakers INTEGER DEFAULT 0,
  active_stakers INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  valid_votes INTEGER DEFAULT 0,
  refuse_votes INTEGER DEFAULT 0,
  abstain_votes INTEGER DEFAULT 0,
  current_score DECIMAL(5,2) DEFAULT 0,
  required_score DECIMAL(5,2) DEFAULT 7.0,
  staking_pool_total DECIMAL(20,8) DEFAULT 0,
  moderation_level moderation_level DEFAULT 'standard',
  blockchain_validation_type blockchain_validation_type DEFAULT 'free_transaction',
  super_moderator_override BOOLEAN DEFAULT FALSE,
  winstory_intervention BOOLEAN DEFAULT FALSE,
  intervention_reason TEXT,
  last_vote_at TIMESTAMP WITH TIME ZONE,
  moderation_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions de modération par modérateur
CREATE TABLE moderation_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  moderator_wallet TEXT NOT NULL,
  moderation_level moderation_level DEFAULT 'standard',
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  votes_cast INTEGER DEFAULT 0,
  is_super_moderator BOOLEAN DEFAULT FALSE,
  can_override BOOLEAN DEFAULT FALSE,
  intervention_authorized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores des modérateurs par complétion

-- Votes de modération
CREATE TABLE moderation_votes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  moderator_wallet TEXT NOT NULL,
  completion_id TEXT REFERENCES completions(id) ON DELETE CASCADE,
  vote_decision moderation_decision NOT NULL,
  moderation_level moderation_level DEFAULT 'standard',
  blockchain_validation_type blockchain_validation_type DEFAULT 'free_transaction',
  staked_amount DECIMAL(20,8) DEFAULT 0,
  vote_weight DECIMAL(5,2) DEFAULT 1.0,
  is_super_moderator_vote BOOLEAN DEFAULT FALSE,
  can_override_others BOOLEAN DEFAULT FALSE,
  override_reason TEXT,
  transaction_hash TEXT,
  gas_fees DECIMAL(20,8) DEFAULT 0,
  vote_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Éligibilité des modérateurs
CREATE TABLE moderation_eligibility (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  moderator_wallet TEXT NOT NULL,
  eligible BOOLEAN DEFAULT TRUE,
  reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5B. TABLES DE STAKING ET MODÉRATION AVANCÉE (NOUVELLES)
-- =====================================================

-- Pool de staking des modérateurs
CREATE TABLE staking_pools (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  total_staked DECIMAL(20,8) DEFAULT 0,
  stakers_count INTEGER DEFAULT 0,
  minimum_stake DECIMAL(20,8),
  maximum_stake DECIMAL(20,8),
  staking_deadline TIMESTAMP WITH TIME ZONE,
  reward_multiplier DECIMAL(5,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakes individuels des modérateurs
CREATE TABLE moderator_stakes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  moderator_wallet TEXT NOT NULL,
  staked_amount DECIMAL(20,8) NOT NULL,
  stake_type stake_type DEFAULT 'active',
  staking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unstaking_date TIMESTAMP WITH TIME ZONE,
  rewards_earned DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5C. TABLES DE STAKING AVANCÉ ET JUSTIFICATION (NOUVELLES)
-- =====================================================

-- Configuration du staking par campagne
CREATE TABLE staking_configuration (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  staking_currency TEXT DEFAULT 'USDC', -- USDC au début, puis WINC
  min_stake_amount DECIMAL(20,8),
  max_stake_amount DECIMAL(20,8),
  lock_period_days INTEGER, -- Durée minimale du lock
  reward_multiplier DECIMAL(5,2) DEFAULT 1.0,
  slash_percentage DECIMAL(5,2) DEFAULT 0, -- Pourcentage de pénalité
  slash_conditions JSONB, -- Conditions de pénalité
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Justifications des votes de modération (V.1: simple, V.2: détaillé)
CREATE TABLE moderation_vote_justifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  vote_id TEXT NOT NULL REFERENCES moderation_votes(id) ON DELETE CASCADE,
  justification_text TEXT, -- V.1: optionnel, V.2: obligatoire
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  decision_factors TEXT[], -- Facteurs qui ont influencé la décision
  is_public BOOLEAN DEFAULT FALSE, -- Visible par les autres modérateurs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historique des changements de staking
CREATE TABLE staking_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  moderator_wallet TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('stake', 'unstake', 'lock', 'unlock', 'slash', 'reward')),
  amount DECIMAL(20,8) NOT NULL,
  previous_balance DECIMAL(20,8),
  new_balance DECIMAL(20,8),
  transaction_hash TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABLES DE COMPLETION (AMÉLIORÉES)
-- =====================================================

-- Complétions soumises

-- Métriques des complétions
CREATE TABLE completion_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  completion_id TEXT UNIQUE NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6C. TABLES D'ANALYTICS ET MÉTRIQUES (NOUVELLES)
-- =====================================================

-- Métriques de campagne en temps réel
CREATE TABLE campaign_analytics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('views', 'completions', 'moderation_votes', 'rewards_distributed', 'roi_tracking', 'suspicious_behavior', 'completion_distribution')),
  metric_value INTEGER DEFAULT 0,
  metric_period metric_period DEFAULT 'daily',
  roi_data JSONB, -- Données de calcul ROI (investissement, retours, etc.)
  suspicious_patterns TEXT[], -- Patterns suspects détectés
  moderation_behavior_analysis JSONB, -- Analyse des comportements de modération
  completion_distribution_analysis JSONB, -- Analyse de la distribution des complétions
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suivi des performances utilisateur
CREATE TABLE roi_snapshots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  activity_type user_activity_type NOT NULL,
  performance_score DECIMAL(5,2),
  time_spent_minutes INTEGER,
  success_rate DECIMAL(5,2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validation des conditions 3/3 pour chaque complétion
CREATE TABLE completion_validation_conditions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  completion_id TEXT NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  condition_1_stakers_voted BOOLEAN DEFAULT FALSE, -- Au moins 22 stakers ont voté
  condition_2_staking_pool_exceeds_unit_value BOOLEAN DEFAULT FALSE, -- Pool de staking > Unit Value
  condition_3_majority_ratio_met BOOLEAN DEFAULT FALSE, -- Ratio 2:1 atteint (Valid > Refuse)
  all_conditions_met BOOLEAN DEFAULT FALSE,
  stakers_count INTEGER DEFAULT 0,
  staking_pool_amount DECIMAL(20,8) DEFAULT 0,
  unit_value DECIMAL(20,8) DEFAULT 0,
  valid_votes_count INTEGER DEFAULT 0,
  refuse_votes_count INTEGER DEFAULT 0,
  majority_ratio DECIMAL(5,2) DEFAULT 0,
  validation_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6B. TABLES DE GESTION DES CAMPAGNES DE COMPLETION (NOUVELLES)
-- =====================================================

-- Liens entre campagnes initiales et leurs complétions
CREATE TABLE campaign_completion_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  original_campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('b2c_completion', 'individual_completion')),
  completion_deadline TIMESTAMP WITH TIME ZONE,
  max_completions_allowed INTEGER,
  completion_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration des deadlines de completion
CREATE TABLE completion_deadlines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  deadline_type deadline_type NOT NULL,
  deadline_date TIMESTAMP WITH TIME ZONE,
  completion_threshold INTEGER,
  auto_extend BOOLEAN DEFAULT FALSE,
  max_extensions INTEGER DEFAULT 0,
  b2c_deadline_weeks INTEGER DEFAULT 1, -- 1 semaine pour B2C et Campagne B2C
  individual_deadline_weeks INTEGER, -- Dépend du montant du price pool
  price_pool_amount DECIMAL(20,8), -- Montant du price pool pour calculer la deadline
  deadline_calculation_formula TEXT, -- Formule pour calculer la deadline basée sur le price pool
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6D. TABLES DE SUIVI DES CONTENUS ET COMPLÉTIONS (NOUVELLES)
-- =====================================================

-- Métadonnées des vidéos de complétion
CREATE TABLE completion_content_metadata (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  completion_id TEXT NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  storage_provider TEXT NOT NULL, -- Pinata, S3, etc.
  content_cid TEXT, -- IPFS CID
  content_hash TEXT, -- Hash du contenu
  file_size BIGINT,
  duration_seconds INTEGER,
  resolution TEXT,
  format TEXT,
  transcode_status TEXT DEFAULT 'pending',
  transcode_job_id TEXT,
  thumbnail_url TEXT,
  thumbnail_hash TEXT,
  content_moderation_flags TEXT[], -- NSFW, copyright, etc.
  moderation_score DECIMAL(5,2),
  is_approved_for_use BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tentatives de complétion (pour éviter le re-mint)
CREATE TABLE completion_attempts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completer_wallet TEXT NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  previous_completion_id TEXT REFERENCES completions(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'in_progress',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_current_attempt BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores de modération par completion (empêcher la réutilisation)
CREATE TABLE completion_moderation_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  completion_id TEXT NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  moderator_wallet TEXT NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  score_hash TEXT UNIQUE NOT NULL, -- Hash du score pour empêcher la réutilisation
  is_used BOOLEAN DEFAULT FALSE,
  used_in_campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABLES MY WIN (UTILISATEUR) - AMÉLIORÉES
-- =====================================================

-- Profils utilisateurs
CREATE TABLE user_profiles (
  wallet_address TEXT PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Distribution des récompenses
CREATE TABLE reward_distributions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_id TEXT REFERENCES completions(id) ON DELETE CASCADE,
  reward_type reward_tier NOT NULL,
  reward_category reward_type NOT NULL,
  blockchain TEXT NOT NULL,
  token_symbol TEXT,
  amount DECIMAL(20,8),
  recipient_wallet TEXT NOT NULL,
  tx_hash TEXT,
  status distribution_status DEFAULT 'pending',
  error TEXT,
  distributed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Réclamations de récompenses
CREATE TABLE reward_claims (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_id TEXT REFERENCES completions(id) ON DELETE CASCADE,
  reward_type reward_tier NOT NULL,
  reward_category reward_type NOT NULL,
  amount DECIMAL(20,8),
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tx_hash TEXT,
  status distribution_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7B. TABLES DE GESTION DES WORKFLOWS (NOUVELLES)
-- =====================================================

-- Workflow states et transitions
CREATE TABLE workflow_states (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  current_state TEXT NOT NULL,
  previous_state TEXT,
  transition_reason TEXT,
  triggered_by TEXT,
  state_data JSONB,
  transitioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications et alertes système
CREATE TABLE system_notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  notification_type system_notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  priority notification_priority DEFAULT 'normal',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7C. TABLES DE DÉTECTION DE COMPLOTS ET SUPER MODÉRATION (NOUVELLES)
-- =====================================================

-- Détection de comportements suspects et complots
CREATE TABLE suspicious_behavior_detection (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  detection_type TEXT NOT NULL CHECK (detection_type IN ('voting_pattern', 'stake_manipulation', 'completion_fraud', 'moderation_collusion')),
  suspicious_score DECIMAL(5,2) DEFAULT 0,
  detected_patterns TEXT[],
  involved_wallets TEXT[],
  evidence_data JSONB,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  requires_winstory_intervention BOOLEAN DEFAULT FALSE,
  intervention_status TEXT DEFAULT 'pending',
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interventions Winstory et super modération
CREATE TABLE winstory_interventions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('video_creation', 'super_moderation', 'anti_complot', 'quality_control')),
  intervention_reason TEXT NOT NULL,
  intervention_details JSONB,
  assigned_moderator TEXT,
  intervention_status TEXT DEFAULT 'pending',
  deadline_hours INTEGER DEFAULT 24, -- 24h pour création vidéo
  completed_at TIMESTAMP WITH TIME ZONE,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trail complet des actions de modération
CREATE TABLE moderation_audit_trail (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('vote_cast', 'stake_placed', 'moderation_start', 'moderation_end', 'intervention_triggered', 'override_applied')),
  actor_wallet TEXT NOT NULL,
  actor_moderation_level moderation_level NOT NULL,
  action_details JSONB,
  blockchain_transaction_hash TEXT,
  gas_fees DECIMAL(20,8) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABLES DE SUIVI AUTOMATIQUE (NOUVELLES)
-- =====================================================

-- Suivi automatique des conditions 3/3
CREATE TABLE automatic_validation_tracking (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_id TEXT REFERENCES completions(id) ON DELETE CASCADE,
  tracking_type TEXT NOT NULL CHECK (tracking_type IN ('campaign_initial', 'completion_validation')),
  condition_1_met BOOLEAN DEFAULT FALSE,
  condition_2_met BOOLEAN DEFAULT FALSE,
  condition_3_met BOOLEAN DEFAULT FALSE,
  all_conditions_met BOOLEAN DEFAULT FALSE,
  validation_triggered BOOLEAN DEFAULT FALSE,
  validation_timestamp TIMESTAMP WITH TIME ZONE,
  next_check_scheduled TIMESTAMP WITH TIME ZONE,
  check_count INTEGER DEFAULT 0,
  max_checks INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de distribution automatique
CREATE TABLE automatic_distribution_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_id TEXT REFERENCES completions(id) ON DELETE CASCADE,
  distribution_type TEXT NOT NULL CHECK (distribution_type IN ('standard_reward', 'premium_reward', 'refund')),
  trigger_reason TEXT NOT NULL,
  recipients_count INTEGER DEFAULT 0,
  total_amount DECIMAL(20,8) DEFAULT 0,
  blockchain TEXT,
  tx_hash TEXT,
  status distribution_status DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_scheduled TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8B. TABLES D'INTÉGRATION MULTI-BLOCKCHAINS (NOUVELLES)
-- =====================================================

-- Configuration des réseaux blockchain
CREATE TABLE blockchain_networks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  network_name TEXT NOT NULL UNIQUE,
  chain_id INTEGER NOT NULL,
  rpc_url TEXT NOT NULL,
  explorer_url TEXT,
  native_currency_symbol TEXT,
  native_currency_decimals INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  gas_limit_default INTEGER,
  is_mint_enabled BOOLEAN DEFAULT FALSE, -- MINT activé sur Base, désactivé sur Polygon
  is_rewards_enabled BOOLEAN DEFAULT TRUE, -- Récompenses activées sur Polygon
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Smart contracts déployés
CREATE TABLE deployed_contracts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  contract_name TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  network TEXT NOT NULL,
  contract_type contract_type NOT NULL,
  abi_hash TEXT,
  deployment_tx_hash TEXT,
  deployed_by TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  deployment_notes TEXT, -- Notes sur le déploiement et la configuration
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8C. TABLES D'INTÉGRATION BLOCKCHAIN AVANCÉE (NOUVELLES)
-- =====================================================

-- Mapping des réseaux de récompenses par campagne
CREATE TABLE campaign_reward_networks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_type reward_type NOT NULL,
  blockchain_network TEXT NOT NULL, -- Toutes les blockchains supportées
  contract_address TEXT,
  token_standard token_standard,
  is_active BOOLEAN DEFAULT TRUE,
  gas_limit INTEGER,
  estimated_gas_cost DECIMAL(20,8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queue de transactions blockchain
CREATE TABLE blockchain_transaction_queue (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('reward_distribution', 'nft_mint', 'staking', 'governance')),
  target_wallet TEXT NOT NULL,
  amount DECIMAL(20,8),
  token_address TEXT,
  network TEXT NOT NULL,
  gas_limit INTEGER,
  gas_price DECIMAL(20,8),
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receipts on-chain pour vérification/audit
CREATE TABLE blockchain_transaction_receipts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  transaction_queue_id TEXT NOT NULL REFERENCES blockchain_transaction_queue(id) ON DELETE CASCADE,
  transaction_hash TEXT NOT NULL,
  network TEXT NOT NULL,
  block_number BIGINT,
  block_hash TEXT,
  gas_used DECIMAL(20,8),
  gas_price DECIMAL(20,8),
  total_gas_cost DECIMAL(20,8),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'reverted')),
  logs JSONB, -- Logs décodés de la transaction
  events JSONB, -- Événements émis par le smart contract
  error_data JSONB, -- Données d'erreur si échec
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. INDEX POUR PERFORMANCE
-- =====================================================

-- Index sur les campagnes
CREATE INDEX IF NOT EXISTS idx_campaigns_creator_type ON campaigns(creator_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- Index sur les créateurs
CREATE INDEX IF NOT EXISTS idx_creator_infos_wallet ON creator_infos(wallet_address);
CREATE INDEX IF NOT EXISTS idx_creator_infos_company ON creator_infos(company_name);
CREATE INDEX IF NOT EXISTS idx_creator_infos_agency ON creator_infos(agency_name);

-- Index sur les récompenses
CREATE INDEX IF NOT EXISTS idx_digital_access_campaign ON digital_access_rewards(campaign_id);
CREATE INDEX IF NOT EXISTS idx_physical_access_campaign ON physical_access_rewards(campaign_id);
CREATE INDEX IF NOT EXISTS idx_token_rewards_campaign ON token_rewards(campaign_id);
CREATE INDEX IF NOT EXISTS idx_item_rewards_campaign ON item_rewards(campaign_id);

-- Index sur la modération
CREATE INDEX IF NOT EXISTS idx_moderation_progress_campaign ON moderation_progress(campaign_id);
CREATE INDEX IF NOT EXISTS idx_moderation_sessions_campaign ON moderation_sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_moderation_sessions_moderator ON moderation_sessions(moderator_wallet);
CREATE INDEX IF NOT EXISTS idx_moderation_votes_campaign ON moderation_votes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_moderation_votes_completion ON moderation_votes(completion_id);

-- Index sur les complétions
CREATE INDEX IF NOT EXISTS idx_completions_original_campaign ON completions(original_campaign_id);
CREATE INDEX IF NOT EXISTS idx_completions_completer ON completions(completer_wallet);
CREATE INDEX IF NOT EXISTS idx_completions_status ON completions(status);
CREATE INDEX IF NOT EXISTS idx_completions_ranking ON completions(ranking);

-- Index sur la validation automatique
CREATE INDEX IF NOT EXISTS idx_completion_validation_conditions_completion ON completion_validation_conditions(completion_id);
CREATE INDEX IF NOT EXISTS idx_completion_validation_conditions_campaign ON completion_validation_conditions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_completion_validation_conditions_all_met ON completion_validation_conditions(all_conditions_met);

-- Index sur le suivi automatique
CREATE INDEX IF NOT EXISTS idx_automatic_validation_tracking_campaign ON automatic_validation_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_automatic_validation_tracking_completion ON automatic_validation_tracking(completion_id);
CREATE INDEX IF NOT EXISTS idx_automatic_validation_tracking_all_met ON automatic_validation_tracking(all_conditions_met);

-- Index sur les récompenses distribuées
CREATE INDEX IF NOT EXISTS idx_reward_distributions_campaign ON reward_distributions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_reward_distributions_completion ON reward_distributions(completion_id);
CREATE INDEX IF NOT EXISTS idx_reward_distributions_recipient ON reward_distributions(recipient_wallet);
CREATE INDEX IF NOT EXISTS idx_reward_distributions_status ON reward_distributions(status);

-- =====================================================
-- 9B. INDEX POUR LES NOUVELLES TABLES
-- =====================================================

-- Index sur les paiements MINT
CREATE INDEX IF NOT EXISTS idx_mint_payments_campaign ON mint_payments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_mint_payments_payer ON mint_payments(payer_wallet);
CREATE INDEX IF NOT EXISTS idx_mint_payments_status ON mint_payments(status);
CREATE INDEX IF NOT EXISTS idx_mint_payments_method ON mint_payments(payment_method);

-- Index sur les processeurs de paiement
CREATE INDEX IF NOT EXISTS idx_payment_processors_name ON payment_processors(processor_name);
CREATE INDEX IF NOT EXISTS idx_payment_processors_method ON payment_processors(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_processors_active ON payment_processors(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_processors_currencies ON payment_processors USING GIN(supported_currencies);
CREATE INDEX IF NOT EXISTS idx_payment_processors_countries ON payment_processors USING GIN(supported_countries);

-- Index sur les récompenses WINC
CREATE INDEX IF NOT EXISTS idx_winc_rewards_user ON winc_rewards(user_wallet);
CREATE INDEX IF NOT EXISTS idx_winc_rewards_campaign ON winc_rewards(campaign_id);
CREATE INDEX IF NOT EXISTS idx_winc_rewards_type ON winc_rewards(reward_type);

-- Index sur la progression XP
CREATE INDEX IF NOT EXISTS idx_user_xp_progression_wallet ON user_xp_progression(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_xp_progression_level ON user_xp_progression(current_level);

-- Index sur les wallets connectés
CREATE INDEX IF NOT EXISTS idx_connected_wallets_user ON connected_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_wallets_address ON connected_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_connected_wallets_primary ON connected_wallets(is_primary);

-- Index sur les sessions wallet
CREATE INDEX IF NOT EXISTS idx_wallet_sessions_address ON wallet_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_sessions_token ON wallet_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_wallet_sessions_expires ON wallet_sessions(expires_at);

-- Index sur les liens de completion
CREATE INDEX IF NOT EXISTS idx_campaign_completion_links_original ON campaign_completion_links(original_campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_completion_links_completion ON campaign_completion_links(completion_campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_completion_links_type ON campaign_completion_links(link_type);

-- Index sur les deadlines
CREATE INDEX IF NOT EXISTS idx_completion_deadlines_campaign ON completion_deadlines(campaign_id);
CREATE INDEX IF NOT EXISTS idx_completion_deadlines_type ON completion_deadlines(deadline_type);
CREATE INDEX IF NOT EXISTS idx_completion_deadlines_date ON completion_deadlines(deadline_date);

-- Index sur les pools de staking
CREATE INDEX IF NOT EXISTS idx_staking_pools_campaign ON staking_pools(campaign_id);
CREATE INDEX IF NOT EXISTS idx_staking_pools_total ON staking_pools(total_staked);

-- Index sur les stakes individuels
CREATE INDEX IF NOT EXISTS idx_moderator_stakes_campaign ON moderator_stakes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_moderator_stakes_wallet ON moderator_stakes(moderator_wallet);
CREATE INDEX IF NOT EXISTS idx_moderator_stakes_type ON moderator_stakes(stake_type);

-- Index sur les analytics
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_type ON campaign_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_period ON campaign_analytics(metric_period);

-- Index sur le suivi des performances

-- Index sur les workflows
CREATE INDEX IF NOT EXISTS idx_workflow_states_campaign ON workflow_states(campaign_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_current ON workflow_states(current_state);

-- Index sur les notifications
CREATE INDEX IF NOT EXISTS idx_system_notifications_wallet ON system_notifications(user_wallet);
CREATE INDEX IF NOT EXISTS idx_system_notifications_campaign ON system_notifications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_type ON system_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_system_notifications_priority ON system_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_system_notifications_read ON system_notifications(is_read);

-- Index sur les réseaux blockchain
CREATE INDEX IF NOT EXISTS idx_blockchain_networks_name ON blockchain_networks(network_name);
CREATE INDEX IF NOT EXISTS idx_blockchain_networks_chain_id ON blockchain_networks(chain_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_networks_active ON blockchain_networks(is_active);

-- Index sur les contrats déployés
CREATE INDEX IF NOT EXISTS idx_deployed_contracts_address ON deployed_contracts(contract_address);
CREATE INDEX IF NOT EXISTS idx_deployed_contracts_network ON deployed_contracts(network);
CREATE INDEX IF NOT EXISTS idx_deployed_contracts_type ON deployed_contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_deployed_contracts_verified ON deployed_contracts(is_verified);

-- =====================================================
-- 9C. INDEX POUR LES NOUVELLES TABLES DE DÉTECTION ET SUPERVISION
-- =====================================================

-- Index sur la détection de comportements suspects
CREATE INDEX IF NOT EXISTS idx_suspicious_behavior_campaign ON suspicious_behavior_detection(campaign_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_behavior_type ON suspicious_behavior_detection(detection_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_behavior_score ON suspicious_behavior_detection(suspicious_score);
CREATE INDEX IF NOT EXISTS idx_suspicious_behavior_risk ON suspicious_behavior_detection(risk_level);
CREATE INDEX IF NOT EXISTS idx_suspicious_behavior_intervention ON suspicious_behavior_detection(requires_winstory_intervention);

-- Index sur les interventions Winstory
CREATE INDEX IF NOT EXISTS idx_winstory_interventions_campaign ON winstory_interventions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_winstory_interventions_type ON winstory_interventions(intervention_type);
CREATE INDEX IF NOT EXISTS idx_winstory_interventions_status ON winstory_interventions(intervention_status);
CREATE INDEX IF NOT EXISTS idx_winstory_interventions_moderator ON winstory_interventions(assigned_moderator);

-- Index sur l'audit trail de modération
CREATE INDEX IF NOT EXISTS idx_moderation_audit_campaign ON moderation_audit_trail(campaign_id);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_actor ON moderation_audit_trail(actor_wallet);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_type ON moderation_audit_trail(action_type);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_timestamp ON moderation_audit_trail(timestamp);
CREATE INDEX IF NOT EXISTS idx_moderation_audit_level ON moderation_audit_trail(actor_moderation_level);

-- Index sur les niveaux de modération
CREATE INDEX IF NOT EXISTS idx_moderation_progress_level ON moderation_progress(moderation_level);
CREATE INDEX IF NOT EXISTS idx_moderation_progress_validation ON moderation_progress(blockchain_validation_type);
CREATE INDEX IF NOT EXISTS idx_moderation_progress_super ON moderation_progress(super_moderator_override);
CREATE INDEX IF NOT EXISTS idx_moderation_progress_winstory ON moderation_progress(winstory_intervention);

-- Index sur les sessions de modération
CREATE INDEX IF NOT EXISTS idx_moderation_sessions_level ON moderation_sessions(moderation_level);
CREATE INDEX IF NOT EXISTS idx_moderation_sessions_super ON moderation_sessions(is_super_moderator);
CREATE INDEX IF NOT EXISTS idx_moderation_sessions_override ON moderation_sessions(can_override);

-- Index sur les votes de modération
CREATE INDEX IF NOT EXISTS idx_moderation_votes_level ON moderation_votes(moderation_level);
CREATE INDEX IF NOT EXISTS idx_moderation_votes_validation ON moderation_votes(blockchain_validation_type);
CREATE INDEX IF NOT EXISTS idx_moderation_votes_super ON moderation_votes(is_super_moderator_vote);
CREATE INDEX IF NOT EXISTS idx_moderation_votes_override ON moderation_votes(can_override_others);

-- Index sur les récompenses WINC avec ranking
CREATE INDEX IF NOT EXISTS idx_winc_rewards_completion ON winc_rewards(completion_id);
CREATE INDEX IF NOT EXISTS idx_winc_rewards_ranking ON winc_rewards(ranking_position);
CREATE INDEX IF NOT EXISTS idx_winc_rewards_tier ON winc_rewards(ranking_tier);
CREATE INDEX IF NOT EXISTS idx_winc_rewards_rate ON winc_rewards(completion_rate);

-- Index sur les deadlines avec price pool
CREATE INDEX IF NOT EXISTS idx_completion_deadlines_price_pool ON completion_deadlines(price_pool_amount);
CREATE INDEX IF NOT EXISTS idx_completion_deadlines_b2c ON completion_deadlines(b2c_deadline_weeks);
CREATE INDEX IF NOT EXISTS idx_completion_deadlines_individual ON completion_deadlines(individual_deadline_weeks);

-- Index sur les analytics ROI et détection
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_roi ON campaign_analytics((roi_data->>'roi_percentage'));
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_suspicious ON campaign_analytics((suspicious_patterns));
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_behavior ON campaign_analytics((moderation_behavior_analysis->>'risk_score'));

-- =====================================================
-- 10. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers sur toutes les tables avec updated_at
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creator_infos_updated_at BEFORE UPDATE ON creator_infos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_contents_updated_at BEFORE UPDATE ON campaign_contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_metadata_updated_at BEFORE UPDATE ON campaign_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_pricing_configs_updated_at BEFORE UPDATE ON campaign_pricing_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_rewards_configs_updated_at BEFORE UPDATE ON campaign_rewards_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_digital_access_rewards_updated_at BEFORE UPDATE ON digital_access_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_physical_access_rewards_updated_at BEFORE UPDATE ON physical_access_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_token_rewards_updated_at BEFORE UPDATE ON token_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_item_rewards_updated_at BEFORE UPDATE ON item_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mint_payments_updated_at BEFORE UPDATE ON mint_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gas_fees_history_updated_at BEFORE UPDATE ON gas_fees_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_winc_rewards_updated_at BEFORE UPDATE ON winc_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_xp_progression_updated_at BEFORE UPDATE ON user_xp_progression FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_multipliers_updated_at BEFORE UPDATE ON performance_multipliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_completions_updated_at BEFORE UPDATE ON completions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_completion_metrics_updated_at BEFORE UPDATE ON completion_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_completion_validation_conditions_updated_at BEFORE UPDATE ON completion_validation_conditions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automatic_validation_tracking_updated_at BEFORE UPDATE ON automatic_validation_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10B. TRIGGERS POUR LES NOUVELLES TABLES
-- =====================================================

-- Triggers pour les nouvelles tables avec updated_at
CREATE TRIGGER update_connected_wallets_updated_at BEFORE UPDATE ON connected_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_completion_links_updated_at BEFORE UPDATE ON campaign_completion_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_completion_deadlines_updated_at BEFORE UPDATE ON completion_deadlines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staking_pools_updated_at BEFORE UPDATE ON staking_pools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moderator_stakes_updated_at BEFORE UPDATE ON moderator_stakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blockchain_networks_updated_at BEFORE UPDATE ON blockchain_networks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10C. TRIGGERS POUR LES NOUVELLES TABLES DE DÉTECTION ET SUPERVISION
-- =====================================================

-- Triggers pour les nouvelles tables avec updated_at
CREATE TRIGGER update_winstory_interventions_updated_at BEFORE UPDATE ON winstory_interventions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_processors_updated_at BEFORE UPDATE ON payment_processors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. VUES UTILES POUR LES WORKFLOWS
-- =====================================================

-- Correction de la vue campaigns_full
CREATE OR REPLACE VIEW campaigns_full AS
SELECT 
  c.*,
  ci.company_name,
  ci.agency_name,
  ci.wallet_address as creator_wallet,
  ci.email as creator_email,
  cc.video_url,
  cc.video_orientation,
  cc.starting_story,
  cc.guidelines,
  cm.total_completions,
  cm.tags,
  cpc.unit_value,
  cpc.net_profit,
  cpc.max_completions,
  cpc.is_free_reward,
  cpc.no_reward,
  cpc.base_mint,
  cpc.ai_option,
  mp.total_stakers as stakers_required,
  mp.active_stakers as stakers,
  mp.staking_pool_total as staked_amount,
  cpc.base_mint as mint_price,
  mp.valid_votes,
  mp.refuse_votes,
  mp.total_votes,
  mp.current_score as average_score
FROM campaigns c
LEFT JOIN creator_infos ci ON c.id = ci.campaign_id
LEFT JOIN campaign_contents cc ON c.id = cc.campaign_id
LEFT JOIN campaign_metadata cm ON c.id = cm.campaign_id
LEFT JOIN campaign_pricing_configs cpc ON c.id = cpc.campaign_id
LEFT JOIN moderation_progress mp ON c.id = mp.campaign_id;

-- Correction de la vue rewards_summary
CREATE OR REPLACE VIEW rewards_summary AS
SELECT 
  c.id as campaign_id,
  c.title as campaign_title,
  c.creator_type,
  'token' as reward_type,
  tr.reward_tier,
  tr.token_name,
  tr.blockchain,
  tr.amount_per_user::TEXT as amount_per_user,  -- Convertir numeric en text
  tr.total_amount::TEXT as total_amount          -- Convertir numeric en text
FROM campaigns c
JOIN token_rewards tr ON c.id = tr.campaign_id
UNION ALL
SELECT 
  c.id as campaign_id,
  c.title as campaign_title,
  c.creator_type,
  'item' as reward_type,
  ir.reward_tier,
  ir.item_name,
  ir.blockchain,
  ir.amount_per_user::TEXT as amount_per_user,   -- Déjà en text
  ir.total_amount::TEXT as total_amount          -- Déjà en text
FROM campaigns c
JOIN item_rewards ir ON c.id = ir.campaign_id
UNION ALL
SELECT 
  c.id as campaign_id,
  c.title as campaign_title,
  c.creator_type,
  'digital_access' as reward_type,
  dar.reward_tier,
  dar.access_name,
  dar.blockchain,
  '1' as amount_per_user,
  '1' as total_amount
FROM campaigns c
JOIN digital_access_rewards dar ON c.id = dar.campaign_id
UNION ALL
SELECT 
  c.id as campaign_id,
  c.title as campaign_title,
  c.creator_type,
  'physical_access' as reward_type,
  par.reward_tier,
  par.access_name,
  par.blockchain,
  '1' as amount_per_user,
  '1' as total_amount
FROM campaigns c
JOIN physical_access_rewards par ON c.id = par.campaign_id;

-- Vue des complétions avec scores et validation
CREATE VIEW completions_with_validation AS
SELECT 
  co.*,
  c.title as campaign_title,
  c.creator_type,
  cvc.condition_1_stakers_voted,
  cvc.condition_2_staking_pool_exceeds_unit_value,
  cvc.condition_3_majority_ratio_met,
  cvc.all_conditions_met,
  cvc.stakers_count,
  cvc.staking_pool_amount,
  cvc.unit_value,
  cvc.valid_votes_count,
  cvc.refuse_votes_count,
  cvc.majority_ratio,
  cvc.validation_timestamp,
  COUNT(mcs.id) as total_scores,
  AVG(mcs.score) as average_score,
  MIN(mcs.score) as min_score,
  MAX(mcs.score) as max_score
FROM completions co
JOIN campaigns c ON co.original_campaign_id = c.id
LEFT JOIN completion_validation_conditions cvc ON co.id = cvc.completion_id
LEFT JOIN completion_moderation_scores mcs ON co.id = mcs.completion_id
GROUP BY co.id, c.title, c.creator_type, cvc.condition_1_stakers_voted, cvc.condition_2_staking_pool_exceeds_unit_value, cvc.condition_3_majority_ratio_met, cvc.all_conditions_met, cvc.stakers_count, cvc.staking_pool_amount, cvc.unit_value, cvc.valid_votes_count, cvc.refuse_votes_count, cvc.majority_ratio, cvc.validation_timestamp;

-- Vue des complétions validées prêtes pour récompenses (CORRIGÉE)
CREATE OR REPLACE VIEW validated_completions_for_rewards AS
SELECT 
  co.id,
  co.original_campaign_id,
  co.completer_wallet,
  co.title,
  co.video_url,
  co.thumbnail_url,
  co.status,
  co.score_avg,
  co.roi_earned,
  co.validation_status,
  co.validation_conditions_met,
  co.validation_date,
  co.rejection_reason,
  co.created_at,
  co.updated_at,
  c.title as campaign_title,
  c.creator_type,
  cvc.validation_timestamp,
  cvc.stakers_count,
  cvc.majority_ratio,
  AVG(mcs.score) as final_score,
  ROW_NUMBER() OVER (PARTITION BY co.original_campaign_id ORDER BY AVG(mcs.score) DESC) as ranking
FROM completions co
JOIN campaigns c ON co.original_campaign_id = c.id
JOIN completion_validation_conditions cvc ON co.id = cvc.completion_id
LEFT JOIN completion_moderation_scores mcs ON co.id = mcs.completion_id
WHERE cvc.all_conditions_met = TRUE 
  AND co.status = 'approved'
  AND co.validation_status = 'validated'
GROUP BY co.id, c.title, c.creator_type, cvc.validation_timestamp, cvc.stakers_count, cvc.majority_ratio;

--- Vue des complétions rejetées (CORRIGÉE)
CREATE OR REPLACE VIEW rejected_completions AS
SELECT 
  co.id,
  co.original_campaign_id,
  co.completer_wallet,
  co.title,
  co.video_url,
  co.thumbnail_url,
  co.status,
  co.score_avg,
  co.roi_earned,
  co.validation_status,
  co.validation_conditions_met,
  co.validation_date,
  co.rejection_reason,  -- On garde rejection_reason une seule fois
  co.created_at,
  co.updated_at,
  c.title as campaign_title,
  c.creator_type,
  cvc.validation_timestamp,
  cvc.stakers_count,
  cvc.valid_votes_count,
  cvc.refuse_votes_count,
  cvc.majority_ratio
FROM completions co
JOIN campaigns c ON co.original_campaign_id = c.id
LEFT JOIN completion_validation_conditions cvc ON co.id = cvc.completion_id
WHERE co.status = 'rejected' 
  OR (cvc.all_conditions_met = TRUE AND cvc.valid_votes_count < cvc.refuse_votes_count);

-- =====================================================
-- 12. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE campaigns IS 'Campagnes principales (Initial ou Completion)';
COMMENT ON TABLE creator_infos IS 'Informations des créateurs (B2C, Agency, Individual)';
COMMENT ON TABLE campaign_contents IS 'Contenu vidéo et textuel des campagnes';
COMMENT ON TABLE campaign_metadata IS 'Métadonnées et statistiques des campagnes';
COMMENT ON TABLE campaign_pricing_configs IS 'Configuration des prix MINT et calculs ROI';
COMMENT ON TABLE digital_access_rewards IS 'Récompenses d''accès digital (webinars, contenus exclusifs)';
COMMENT ON TABLE physical_access_rewards IS 'Récompenses d''accès physique (événements VIP)';
COMMENT ON TABLE token_rewards IS 'Récompenses de tokens (ERC20, SPL, BRC20)';
COMMENT ON TABLE item_rewards IS 'Récompenses d''items (NFTs, collectibles)';
COMMENT ON TABLE mint_payments IS 'Paiements MINT (B2C, AgencyB2C, Individual) avec options AI et no-rewards';
COMMENT ON TABLE gas_fees_history IS 'Historique des frais de gas par blockchain pour estimation des coûts';
COMMENT ON TABLE winc_rewards IS 'Système de récompenses WINC avec multiplicateurs et XP';
COMMENT ON TABLE user_xp_progression IS 'Progression XP et niveaux utilisateur avec achievements';
COMMENT ON TABLE performance_multipliers IS 'Multiplicateurs de performance basés sur le taux de completion';
COMMENT ON TABLE moderation_progress IS 'Progression de la modération (stakers, votes, scores)';
COMMENT ON TABLE moderation_sessions IS 'Sessions de modération par modérateur';
COMMENT ON TABLE completion_moderation_scores IS 'Scores attribués par modérateur (contrainte unique par score)';
COMMENT ON TABLE moderation_votes IS 'Votes détaillés de modération (approve/reject/abstain)';
COMMENT ON TABLE completion_metrics IS 'Métriques d''engagement des complétions';
COMMENT ON TABLE completion_validation_conditions IS 'Suivi des conditions 3/3 pour chaque complétion';
COMMENT ON TABLE automatic_validation_tracking IS 'Suivi automatique de la validation des conditions 3/3';
COMMENT ON TABLE automatic_distribution_logs IS 'Logs de distribution automatique des récompenses';
COMMENT ON TABLE reward_distributions IS 'Historique des distributions de récompenses';
COMMENT ON TABLE reward_claims IS 'Réclamations manuelles de récompenses';

-- =====================================================
-- 12B. COMMENTAIRES POUR LES NOUVELLES TABLES

COMMENT ON TABLE mint_payments IS 'Paiements MINT (B2C, AgencyB2C, Individual) avec options AI et no-rewards';
COMMENT ON TABLE gas_fees_history IS 'Historique des frais de gas par blockchain pour estimation des coûts';
COMMENT ON TABLE winc_rewards IS 'Système de récompenses WINC avec multiplicateurs et XP';
COMMENT ON TABLE user_xp_progression IS 'Progression XP et niveaux utilisateur avec achievements';
COMMENT ON TABLE performance_multipliers IS 'Multiplicateurs de performance basés sur le taux de completion';
COMMENT ON TABLE connected_wallets IS 'Wallets connectés avec support multi-réseaux';
COMMENT ON TABLE wallet_sessions IS 'Sessions de connexion wallet avec gestion des expirations';
COMMENT ON TABLE campaign_completion_links IS 'Liens entre campagnes initiales et leurs complétions';
COMMENT ON TABLE completion_deadlines IS 'Configuration des deadlines de completion (fixe, basée sur completion, dynamique)';
COMMENT ON TABLE staking_pools IS 'Pools de staking des modérateurs avec récompenses';
COMMENT ON TABLE moderator_stakes IS 'Stakes individuels des modérateurs avec types (actif, passif, délégué)';
COMMENT ON TABLE campaign_analytics IS 'Métriques de campagne en temps réel (vues, complétions, votes, récompenses)';
COMMENT ON TABLE workflow_states IS 'États et transitions de workflow avec données JSON';
COMMENT ON TABLE system_notifications IS 'Notifications système avec priorités et expiration';
COMMENT ON TABLE deployed_contracts IS 'Smart contracts déployés (à configurer ultérieurement)';

-- =====================================================
-- 12C. COMMENTAIRES POUR LES NOUVELLES TABLES DE DÉTECTION ET SUPERVISION
-- =====================================================

COMMENT ON TABLE suspicious_behavior_detection IS 'Détection de comportements suspects et complots avec scoring de risque';
COMMENT ON TABLE winstory_interventions IS 'Interventions Winstory (création vidéo 24h, super modération, anti-complot)';
COMMENT ON TABLE moderation_audit_trail IS 'Audit trail complet de toutes les actions de modération avec traçabilité blockchain';
COMMENT ON TABLE moderation_progress IS 'Progression de la modération avec niveaux (standard, super, winstory) et validation gratuite';
COMMENT ON TABLE moderation_sessions IS 'Sessions de modération avec gestion des niveaux et permissions d''override';
COMMENT ON TABLE moderation_votes IS 'Votes de modération avec validation blockchain gratuite et gestion des super modérateurs';
COMMENT ON TABLE winc_rewards IS 'Système de récompenses WINC avec ranking des compléteurs et taux de completion';
COMMENT ON TABLE completion_deadlines IS 'Configuration des deadlines (B2C: 1 semaine, Individual: basé sur price pool)';
COMMENT ON TABLE campaign_analytics IS 'Métriques ROI, détection de complots et analyse des comportements de modération';
COMMENT ON TABLE blockchain_networks IS 'Configuration des réseaux (Base: MINT activé, Polygon: récompenses activées)';
COMMENT ON TABLE deployed_contracts IS 'Smart contracts déployés (à configurer ultérieurement)';

-- =====================================================
-- 12D. COMMENTAIRES POUR LES NOUVELLES TABLES MY WIN
-- =====================================================

COMMENT ON TABLE user_dashboard_stats IS 'Stats consolidées du dashboard My Win (créations, complétions, modérations, WINC, XP)';
COMMENT ON TABLE user_moderation_history IS 'Historique complet des modérations par utilisateur avec alignment tracking';
COMMENT ON TABLE user_completion_history IS 'Historique des complétions par utilisateur avec scores et classements';
COMMENT ON TABLE user_completion_moderator_scores IS 'Détail des scores attribués par chaque modérateur pour les complétions';
COMMENT ON TABLE user_earned_rewards IS 'Récompenses gagnées par les utilisateurs (WINC, XP, tokens, NFTs, accès)';
COMMENT ON TABLE user_achievements IS 'Achievements et badges débloqués par les utilisateurs';
COMMENT ON TABLE user_level_progression IS 'Historique des montées de niveau utilisateur avec récompenses';
COMMENT ON TABLE user_recent_activities IS 'Fil d''actualité des activités utilisateur pour My Win dashboard';

-- =====================================================
-- 4F. TABLES DE WEBHOOKS, REMBOURSEMENTS ET FACTURATION (NOUVELLES)
-- =====================================================

-- Webhook events des processeurs de paiement
CREATE TABLE payment_webhook_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  processor_id TEXT NOT NULL REFERENCES payment_processors(id) ON DELETE CASCADE,
  webhook_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('paid', 'failed', 'refunded', 'chargeback')),
  payment_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT,
  status TEXT,
  raw_data JSONB, -- Données brutes du webhook
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remboursements et chargebacks
CREATE TABLE payment_refunds (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  mint_payment_id TEXT NOT NULL REFERENCES mint_payments(id) ON DELETE CASCADE,
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_reason TEXT NOT NULL,
  processor_refund_id TEXT,
  refund_status TEXT DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  chargeback_reason TEXT,
  chargeback_amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facturation B2B
CREATE TABLE invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  invoice_number TEXT UNIQUE NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
  agency_id TEXT REFERENCES agencies(id) ON DELETE SET NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  vat_id TEXT,
  billing_address JSONB,
  pdf_url TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method payment_method,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lignes de facture
CREATE TABLE invoice_line_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. TABLES MY WIN - DASHBOARD ET TRACKING UTILISATEUR
-- =====================================================

-- Dashboard stats par utilisateur (My Win page)
CREATE TABLE user_dashboard_stats (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL UNIQUE, -- Contrainte unique pour éviter les doublons
  total_creations INTEGER DEFAULT 0, -- Nombre de campagnes créées
  total_completions INTEGER DEFAULT 0, -- Nombre de complétions effectuées
  total_moderations INTEGER DEFAULT 0, -- Nombre de modérations effectuées
  total_winc_earned DECIMAL(20,8) DEFAULT 0, -- Total WINC gagné
  total_winc_lost DECIMAL(20,8) DEFAULT 0, -- Total WINC perdu (modérations)
  total_xp_earned INTEGER DEFAULT 0, -- Total XP accumulé
  current_level INTEGER DEFAULT 1, -- Niveau actuel
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historique détaillé des modérations par utilisateur (My Moderations)
CREATE TABLE user_moderation_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_id TEXT REFERENCES completions(id) ON DELETE SET NULL,
  campaign_title TEXT NOT NULL,
  completion_title TEXT,
  moderation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  user_vote moderation_decision NOT NULL, -- 'approve', 'reject', 'abstain'
  final_result TEXT NOT NULL CHECK (final_result IN ('approved', 'rejected', 'pending')),
  winc_earned DECIMAL(20,8) DEFAULT 0,
  winc_lost DECIMAL(20,8) DEFAULT 0,
  alignment_percentage INTEGER DEFAULT 0, -- % d'alignement avec résultat final
  staked_amount DECIMAL(20,8) DEFAULT 0,
  content_url TEXT,
  vote_weight DECIMAL(5,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historique détaillé des complétions par utilisateur (My Completions)
CREATE TABLE user_completion_history (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_id TEXT NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  campaign_title TEXT NOT NULL,
  completion_title TEXT NOT NULL,
  completion_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'in_progress', 'in_moderation', 'validated', 'refused')),
  final_score INTEGER, -- Score moyen sur 100 des modérateurs
  ranking INTEGER, -- Position dans le classement
  roi_earned DECIMAL(20,8) DEFAULT 0, -- ROI gagné si top 3
  standard_reward_description TEXT, -- Description de la récompense standard
  premium_reward_description TEXT, -- Description de la récompense premium
  campaign_end_date TIMESTAMP WITH TIME ZONE,
  completion_target INTEGER, -- Nombre de complétions cibles
  current_completions INTEGER, -- Nombre de complétions actuelles
  usdc_revenue DECIMAL(10,2) DEFAULT 0, -- Revenus USDC générés
  campaign_creator_type TEXT CHECK (campaign_creator_type IN ('individual', 'company', 'agency')),
  is_top_three BOOLEAN DEFAULT FALSE, -- Si dans le top 3
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores détaillés par modérateur pour chaque complétion (My Completions - ModeratorScores)
CREATE TABLE user_completion_moderator_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  completion_history_id TEXT NOT NULL REFERENCES user_completion_history(id) ON DELETE CASCADE,
  completion_id TEXT NOT NULL REFERENCES completions(id) ON DELETE CASCADE,
  staker_wallet TEXT NOT NULL, -- Wallet du modérateur
  staker_name TEXT NOT NULL, -- Nom du modérateur (Staker 1, 2, etc.)
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100), -- Score attribué
  staked_amount DECIMAL(20,8) NOT NULL, -- Montant staké par ce modérateur
  vote_timestamp TIMESTAMP WITH TIME ZONE,
  is_refused BOOLEAN DEFAULT FALSE, -- Si score = 0 (refusé)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Récompenses gagnées par utilisateur (My Win - Rewards tracking)
CREATE TABLE user_earned_rewards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  completion_id TEXT REFERENCES completions(id) ON DELETE SET NULL,
  reward_source TEXT NOT NULL CHECK (reward_source IN ('creation', 'completion', 'moderation', 'staking', 'top3', 'premium')),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('winc', 'xp', 'token', 'nft', 'digital_access', 'physical_access')),
  reward_tier reward_tier,
  amount DECIMAL(20,8),
  token_symbol TEXT,
  blockchain TEXT,
  contract_address TEXT,
  token_id TEXT,
  description TEXT,
  claim_status TEXT DEFAULT 'pending' CHECK (claim_status IN ('pending', 'claimed', 'failed', 'expired')),
  claimed_at TIMESTAMP WITH TIME ZONE,
  claim_tx_hash TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements et badges utilisateur
CREATE TABLE user_achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('first_creation', 'first_completion', 'first_moderation', 'top_creator', 'top_completer', 'top_moderator', 'staking_master', 'winc_millionaire')),
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_icon TEXT,
  achievement_rarity TEXT CHECK (achievement_rarity IN ('common', 'rare', 'epic', 'legendary')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_displayed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progression des niveaux utilisateur
CREATE TABLE user_level_progression (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  previous_level INTEGER DEFAULT 1,
  new_level INTEGER NOT NULL,
  xp_at_level_up INTEGER NOT NULL,
  xp_required_for_next INTEGER NOT NULL,
  level_up_rewards JSONB, -- Récompenses obtenues au level up
  level_up_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activités récentes par utilisateur (fil d'actualité My Win)
CREATE TABLE user_recent_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('campaign_created', 'completion_submitted', 'moderation_voted', 'reward_earned', 'level_up', 'achievement_unlocked')),
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  related_campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  related_completion_id TEXT REFERENCES completions(id) ON DELETE CASCADE,
  metadata JSONB, -- Données supplémentaires de l'activité
  is_important BOOLEAN DEFAULT FALSE, -- Si à mettre en avant
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13B. VUES MY WIN POUR AGRÉGATIONS
-- =====================================================

-- Vue agrégée des stats dashboard par utilisateur
CREATE OR REPLACE VIEW user_dashboard_stats_aggregated AS
SELECT 
  u.wallet_address,
  COALESCE(creator_stats.creations, 0) as total_creations,
  COALESCE(completer_stats.completions, 0) as total_completions,
  COALESCE(moderator_stats.moderations, 0) as total_moderations,
  COALESCE(winc_stats.total_earned, 0) as total_winc_earned,
  COALESCE(winc_stats.total_lost, 0) as total_winc_lost,
  COALESCE(xp_stats.total_xp, 0) as total_xp_earned,
  COALESCE(xp_stats.current_level, 1) as current_level,
  NOW() as last_calculated
FROM user_profiles u
LEFT JOIN (
  SELECT creator_wallet, COUNT(*) as creations
  FROM campaigns c
  JOIN creator_infos ci ON c.id = ci.campaign_id
  GROUP BY creator_wallet
) creator_stats ON u.wallet_address = creator_stats.creator_wallet
LEFT JOIN (
  SELECT completer_wallet, COUNT(*) as completions
  FROM completions
  GROUP BY completer_wallet
) completer_stats ON u.wallet_address = completer_stats.completer_wallet
LEFT JOIN (
  SELECT moderator_wallet, COUNT(*) as moderations
  FROM moderation_votes
  GROUP BY moderator_wallet
) moderator_stats ON u.wallet_address = moderator_stats.moderator_wallet
LEFT JOIN (
  SELECT 
    user_wallet,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_lost
  FROM user_earned_rewards
  WHERE reward_type = 'winc'
  GROUP BY user_wallet
) winc_stats ON u.wallet_address = winc_stats.user_wallet
LEFT JOIN (
  SELECT user_wallet, total_xp, current_level
  FROM user_xp_progression
) xp_stats ON u.wallet_address = xp_stats.user_wallet;

-- Vue des modérations avec alignment calculé
CREATE OR REPLACE VIEW user_moderations_with_alignment AS
SELECT 
  umh.*,
  CASE 
    WHEN umh.final_result = 'approved' AND umh.user_vote = 'approve' THEN 100
    WHEN umh.final_result = 'rejected' AND umh.user_vote = 'reject' THEN 100
    WHEN umh.final_result = 'pending' THEN 50
    ELSE 0
  END as calculated_alignment_percentage
FROM user_moderation_history umh;

-- Vue des complétions avec rewards calculées
CREATE OR REPLACE VIEW user_completions_with_rewards AS
SELECT 
  uch.*,
  COALESCE(standard_rewards.reward_count, 0) as standard_rewards_count,
  COALESCE(premium_rewards.reward_count, 0) as premium_rewards_count,
  COALESCE(total_rewards.total_value, 0) as total_reward_value
FROM user_completion_history uch
LEFT JOIN (
  SELECT completion_id, COUNT(*) as reward_count
  FROM user_earned_rewards
  WHERE reward_tier = 'standard'
  GROUP BY completion_id
) standard_rewards ON uch.completion_id = standard_rewards.completion_id
LEFT JOIN (
  SELECT completion_id, COUNT(*) as reward_count
  FROM user_earned_rewards
  WHERE reward_tier = 'premium'
  GROUP BY completion_id
) premium_rewards ON uch.completion_id = premium_rewards.completion_id
LEFT JOIN (
  SELECT completion_id, SUM(amount) as total_value
  FROM user_earned_rewards
  WHERE reward_type IN ('winc', 'token') AND amount IS NOT NULL
  GROUP BY completion_id
) total_rewards ON uch.completion_id = total_rewards.completion_id;

-- =====================================================
-- SCHEMA TERMINÉ - PRÊT POUR SUPABASE
-- Rate limits et anti-spam
CREATE TABLE rate_limits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  identifier TEXT NOT NULL, -- IP, wallet, email
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'wallet', 'email')),
  action_type TEXT NOT NULL CHECK (action_type IN ('completion', 'moderation', 'staking', 'login')),
  attempts_count INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 1, -- 1 completion par wallet
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Réputation IP pour détection de comportements suspects
CREATE TABLE ip_reputation (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ip_address TEXT NOT NULL UNIQUE,
  reputation_score ip_reputation_score DEFAULT 'neutral',
  score_value INTEGER DEFAULT 50,
  suspicious_activities INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historique des activités par IP
CREATE TABLE ip_activity_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  ip_address TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  user_agent TEXT,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  wallet_address TEXT,
  success BOOLEAN,
  risk_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7D. TABLES DE NOTIFICATIONS ET COMMUNICATION (NOUVELLES)
-- =====================================================

-- Canaux de notification configurés par utilisateur
CREATE TABLE user_notification_channels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  channel_type notification_channel NOT NULL,
  channel_value TEXT NOT NULL, -- email, phone, discord webhook, etc.
  is_active BOOLEAN DEFAULT TRUE,
  preferences JSONB, -- Préférences de notification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs des messages envoyés
CREATE TABLE notification_message_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  notification_id TEXT NOT NULL REFERENCES system_notifications(id) ON DELETE CASCADE,
  channel_type notification_channel NOT NULL,
  recipient TEXT NOT NULL,
  message_content TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates de notifications multilingues
CREATE TABLE notification_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  subject TEXT,
  message_template TEXT NOT NULL,
  variables TEXT[], -- Variables disponibles dans le template
  locale TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Traductions des templates
CREATE TABLE notification_template_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  template_id TEXT NOT NULL REFERENCES notification_templates(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  subject TEXT,
  message_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, locale)
);

-- =====================================================
-- 7E. TABLES D'INTERNATIONALISATION ET CONFORMITÉ (NOUVELLES)
-- =====================================================

-- Locales et langues supportées
CREATE TABLE supported_locales (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  locale_code TEXT NOT NULL UNIQUE, -- en, fr, es, de, etc.
  language_name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Traductions des contenus de campagne
CREATE TABLE campaign_translations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  title TEXT,
  description TEXT,
  guidelines TEXT,
  starting_story TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, locale)
);

-- Consentements RGPD
CREATE TABLE user_consents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  consent_purpose consent_purpose NOT NULL,
  consent_version TEXT NOT NULL,
  is_granted BOOLEAN NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiques de rétention des données
CREATE TABLE data_retention_policies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  data_type TEXT NOT NULL, -- user_data, campaign_data, completion_data, etc.
  retention_period_days INTEGER NOT NULL,
  deletion_strategy TEXT DEFAULT 'soft_delete',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Acceptation des CGU/Privacy
CREATE TABLE policy_acceptances (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_wallet TEXT NOT NULL,
  policy_type policy_type NOT NULL,
  policy_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Versions des politiques
CREATE TABLE policy_versions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  policy_type policy_type NOT NULL,
  version TEXT NOT NULL,
  effective_date DATE NOT NULL,
  content_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(policy_type, version)
);

-- =====================================================
-- 7F. TABLES DE PERFORMANCE ET COÛTS (NOUVELLES)
-- =====================================================

-- Coûts détaillés par campagne
CREATE TABLE campaign_costs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  cost_category cost_category NOT NULL,
  cost_amount DECIMAL(20,8) NOT NULL,
  cost_currency TEXT DEFAULT 'USD',
  cost_details JSONB, -- Détails du coût
  billing_period TEXT, -- hourly, daily, monthly, one_time
  incurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_billed BOOLEAN DEFAULT FALSE,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métriques de performance système
CREATE TABLE system_performance_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(20,8),
  metric_unit TEXT,
  metric_period metric_period DEFAULT 'hourly',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB, -- Métadonnées supplémentaires
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monitoring des ressources
CREATE TABLE resource_monitoring (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  resource_type TEXT NOT NULL, -- storage, bandwidth, compute, database
  resource_name TEXT NOT NULL,
  current_usage DECIMAL(20,8),
  max_capacity DECIMAL(20,8),
  usage_percentage DECIMAL(5,2),
  alert_threshold DECIMAL(5,2) DEFAULT 80,
  is_alert_triggered BOOLEAN DEFAULT FALSE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs d'erreurs système
CREATE TABLE system_error_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_wallet TEXT,
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SCHEMA SUPABASE COMPLET - PRÊT POUR IMPLÉMENTATION
-- =====================================================

-- Index sur les analytics ROI et détection

-- =====================================================
-- 9D. INDEX POUR LES NOUVELLES TABLES AJOUTÉES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_wallet ON user_roles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_campaign ON user_roles(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- Index sur les vérifications KYC
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_wallet ON kyc_verifications(wallet_address);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_type ON kyc_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_kyc_verifications_status ON kyc_verifications(kyc_status);

-- Index sur les signatures de wallet
CREATE INDEX IF NOT EXISTS idx_wallet_signatures_address ON wallet_signatures(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_signatures_nonce ON wallet_signatures(nonce);
CREATE INDEX IF NOT EXISTS idx_wallet_signatures_valid ON wallet_signatures(is_valid);

-- Index sur les entreprises et agences
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(company_name);
CREATE INDEX IF NOT EXISTS idx_companies_vat ON companies(vat_number);
CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country);
CREATE INDEX IF NOT EXISTS idx_agencies_name ON agencies(agency_name);
CREATE INDEX IF NOT EXISTS idx_agencies_vat ON agencies(vat_number);

-- Index sur les relations agence-client
CREATE INDEX IF NOT EXISTS idx_agency_clients_agency ON agency_clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_clients_company ON agency_clients(company_id);
CREATE INDEX IF NOT EXISTS idx_agency_clients_active ON agency_clients(is_active);

-- Index sur la configuration des prix
CREATE INDEX IF NOT EXISTS idx_campaign_pricing_configs_campaign ON campaign_pricing_configs(campaign_id);

-- Index sur les livraisons de récompenses
CREATE INDEX IF NOT EXISTS idx_digital_access_deliveries_completion ON digital_access_deliveries(completion_id);
CREATE INDEX IF NOT EXISTS idx_digital_access_deliveries_redeemed ON digital_access_deliveries(is_redeemed);
CREATE INDEX IF NOT EXISTS idx_physical_access_deliveries_completion ON physical_access_deliveries(completion_id);
CREATE INDEX IF NOT EXISTS idx_physical_access_deliveries_status ON physical_access_deliveries(fulfillment_status);

-- Index sur les jobs de fulfillment
CREATE INDEX IF NOT EXISTS idx_reward_fulfillment_jobs_delivery ON reward_fulfillment_jobs(physical_delivery_id);
CREATE INDEX IF NOT EXISTS idx_reward_fulfillment_jobs_type ON reward_fulfillment_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_reward_fulfillment_jobs_status ON reward_fulfillment_jobs(status);

-- Index sur les assignations NFT
CREATE INDEX IF NOT EXISTS idx_completion_nft_assignments_completion ON completion_nft_assignments(completion_id);
CREATE INDEX IF NOT EXISTS idx_completion_nft_assignments_status ON completion_nft_assignments(minting_status);
CREATE INDEX IF NOT EXISTS idx_completion_nft_assignments_retry ON completion_nft_assignments(retry_count);

-- Index sur les règles d'éligibilité
CREATE INDEX IF NOT EXISTS idx_reward_eligibility_rules_campaign ON reward_eligibility_rules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_reward_eligibility_rules_tier ON reward_eligibility_rules(reward_tier);
CREATE INDEX IF NOT EXISTS idx_reward_eligibility_rules_type ON reward_eligibility_rules(eligibility_type);

-- Index sur les métadonnées de contenu
CREATE INDEX IF NOT EXISTS idx_completion_content_metadata_completion ON completion_content_metadata(completion_id);
CREATE INDEX IF NOT EXISTS idx_completion_content_metadata_provider ON completion_content_metadata(storage_provider);
CREATE INDEX IF NOT EXISTS idx_completion_content_metadata_transcode ON completion_content_metadata(transcode_status);

-- Index sur les tentatives de complétion
CREATE INDEX IF NOT EXISTS idx_completion_attempts_campaign ON completion_attempts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_completion_attempts_wallet ON completion_attempts(completer_wallet);
CREATE INDEX IF NOT EXISTS idx_completion_attempts_current ON completion_attempts(is_current_attempt);

-- Index sur les scores de modération
CREATE INDEX IF NOT EXISTS idx_completion_moderation_scores_completion ON completion_moderation_scores(completion_id);
CREATE INDEX IF NOT EXISTS idx_completion_moderation_scores_moderator ON completion_moderation_scores(moderator_wallet);
CREATE INDEX IF NOT EXISTS idx_completion_moderation_scores_used ON completion_moderation_scores(is_used);

-- Index sur la configuration du staking
CREATE INDEX IF NOT EXISTS idx_staking_configuration_campaign ON staking_configuration(campaign_id);
CREATE INDEX IF NOT EXISTS idx_staking_configuration_currency ON staking_configuration(staking_currency);
CREATE INDEX IF NOT EXISTS idx_staking_configuration_active ON staking_configuration(is_active);

-- Index sur les justifications des votes
CREATE INDEX IF NOT EXISTS idx_moderation_vote_justifications_vote ON moderation_vote_justifications(vote_id);
CREATE INDEX IF NOT EXISTS idx_moderation_vote_justifications_public ON moderation_vote_justifications(is_public);

-- Index sur l'historique du staking
CREATE INDEX IF NOT EXISTS idx_staking_history_wallet ON staking_history(moderator_wallet);
CREATE INDEX IF NOT EXISTS idx_staking_history_campaign ON staking_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_staking_history_type ON staking_history(action_type);

-- Index sur les webhooks de paiement
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_processor ON payment_webhook_events(processor_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_type ON payment_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_processed ON payment_webhook_events(processed);

-- Index sur les remboursements
CREATE INDEX IF NOT EXISTS idx_payment_refunds_payment ON payment_refunds(mint_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_status ON payment_refunds(refund_status);

-- Index sur les factures
CREATE INDEX IF NOT EXISTS idx_invoices_campaign ON invoices(campaign_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_agency ON invoices(agency_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_paid ON invoices(is_paid);

-- Index sur les lignes de facture
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

-- Index sur les réseaux de récompenses
CREATE INDEX IF NOT EXISTS idx_campaign_reward_networks_campaign ON campaign_reward_networks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_reward_networks_type ON campaign_reward_networks(reward_type);
CREATE INDEX IF NOT EXISTS idx_campaign_reward_networks_network ON campaign_reward_networks(blockchain_network);

-- Index sur la queue de transactions
CREATE INDEX IF NOT EXISTS idx_blockchain_transaction_queue_campaign ON blockchain_transaction_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_transaction_queue_type ON blockchain_transaction_queue(transaction_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_transaction_queue_status ON blockchain_transaction_queue(status);
CREATE INDEX IF NOT EXISTS idx_blockchain_transaction_queue_priority ON blockchain_transaction_queue(priority);
CREATE INDEX IF NOT EXISTS idx_blockchain_transaction_queue_idempotency ON blockchain_transaction_queue(idempotency_key);

-- Index sur les receipts blockchain
CREATE INDEX IF NOT EXISTS idx_blockchain_transaction_receipts_queue ON blockchain_transaction_receipts(transaction_queue_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_transaction_receipts_hash ON blockchain_transaction_receipts(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_transaction_receipts_status ON blockchain_transaction_receipts(status);

-- Index sur les snapshots ROI
CREATE INDEX IF NOT EXISTS idx_roi_snapshots_campaign ON roi_snapshots(campaign_id);
CREATE INDEX IF NOT EXISTS idx_roi_snapshots_timestamp ON roi_snapshots(recorded_at);

-- Index sur les rate limits
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_type ON rate_limits(identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_action ON rate_limits(action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON rate_limits(is_blocked);

-- Index sur la réputation IP
CREATE INDEX IF NOT EXISTS idx_ip_reputation_address ON ip_reputation(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_score ON ip_reputation(reputation_score);
CREATE INDEX IF NOT EXISTS idx_ip_reputation_blocked ON ip_reputation(is_blocked);

-- Index sur les logs d'activité IP
CREATE INDEX IF NOT EXISTS idx_ip_activity_log_address ON ip_activity_log(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_activity_log_type ON ip_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_ip_activity_log_timestamp ON ip_activity_log(created_at);

-- Index sur les canaux de notification
CREATE INDEX IF NOT EXISTS idx_user_notification_channels_wallet ON user_notification_channels(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_notification_channels_type ON user_notification_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_user_notification_channels_active ON user_notification_channels(is_active);

-- Index sur les logs de messages
CREATE INDEX IF NOT EXISTS idx_notification_message_logs_notification ON notification_message_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_message_logs_channel ON notification_message_logs(channel_type);
CREATE INDEX IF NOT EXISTS idx_notification_message_logs_status ON notification_message_logs(status);

-- Index sur les templates de notification
CREATE INDEX IF NOT EXISTS idx_notification_templates_key ON notification_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_notification_templates_locale ON notification_templates(locale);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

-- Index sur les traductions de templates
CREATE INDEX IF NOT EXISTS idx_notification_template_translations_template ON notification_template_translations(template_id);
CREATE INDEX IF NOT EXISTS idx_notification_template_translations_locale ON notification_template_translations(locale);

-- Index sur les locales supportées
CREATE INDEX IF NOT EXISTS idx_supported_locales_code ON supported_locales(locale_code);
CREATE INDEX IF NOT EXISTS idx_supported_locales_active ON supported_locales(is_active);
CREATE INDEX IF NOT EXISTS idx_supported_locales_default ON supported_locales(is_default);

-- Index sur les traductions de campagnes
CREATE INDEX IF NOT EXISTS idx_campaign_translations_campaign ON campaign_translations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_translations_locale ON campaign_translations(locale);

-- Index sur les consentements utilisateur
CREATE INDEX IF NOT EXISTS idx_user_consents_wallet ON user_consents(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_consents_purpose ON user_consents(consent_purpose);
CREATE INDEX IF NOT EXISTS idx_user_consents_granted ON user_consents(is_granted);

-- Index sur les politiques de rétention
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_type ON data_retention_policies(data_type);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_active ON data_retention_policies(is_active);

-- Index sur les acceptations de politiques
CREATE INDEX IF NOT EXISTS idx_policy_acceptances_wallet ON policy_acceptances(user_wallet);
CREATE INDEX IF NOT EXISTS idx_policy_acceptances_type ON policy_acceptances(policy_type);
CREATE INDEX IF NOT EXISTS idx_policy_acceptances_version ON policy_acceptances(policy_version);

-- Index sur les versions de politiques
CREATE INDEX IF NOT EXISTS idx_policy_versions_type ON policy_versions(policy_type);
CREATE INDEX IF NOT EXISTS idx_policy_versions_active ON policy_versions(is_active);

-- Index sur les coûts de campagne
CREATE INDEX IF NOT EXISTS idx_campaign_costs_campaign ON campaign_costs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_costs_category ON campaign_costs(cost_category);
CREATE INDEX IF NOT EXISTS idx_campaign_costs_billed ON campaign_costs(is_billed);

-- Index sur les métriques de performance
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_name ON system_performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_performance_metrics_period ON system_performance_metrics(metric_period);

-- Index sur le monitoring des ressources
CREATE INDEX IF NOT EXISTS idx_resource_monitoring_type ON resource_monitoring(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_monitoring_name ON resource_monitoring(resource_name);
CREATE INDEX IF NOT EXISTS idx_resource_monitoring_alert ON resource_monitoring(is_alert_triggered);

-- Index sur les logs d'erreurs système
CREATE INDEX IF NOT EXISTS idx_system_error_logs_type ON system_error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_system_error_logs_severity ON system_error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_system_error_logs_resolved ON system_error_logs(is_resolved);

-- =====================================================
-- 9E. INDEX POUR LES NOUVELLES TABLES MY WIN
-- =====================================================

-- Index sur les stats dashboard utilisateur
CREATE INDEX IF NOT EXISTS idx_user_dashboard_stats_wallet ON user_dashboard_stats(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_stats_updated ON user_dashboard_stats(last_updated);

-- Index sur l'historique des modérations utilisateur
CREATE INDEX IF NOT EXISTS idx_user_moderation_history_wallet ON user_moderation_history(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_moderation_history_campaign ON user_moderation_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_moderation_history_completion ON user_moderation_history(completion_id);
CREATE INDEX IF NOT EXISTS idx_user_moderation_history_date ON user_moderation_history(moderation_date);
CREATE INDEX IF NOT EXISTS idx_user_moderation_history_vote ON user_moderation_history(user_vote);
CREATE INDEX IF NOT EXISTS idx_user_moderation_history_result ON user_moderation_history(final_result);
CREATE INDEX IF NOT EXISTS idx_user_moderation_history_alignment ON user_moderation_history(alignment_percentage);

-- Index sur l'historique des complétions utilisateur
CREATE INDEX IF NOT EXISTS idx_user_completion_history_wallet ON user_completion_history(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_completion_history_campaign ON user_completion_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_completion_history_completion ON user_completion_history(completion_id);
CREATE INDEX IF NOT EXISTS idx_user_completion_history_date ON user_completion_history(completion_date);
CREATE INDEX IF NOT EXISTS idx_user_completion_history_status ON user_completion_history(status);
CREATE INDEX IF NOT EXISTS idx_user_completion_history_ranking ON user_completion_history(ranking);
CREATE INDEX IF NOT EXISTS idx_user_completion_history_top_three ON user_completion_history(is_top_three);

-- Index sur les scores des modérateurs
CREATE INDEX IF NOT EXISTS idx_user_completion_moderator_scores_completion ON user_completion_moderator_scores(completion_id);
CREATE INDEX IF NOT EXISTS idx_user_completion_moderator_scores_staker ON user_completion_moderator_scores(staker_wallet);
CREATE INDEX IF NOT EXISTS idx_user_completion_moderator_scores_score ON user_completion_moderator_scores(score);
CREATE INDEX IF NOT EXISTS idx_user_completion_moderator_scores_refused ON user_completion_moderator_scores(is_refused);

-- Index sur les récompenses gagnées
CREATE INDEX IF NOT EXISTS idx_user_earned_rewards_wallet ON user_earned_rewards(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_earned_rewards_campaign ON user_earned_rewards(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_earned_rewards_completion ON user_earned_rewards(completion_id);
CREATE INDEX IF NOT EXISTS idx_user_earned_rewards_source ON user_earned_rewards(reward_source);
CREATE INDEX IF NOT EXISTS idx_user_earned_rewards_type ON user_earned_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_earned_rewards_tier ON user_earned_rewards(reward_tier);
CREATE INDEX IF NOT EXISTS idx_user_earned_rewards_status ON user_earned_rewards(claim_status);
CREATE INDEX IF NOT EXISTS idx_user_earned_rewards_earned ON user_earned_rewards(earned_at);

-- Index sur les achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_wallet ON user_achievements(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_rarity ON user_achievements(achievement_rarity);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON user_achievements(earned_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_displayed ON user_achievements(is_displayed);

-- Index sur la progression des niveaux
CREATE INDEX IF NOT EXISTS idx_user_level_progression_wallet ON user_level_progression(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_level_progression_level ON user_level_progression(new_level);
CREATE INDEX IF NOT EXISTS idx_user_level_progression_date ON user_level_progression(level_up_date);

-- Index sur les activités récentes
CREATE INDEX IF NOT EXISTS idx_user_recent_activities_wallet ON user_recent_activities(user_wallet);
CREATE INDEX IF NOT EXISTS idx_user_recent_activities_type ON user_recent_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_recent_activities_campaign ON user_recent_activities(related_campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_recent_activities_completion ON user_recent_activities(related_completion_id);
CREATE INDEX IF NOT EXISTS idx_user_recent_activities_date ON user_recent_activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_user_recent_activities_important ON user_recent_activities(is_important);

-- =====================================================
-- 10D. TRIGGERS POUR TOUTES LES NOUVELLES TABLES
-- =====================================================

-- Triggers pour les tables d'identité et rôles
DROP TRIGGER IF EXISTS update_kyc_verifications_updated_at ON kyc_verifications;
CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables d'organisations
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agencies_updated_at ON agencies;
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agency_clients_updated_at ON agency_clients;
CREATE TRIGGER update_agency_clients_updated_at BEFORE UPDATE ON agency_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_pricing_configs_updated_at ON campaign_pricing_configs;
CREATE TRIGGER update_campaign_pricing_configs_updated_at BEFORE UPDATE ON campaign_pricing_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables de récompenses
DROP TRIGGER IF EXISTS update_digital_access_deliveries_updated_at ON digital_access_deliveries;
CREATE TRIGGER update_digital_access_deliveries_updated_at BEFORE UPDATE ON digital_access_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_physical_access_deliveries_updated_at ON physical_access_deliveries;
CREATE TRIGGER update_physical_access_deliveries_updated_at BEFORE UPDATE ON physical_access_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reward_fulfillment_jobs_updated_at ON reward_fulfillment_jobs;
CREATE TRIGGER update_reward_fulfillment_jobs_updated_at BEFORE UPDATE ON reward_fulfillment_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_completion_nft_assignments_updated_at ON completion_nft_assignments;
CREATE TRIGGER update_completion_nft_assignments_updated_at BEFORE UPDATE ON completion_nft_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reward_eligibility_rules_updated_at ON reward_eligibility_rules;
CREATE TRIGGER update_reward_eligibility_rules_updated_at BEFORE UPDATE ON reward_eligibility_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables de contenu
DROP TRIGGER IF EXISTS update_completion_content_metadata_updated_at ON completion_content_metadata;
CREATE TRIGGER update_completion_content_metadata_updated_at BEFORE UPDATE ON completion_content_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables de staking
DROP TRIGGER IF EXISTS update_staking_configuration_updated_at ON staking_configuration;
CREATE TRIGGER update_staking_configuration_updated_at BEFORE UPDATE ON staking_configuration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables de paiements
DROP TRIGGER IF EXISTS update_payment_webhook_events_updated_at ON payment_webhook_events;
CREATE TRIGGER update_payment_webhook_events_updated_at BEFORE UPDATE ON payment_webhook_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_refunds_updated_at ON payment_refunds;
CREATE TRIGGER update_payment_refunds_updated_at BEFORE UPDATE ON payment_refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables blockchain
DROP TRIGGER IF EXISTS update_campaign_reward_networks_updated_at ON campaign_reward_networks;
CREATE TRIGGER update_campaign_reward_networks_updated_at BEFORE UPDATE ON campaign_reward_networks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blockchain_transaction_queue_updated_at ON blockchain_transaction_queue;
CREATE TRIGGER update_blockchain_transaction_queue_updated_at BEFORE UPDATE ON blockchain_transaction_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables d'analytics
DROP TRIGGER IF EXISTS update_roi_snapshots_updated_at ON roi_snapshots;
CREATE TRIGGER update_roi_snapshots_updated_at BEFORE UPDATE ON roi_snapshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rate_limits_updated_at ON rate_limits;
CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ip_reputation_updated_at ON ip_reputation;
CREATE TRIGGER update_ip_reputation_updated_at BEFORE UPDATE ON ip_reputation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables de notifications
DROP TRIGGER IF EXISTS update_user_notification_channels_updated_at ON user_notification_channels;
CREATE TRIGGER update_user_notification_channels_updated_at BEFORE UPDATE ON user_notification_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_template_translations_updated_at ON notification_template_translations;
CREATE TRIGGER update_notification_template_translations_updated_at BEFORE UPDATE ON notification_template_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers pour les tables d'internationalisation
DROP TRIGGER IF EXISTS update_campaign_translations_updated_at ON campaign_translations;
CREATE TRIGGER update_campaign_translations_updated_at BEFORE UPDATE ON campaign_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_consents_updated_at ON user_consents;
CREATE TRIGGER update_user_consents_updated_at BEFORE UPDATE ON user_consents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_data_retention_policies_updated_at ON data_retention_policies;
CREATE TRIGGER update_data_retention_policies_updated_at BEFORE UPDATE ON data_retention_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10E. TRIGGERS POUR LES NOUVELLES TABLES MY WIN
-- =====================================================

-- Triggers pour les tables My Win avec updated_at
DROP TRIGGER IF EXISTS update_user_dashboard_stats_updated_at ON user_dashboard_stats;
CREATE TRIGGER update_user_dashboard_stats_updated_at BEFORE UPDATE ON user_dashboard_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_moderation_history_updated_at ON user_moderation_history;
CREATE TRIGGER update_user_moderation_history_updated_at BEFORE UPDATE ON user_moderation_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_completion_history_updated_at ON user_completion_history;
CREATE TRIGGER update_user_completion_history_updated_at BEFORE UPDATE ON user_completion_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_earned_rewards_updated_at ON user_earned_rewards;
CREATE TRIGGER update_user_earned_rewards_updated_at BEFORE UPDATE ON user_earned_rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- =====================================================
-- 11. HYBRID MODERATION (50/50 votes + stake)
-- =====================================================

-- 11A) Colonnes pour les totaux de stake par camp + scores hybrides dans moderation_progress
DO $$
BEGIN
    -- Ajout des colonnes avec gestion d'erreurs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_progress' AND column_name = 'stake_yes_total') THEN
        ALTER TABLE moderation_progress ADD COLUMN stake_yes_total DECIMAL(20,8) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_progress' AND column_name = 'stake_no_total') THEN
        ALTER TABLE moderation_progress ADD COLUMN stake_no_total DECIMAL(20,8) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_progress' AND column_name = 'score_yes_hybrid') THEN
        ALTER TABLE moderation_progress ADD COLUMN score_yes_hybrid NUMERIC(18,16) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_progress' AND column_name = 'score_no_hybrid') THEN
        ALTER TABLE moderation_progress ADD COLUMN score_no_hybrid NUMERIC(18,16) DEFAULT 0;
    END IF;
END $$;

-- 11B) Enum pour l'auto resolve policy et colonne associée
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auto_resolve_policy') THEN
        CREATE TYPE auto_resolve_policy AS ENUM ('escalate', 'extend', 'auto_reject', 'auto_accept');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'moderation_progress' AND column_name = 'resolve_policy') THEN
        ALTER TABLE moderation_progress ADD COLUMN resolve_policy auto_resolve_policy DEFAULT 'escalate';
    END IF;
END $$;

-- 11C) Index pour accélérer les agrégations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_moderation_votes_campaign') THEN
        CREATE INDEX idx_moderation_votes_campaign ON moderation_votes(campaign_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_moderation_votes_campaign_decision') THEN
        CREATE INDEX idx_moderation_votes_campaign_decision ON moderation_votes(campaign_id, vote_decision);
    END IF;
END $$;

-- 11D) Vue d'agrégation: votes, stakes par camp et scores hybrides 50/50
CREATE OR REPLACE VIEW moderation_vote_aggregates AS
SELECT
  mv.campaign_id,
  COUNT(*) FILTER (WHERE mv.vote_decision = 'approve')::INTEGER AS valid_votes,
  COUNT(*) FILTER (WHERE mv.vote_decision = 'reject')::INTEGER AS refuse_votes,
  COUNT(*)::INTEGER AS total_votes,
  COALESCE(SUM(mv.staked_amount) FILTER (WHERE mv.vote_decision = 'approve'), 0)::DECIMAL(20,8) AS stake_yes_total,
  COALESCE(SUM(mv.staked_amount) FILTER (WHERE mv.vote_decision = 'reject'), 0)::DECIMAL(20,8) AS stake_no_total,
  -- Poids démocratiques
  CASE WHEN COUNT(*) > 0
    THEN (COUNT(*) FILTER (WHERE mv.vote_decision = 'approve'))::NUMERIC / COUNT(*)::NUMERIC
    ELSE 0 END AS dem_yes,
  CASE WHEN COUNT(*) > 0
    THEN (COUNT(*) FILTER (WHERE mv.vote_decision = 'reject'))::NUMERIC / COUNT(*)::NUMERIC
    ELSE 0 END AS dem_no,
  -- Poids ploutocratiques
  CASE WHEN COALESCE(SUM(mv.staked_amount),0) > 0
       THEN COALESCE(SUM(mv.staked_amount) FILTER (WHERE mv.vote_decision = 'approve'),0)::NUMERIC / SUM(mv.staked_amount)::NUMERIC
       ELSE 0 END AS pluto_yes,
  CASE WHEN COALESCE(SUM(mv.staked_amount),0) > 0
       THEN COALESCE(SUM(mv.staked_amount) FILTER (WHERE mv.vote_decision = 'reject'),0)::NUMERIC / SUM(mv.staked_amount)::NUMERIC
       ELSE 0 END AS pluto_no,
  -- Scores hybrides 50/50
  0.5 * (CASE WHEN COUNT(*) > 0
              THEN (COUNT(*) FILTER (WHERE mv.vote_decision = 'approve'))::NUMERIC / COUNT(*)::NUMERIC
              ELSE 0 END)
  + 0.5 * (CASE WHEN COALESCE(SUM(mv.staked_amount),0) > 0
                THEN COALESCE(SUM(mv.staked_amount) FILTER (WHERE mv.vote_decision = 'approve'),0)::NUMERIC / SUM(mv.staked_amount)::NUMERIC
                ELSE 0 END) AS score_yes_hybrid,
  0.5 * (CASE WHEN COUNT(*) > 0
              THEN (COUNT(*) FILTER (WHERE mv.vote_decision = 'reject'))::NUMERIC / COUNT(*)::NUMERIC
              ELSE 0 END)
  + 0.5 * (CASE WHEN COALESCE(SUM(mv.staked_amount),0) > 0
                THEN COALESCE(SUM(mv.staked_amount) FILTER (WHERE mv.vote_decision = 'reject'),0)::NUMERIC / SUM(mv.staked_amount)::NUMERIC
                ELSE 0 END) AS score_no_hybrid
FROM moderation_votes mv
GROUP BY mv.campaign_id;

-- 11E) Fonction de sync pour pousser l'agrégat dans moderation_progress
CREATE OR REPLACE FUNCTION sync_progress_hybrid_fields(p_campaign_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE moderation_progress mp
  SET
    valid_votes = COALESCE(mva.valid_votes, mp.valid_votes),
    refuse_votes = COALESCE(mva.refuse_votes, mp.refuse_votes),
    total_votes = COALESCE(mva.total_votes, mp.total_votes),
    stake_yes_total = COALESCE(mva.stake_yes_total, 0),
    stake_no_total = COALESCE(mva.stake_no_total, 0),
    score_yes_hybrid = COALESCE(mva.score_yes_hybrid, 0),
    score_no_hybrid = COALESCE(mva.score_no_hybrid, 0),
    updated_at = NOW()
  FROM moderation_vote_aggregates mva
  WHERE mp.campaign_id = p_campaign_id
    AND mva.campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- 11F) Trigger pour sync automatique à chaque changement de vote
DROP TRIGGER IF EXISTS trg_moderation_vote_change ON moderation_votes;

CREATE OR REPLACE FUNCTION on_moderation_vote_change()
RETURNS TRIGGER AS $$
DECLARE
  cid TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    cid := NEW.campaign_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    cid := NEW.campaign_id;
  ELSIF (TG_OP = 'DELETE') THEN
    cid := OLD.campaign_id;
  END IF;

  PERFORM sync_progress_hybrid_fields(cid);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_moderation_vote_change
AFTER INSERT OR UPDATE OR DELETE ON moderation_votes
FOR EACH ROW EXECUTE FUNCTION on_moderation_vote_change();

-- 11G) Backfill initial pour toutes les campagnes existantes
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT DISTINCT campaign_id FROM moderation_votes LOOP
    PERFORM sync_progress_hybrid_fields(rec.campaign_id);
  END LOOP;
  
  -- Mettre à jour aussi les campagnes sans votes
  UPDATE moderation_progress mp
  SET 
    stake_yes_total = 0,
    stake_no_total = 0,
    score_yes_hybrid = 0,
    score_no_hybrid = 0,
    updated_at = NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM moderation_votes mv WHERE mv.campaign_id = mp.campaign_id
  );
END $$;

-- =====================================================
-- 12. FONCTIONS MY WIN - AGRÉGATIONS ET MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour les stats du dashboard d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_dashboard_stats(p_user_wallet TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_dashboard_stats (
    user_wallet,
    total_creations,
    total_completions,
    total_moderations,
    total_winc_earned,
    total_winc_lost,
    total_xp_earned,
    current_level,
    last_updated
  )
  SELECT 
    p_user_wallet,
    COALESCE(creator_stats.creations, 0),
    COALESCE(completer_stats.completions, 0),
    COALESCE(moderator_stats.moderations, 0),
    COALESCE(winc_stats.total_earned, 0),
    COALESCE(winc_stats.total_lost, 0),
    COALESCE(xp_stats.total_xp, 0),
    COALESCE(xp_stats.current_level, 1),
    NOW()
  FROM (SELECT p_user_wallet as wallet_address) base
  LEFT JOIN (
    SELECT ci.wallet_address as creator_wallet, COUNT(*) as creations
    FROM campaigns c
    JOIN creator_infos ci ON c.id = ci.campaign_id
    WHERE ci.wallet_address = p_user_wallet
    GROUP BY ci.wallet_address
  ) creator_stats ON base.wallet_address = creator_stats.creator_wallet
  LEFT JOIN (
    SELECT completer_wallet, COUNT(*) as completions
    FROM completions
    WHERE completer_wallet = p_user_wallet
    GROUP BY completer_wallet
  ) completer_stats ON base.wallet_address = completer_stats.completer_wallet
  LEFT JOIN (
    SELECT moderator_wallet, COUNT(*) as moderations
    FROM moderation_votes
    WHERE moderator_wallet = p_user_wallet
    GROUP BY moderator_wallet
  ) moderator_stats ON base.wallet_address = moderator_stats.moderator_wallet
  LEFT JOIN (
    SELECT 
      user_wallet,
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
      SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_lost
    FROM user_earned_rewards
    WHERE user_wallet = p_user_wallet AND reward_type = 'winc'
    GROUP BY user_wallet
  ) winc_stats ON base.wallet_address = winc_stats.user_wallet
  LEFT JOIN (
    SELECT user_wallet, total_xp, current_level
    FROM user_xp_progression
    WHERE user_wallet = p_user_wallet
  ) xp_stats ON base.wallet_address = xp_stats.user_wallet
  ON CONFLICT (user_wallet) 
  DO UPDATE SET
    total_creations = EXCLUDED.total_creations,
    total_completions = EXCLUDED.total_completions,
    total_moderations = EXCLUDED.total_moderations,
    total_winc_earned = EXCLUDED.total_winc_earned,
    total_winc_lost = EXCLUDED.total_winc_lost,
    total_xp_earned = EXCLUDED.total_xp_earned,
    current_level = EXCLUDED.current_level,
    last_updated = EXCLUDED.last_updated,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un record d'activité récente
CREATE OR REPLACE FUNCTION create_user_activity(
  p_user_wallet TEXT,
  p_activity_type TEXT,
  p_activity_title TEXT,
  p_activity_description TEXT DEFAULT NULL,
  p_campaign_id TEXT DEFAULT NULL,
  p_completion_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_is_important BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_recent_activities (
    user_wallet,
    activity_type,
    activity_title,
    activity_description,
    related_campaign_id,
    related_completion_id,
    metadata,
    is_important
  ) VALUES (
    p_user_wallet,
    p_activity_type,
    p_activity_title,
    p_activity_description,
    p_campaign_id,
    p_completion_id,
    p_metadata,
    p_is_important
  );
  
  -- Nettoyer les anciennes activités (garder seulement les 100 plus récentes)
  DELETE FROM user_recent_activities
  WHERE user_wallet = p_user_wallet
  AND id NOT IN (
    SELECT id FROM user_recent_activities
    WHERE user_wallet = p_user_wallet
    ORDER BY activity_date DESC
    LIMIT 100
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour attribuer un achievement à un utilisateur
CREATE OR REPLACE FUNCTION award_user_achievement(
  p_user_wallet TEXT,
  p_achievement_type TEXT,
  p_achievement_name TEXT,
  p_achievement_description TEXT DEFAULT NULL,
  p_achievement_icon TEXT DEFAULT NULL,
  p_achievement_rarity TEXT DEFAULT 'common'
)
RETURNS BOOLEAN AS $$
DECLARE
  achievement_exists BOOLEAN;
BEGIN
  -- Vérifier si l'achievement existe déjà
  SELECT EXISTS(
    SELECT 1 FROM user_achievements
    WHERE user_wallet = p_user_wallet AND achievement_type = p_achievement_type
  ) INTO achievement_exists;
  
  -- Si pas encore obtenu, l'attribuer
  IF NOT achievement_exists THEN
    INSERT INTO user_achievements (
      user_wallet,
      achievement_type,
      achievement_name,
      achievement_description,
      achievement_icon,
      achievement_rarity
    ) VALUES (
      p_user_wallet,
      p_achievement_type,
      p_achievement_name,
      p_achievement_description,
      p_achievement_icon,
      p_achievement_rarity
    );
    
    -- Créer une activité pour l'achievement
    PERFORM create_user_activity(
      p_user_wallet,
      'achievement_unlocked',
      'Achievement Unlocked: ' || p_achievement_name,
      p_achievement_description,
      NULL,
      NULL,
      jsonb_build_object('achievement_type', p_achievement_type, 'rarity', p_achievement_rarity),
      TRUE
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Triggers automatiques pour mettre à jour les stats dashboard

-- Trigger sur création de campagne
CREATE OR REPLACE FUNCTION on_campaign_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les stats du créateur
  PERFORM update_user_dashboard_stats(
    (SELECT ci.wallet_address FROM creator_infos ci WHERE ci.campaign_id = NEW.id)
  );
  
  -- Créer une activité
  PERFORM create_user_activity(
    (SELECT ci.wallet_address FROM creator_infos ci WHERE ci.campaign_id = NEW.id),
    'campaign_created',
    'Campaign Created: ' || NEW.title,
    'New campaign created and ready for moderation',
    NEW.id
  );
  
  -- Vérifier achievements
  PERFORM award_user_achievement(
    (SELECT ci.wallet_address FROM creator_infos ci WHERE ci.campaign_id = NEW.id),
    'first_creation',
    'First Creator',
    'Created your first campaign on Winstory'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_campaign_created ON campaigns;
CREATE TRIGGER trg_campaign_created
AFTER INSERT ON campaigns
FOR EACH ROW EXECUTE FUNCTION on_campaign_created();

-- Trigger sur création de completion
CREATE OR REPLACE FUNCTION on_completion_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les stats du completer
  PERFORM update_user_dashboard_stats(NEW.completer_wallet);
  
  -- Créer une activité
  PERFORM create_user_activity(
    NEW.completer_wallet,
    'completion_submitted',
    'Completion Submitted: ' || NEW.title,
    'New completion submitted and awaiting moderation',
    NEW.original_campaign_id,
    NEW.id
  );
  
  -- Vérifier achievements
  PERFORM award_user_achievement(
    NEW.completer_wallet,
    'first_completion',
    'First Completer',
    'Completed your first campaign on Winstory'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_completion_created ON completions;
CREATE TRIGGER trg_completion_created
AFTER INSERT ON completions
FOR EACH ROW EXECUTE FUNCTION on_completion_created();

-- Trigger sur vote de modération
CREATE OR REPLACE FUNCTION on_moderation_vote_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les stats du modérateur
  PERFORM update_user_dashboard_stats(NEW.moderator_wallet);
  
  -- Créer une activité
  PERFORM create_user_activity(
    NEW.moderator_wallet,
    'moderation_voted',
    'Moderation Vote Cast',
    'Voted ' || NEW.vote_decision || ' on campaign moderation',
    NEW.campaign_id,
    NEW.completion_id
  );
  
  -- Vérifier achievements
  PERFORM award_user_achievement(
    NEW.moderator_wallet,
    'first_moderation',
    'First Moderator',
    'Cast your first moderation vote on Winstory'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_moderation_vote_created ON moderation_votes;
CREATE TRIGGER trg_moderation_vote_created
AFTER INSERT ON moderation_votes
FOR EACH ROW EXECUTE FUNCTION on_moderation_vote_created();