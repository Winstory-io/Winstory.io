-- =====================================================
-- SCHEMA SUPABASE COMPLET POUR WINSTORY.IO
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

-- Nouveaux enums basés sur vos réponses
-- États de campagne plus détaillés
CREATE TYPE campaign_status AS ENUM (
  'PENDING_MODERATION', -- En attente de modération (pas encore ouverte)
  'IN_REVIEW', -- En cours de modération
  'PENDING_WINSTORY_VIDEO', -- En attente de création vidéo par Winstory (24h)
  'APPROVED', -- Approuvé
  'REJECTED', -- Rejeté
  'COMPLETED' -- Terminé
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
-- 3. TABLES DE CREATION (CORE)
-- =====================================================

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

-- Configuration des processeurs de paiement
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
CREATE TABLE moderator_completion_scores (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  moderator_wallet TEXT NOT NULL,
  completion_id TEXT,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, moderator_wallet, score)
);

-- Votes de modération
CREATE TABLE moderation_votes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  moderator_wallet TEXT NOT NULL,
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
-- 6. TABLES DE COMPLETION (AMÉLIORÉES)
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
);

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
CREATE TABLE user_performance_tracking (
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
-- 9. INDEX POUR PERFORMANCE
-- =====================================================

-- Index sur les campagnes
CREATE INDEX idx_campaigns_creator_type ON campaigns(creator_type);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(type);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);

-- Index sur les créateurs
CREATE INDEX idx_creator_infos_wallet ON creator_infos(wallet_address);
CREATE INDEX idx_creator_infos_company ON creator_infos(company_name);
CREATE INDEX idx_creator_infos_agency ON creator_infos(agency_name);

-- Index sur les récompenses
CREATE INDEX idx_digital_access_campaign ON digital_access_rewards(campaign_id);
CREATE INDEX idx_physical_access_campaign ON physical_access_rewards(campaign_id);
CREATE INDEX idx_token_rewards_campaign ON token_rewards(campaign_id);
CREATE INDEX idx_item_rewards_campaign ON item_rewards(campaign_id);

-- Index sur la modération
CREATE INDEX idx_moderation_progress_campaign ON moderation_progress(campaign_id);
CREATE INDEX idx_moderation_sessions_campaign ON moderation_sessions(campaign_id);
CREATE INDEX idx_moderation_sessions_moderator ON moderation_sessions(moderator_wallet);
CREATE INDEX idx_moderator_scores_campaign ON moderator_completion_scores(campaign_id);
CREATE INDEX idx_moderator_scores_moderator ON moderator_completion_scores(moderator_wallet);
CREATE INDEX idx_moderation_votes_campaign ON moderation_votes(campaign_id);
CREATE INDEX idx_moderation_votes_completion ON moderation_votes(completion_id);

-- Index sur les complétions
CREATE INDEX idx_completions_original_campaign ON completions(original_campaign_id);
CREATE INDEX idx_completions_completer ON completions(completer_wallet);
CREATE INDEX idx_completions_status ON completions(status);
CREATE INDEX idx_completions_ranking ON completions(ranking);
CREATE INDEX idx_completions_validation_status ON completions(validation_status);
CREATE INDEX idx_completions_validation_conditions ON completions(validation_conditions_met);

-- Index sur la validation automatique
CREATE INDEX idx_completion_validation_conditions_completion ON completion_validation_conditions(completion_id);
CREATE INDEX idx_completion_validation_conditions_campaign ON completion_validation_conditions(campaign_id);
CREATE INDEX idx_completion_validation_conditions_all_met ON completion_validation_conditions(all_conditions_met);

-- Index sur le suivi automatique
CREATE INDEX idx_automatic_validation_tracking_campaign ON automatic_validation_tracking(campaign_id);
CREATE INDEX idx_automatic_validation_tracking_completion ON automatic_validation_tracking(completion_id);
CREATE INDEX idx_automatic_validation_tracking_all_met ON automatic_validation_tracking(all_conditions_met);

-- Index sur les récompenses distribuées
CREATE INDEX idx_reward_distributions_campaign ON reward_distributions(campaign_id);
CREATE INDEX idx_reward_distributions_completion ON reward_distributions(completion_id);
CREATE INDEX idx_reward_distributions_recipient ON reward_distributions(recipient_wallet);
CREATE INDEX idx_reward_distributions_status ON reward_distributions(status);

-- =====================================================
-- 9B. INDEX POUR LES NOUVELLES TABLES
-- =====================================================

-- Index sur les paiements MINT
CREATE INDEX idx_mint_payments_campaign ON mint_payments(campaign_id);
CREATE INDEX idx_mint_payments_payer ON mint_payments(payer_wallet);
CREATE INDEX idx_mint_payments_status ON mint_payments(status);
CREATE INDEX idx_mint_payments_method ON mint_payments(payment_method);

-- Index sur les processeurs de paiement
CREATE INDEX idx_payment_processors_name ON payment_processors(processor_name);
CREATE INDEX idx_payment_processors_method ON payment_processors(payment_method);
CREATE INDEX idx_payment_processors_active ON payment_processors(is_active);
CREATE INDEX idx_payment_processors_currencies ON payment_processors USING GIN(supported_currencies);
CREATE INDEX idx_payment_processors_countries ON payment_processors USING GIN(supported_countries);

-- Index sur les récompenses WINC
CREATE INDEX idx_winc_rewards_user ON winc_rewards(user_wallet);
CREATE INDEX idx_winc_rewards_campaign ON winc_rewards(campaign_id);
CREATE INDEX idx_winc_rewards_type ON winc_rewards(reward_type);

-- Index sur la progression XP
CREATE INDEX idx_user_xp_progression_wallet ON user_xp_progression(user_wallet);
CREATE INDEX idx_user_xp_progression_level ON user_xp_progression(current_level);

-- Index sur les wallets connectés
CREATE INDEX idx_connected_wallets_user ON connected_wallets(user_id);
CREATE INDEX idx_connected_wallets_address ON connected_wallets(wallet_address);
CREATE INDEX idx_connected_wallets_primary ON connected_wallets(is_primary);

-- Index sur les sessions wallet
CREATE INDEX idx_wallet_sessions_address ON wallet_sessions(wallet_address);
CREATE INDEX idx_wallet_sessions_token ON wallet_sessions(session_token);
CREATE INDEX idx_wallet_sessions_expires ON wallet_sessions(expires_at);

-- Index sur les liens de completion
CREATE INDEX idx_campaign_completion_links_original ON campaign_completion_links(original_campaign_id);
CREATE INDEX idx_campaign_completion_links_completion ON campaign_completion_links(completion_campaign_id);
CREATE INDEX idx_campaign_completion_links_type ON campaign_completion_links(link_type);

-- Index sur les deadlines
CREATE INDEX idx_completion_deadlines_campaign ON completion_deadlines(campaign_id);
CREATE INDEX idx_completion_deadlines_type ON completion_deadlines(deadline_type);
CREATE INDEX idx_completion_deadlines_date ON completion_deadlines(deadline_date);

-- Index sur les pools de staking
CREATE INDEX idx_staking_pools_campaign ON staking_pools(campaign_id);
CREATE INDEX idx_staking_pools_total ON staking_pools(total_staked);

-- Index sur les stakes individuels
CREATE INDEX idx_moderator_stakes_campaign ON moderator_stakes(campaign_id);
CREATE INDEX idx_moderator_stakes_wallet ON moderator_stakes(moderator_wallet);
CREATE INDEX idx_moderator_stakes_type ON moderator_stakes(stake_type);

-- Index sur les analytics
CREATE INDEX idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_type ON campaign_analytics(metric_type);
CREATE INDEX idx_campaign_analytics_period ON campaign_analytics(metric_period);

-- Index sur le suivi des performances
CREATE INDEX idx_user_performance_tracking_wallet ON user_performance_tracking(user_wallet);
CREATE INDEX idx_user_performance_tracking_campaign ON user_performance_tracking(campaign_id);
CREATE INDEX idx_user_performance_tracking_activity ON user_performance_tracking(activity_type);

-- Index sur les workflows
CREATE INDEX idx_workflow_states_campaign ON workflow_states(campaign_id);
CREATE INDEX idx_workflow_states_current ON workflow_states(current_state);

-- Index sur les notifications
CREATE INDEX idx_system_notifications_wallet ON system_notifications(user_wallet);
CREATE INDEX idx_system_notifications_campaign ON system_notifications(campaign_id);
CREATE INDEX idx_system_notifications_type ON system_notifications(notification_type);
CREATE INDEX idx_system_notifications_priority ON system_notifications(priority);
CREATE INDEX idx_system_notifications_read ON system_notifications(is_read);

-- Index sur les réseaux blockchain
CREATE INDEX idx_blockchain_networks_name ON blockchain_networks(network_name);
CREATE INDEX idx_blockchain_networks_chain_id ON blockchain_networks(chain_id);
CREATE INDEX idx_blockchain_networks_active ON blockchain_networks(is_active);

-- Index sur les contrats déployés
CREATE INDEX idx_deployed_contracts_address ON deployed_contracts(contract_address);
CREATE INDEX idx_deployed_contracts_network ON deployed_contracts(network);
CREATE INDEX idx_deployed_contracts_type ON deployed_contracts(contract_type);
CREATE INDEX idx_deployed_contracts_verified ON deployed_contracts(is_verified);

-- =====================================================
-- 9C. INDEX POUR LES NOUVELLES TABLES DE DÉTECTION ET SUPERVISION
-- =====================================================

-- Index sur la détection de comportements suspects
CREATE INDEX idx_suspicious_behavior_campaign ON suspicious_behavior_detection(campaign_id);
CREATE INDEX idx_suspicious_behavior_type ON suspicious_behavior_detection(detection_type);
CREATE INDEX idx_suspicious_behavior_score ON suspicious_behavior_detection(suspicious_score);
CREATE INDEX idx_suspicious_behavior_risk ON suspicious_behavior_detection(risk_level);
CREATE INDEX idx_suspicious_behavior_intervention ON suspicious_behavior_detection(requires_winstory_intervention);

-- Index sur les interventions Winstory
CREATE INDEX idx_winstory_interventions_campaign ON winstory_interventions(campaign_id);
CREATE INDEX idx_winstory_interventions_type ON winstory_interventions(intervention_type);
CREATE INDEX idx_winstory_interventions_status ON winstory_interventions(intervention_status);
CREATE INDEX idx_winstory_interventions_moderator ON winstory_interventions(assigned_moderator);

-- Index sur l'audit trail de modération
CREATE INDEX idx_moderation_audit_campaign ON moderation_audit_trail(campaign_id);
CREATE INDEX idx_moderation_audit_actor ON moderation_audit_trail(actor_wallet);
CREATE INDEX idx_moderation_audit_type ON moderation_audit_trail(action_type);
CREATE INDEX idx_moderation_audit_timestamp ON moderation_audit_trail(timestamp);
CREATE INDEX idx_moderation_audit_level ON moderation_audit_trail(actor_moderation_level);

-- Index sur les niveaux de modération
CREATE INDEX idx_moderation_progress_level ON moderation_progress(moderation_level);
CREATE INDEX idx_moderation_progress_validation ON moderation_progress(blockchain_validation_type);
CREATE INDEX idx_moderation_progress_super ON moderation_progress(super_moderator_override);
CREATE INDEX idx_moderation_progress_winstory ON moderation_progress(winstory_intervention);

-- Index sur les sessions de modération
CREATE INDEX idx_moderation_sessions_level ON moderation_sessions(moderation_level);
CREATE INDEX idx_moderation_sessions_super ON moderation_sessions(is_super_moderator);
CREATE INDEX idx_moderation_sessions_override ON moderation_sessions(can_override);

-- Index sur les votes de modération
CREATE INDEX idx_moderation_votes_level ON moderation_votes(moderation_level);
CREATE INDEX idx_moderation_votes_validation ON moderation_votes(blockchain_validation_type);
CREATE INDEX idx_moderation_votes_super ON moderation_votes(is_super_moderator_vote);
CREATE INDEX idx_moderation_votes_override ON moderation_votes(can_override_others);

-- Index sur les récompenses WINC avec ranking
CREATE INDEX idx_winc_rewards_completion ON winc_rewards(completion_id);
CREATE INDEX idx_winc_rewards_ranking ON winc_rewards(ranking_position);
CREATE INDEX idx_winc_rewards_tier ON winc_rewards(ranking_tier);
CREATE INDEX idx_winc_rewards_rate ON winc_rewards(completion_rate);

-- Index sur les deadlines avec price pool
CREATE INDEX idx_completion_deadlines_price_pool ON completion_deadlines(price_pool_amount);
CREATE INDEX idx_completion_deadlines_b2c ON completion_deadlines(b2c_deadline_weeks);
CREATE INDEX idx_completion_deadlines_individual ON completion_deadlines(individual_deadline_weeks);

-- Index sur les analytics ROI et détection
CREATE INDEX idx_campaign_analytics_roi ON campaign_analytics((roi_data->>'roi_percentage'));
CREATE INDEX idx_campaign_analytics_suspicious ON campaign_analytics((suspicious_patterns));
CREATE INDEX idx_campaign_analytics_behavior ON campaign_analytics((moderation_behavior_analysis->>'risk_score'));

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

-- Vue des campagnes avec toutes les informations
CREATE VIEW campaigns_full AS
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
  mp.stakers_required,
  mp.stakers,
  mp.staked_amount,
  mp.mint_price,
  mp.valid_votes,
  mp.refuse_votes,
  mp.total_votes,
  mp.average_score
FROM campaigns c
LEFT JOIN creator_infos ci ON c.id = ci.campaign_id
LEFT JOIN campaign_contents cc ON c.id = cc.campaign_id
LEFT JOIN campaign_metadata cm ON c.id = cm.campaign_id
LEFT JOIN campaign_pricing_configs cpc ON c.id = cpc.campaign_id
LEFT JOIN moderation_progress mp ON c.id = mp.campaign_id;

-- Vue des récompenses consolidées
CREATE VIEW rewards_summary AS
SELECT 
  c.id as campaign_id,
  c.title as campaign_title,
  c.creator_type,
  'token' as reward_type,
  tr.reward_tier,
  tr.token_name,
  tr.blockchain,
  tr.amount_per_user,
  tr.total_amount
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
  ir.amount_per_user::TEXT as amount_per_user,
  ir.total_amount::TEXT as total_amount
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
LEFT JOIN moderator_completion_scores mcs ON co.id = mcs.completion_id
GROUP BY co.id, c.title, c.creator_type, cvc.condition_1_stakers_voted, cvc.condition_2_staking_pool_exceeds_unit_value, cvc.condition_3_majority_ratio_met, cvc.all_conditions_met, cvc.stakers_count, cvc.staking_pool_amount, cvc.unit_value, cvc.valid_votes_count, cvc.refuse_votes_count, cvc.majority_ratio, cvc.validation_timestamp;

-- Vue des complétions validées prêtes pour récompenses
CREATE VIEW validated_completions_for_rewards AS
SELECT 
  co.*,
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
LEFT JOIN moderator_completion_scores mcs ON co.id = mcs.completion_id
WHERE cvc.all_conditions_met = TRUE 
  AND co.status = 'approved'
  AND co.validation_status = 'validated'
GROUP BY co.id, c.title, c.creator_type, cvc.validation_timestamp, cvc.stakers_count, cvc.majority_ratio;

-- Vue des complétions rejetées
CREATE VIEW rejected_completions AS
SELECT 
  co.*,
  c.title as campaign_title,
  c.creator_type,
  cvc.rejection_reason,
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
COMMENT ON TABLE moderator_completion_scores IS 'Scores attribués par modérateur (contrainte unique par score)';
COMMENT ON TABLE moderation_votes IS 'Votes détaillés de modération (approve/reject/abstain)';
COMMENT ON TABLE completions IS 'Complétions soumises par la communauté';
COMMENT ON TABLE completion_metrics IS 'Métriques d''engagement des complétions';
COMMENT ON TABLE completion_validation_conditions IS 'Suivi des conditions 3/3 pour chaque complétion';
COMMENT ON TABLE automatic_validation_tracking IS 'Suivi automatique de la validation des conditions 3/3';
COMMENT ON TABLE automatic_distribution_logs IS 'Logs de distribution automatique des récompenses';
COMMENT ON TABLE reward_distributions IS 'Historique des distributions de récompenses';
COMMENT ON TABLE reward_claims IS 'Réclamations manuelles de récompenses';

-- =====================================================
-- 12B. COMMENTAIRES POUR LES NOUVELLES TABLES
-- =====================================================

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
COMMENT ON TABLE user_performance_tracking IS 'Suivi des performances utilisateur par activité';
COMMENT ON TABLE workflow_states IS 'États et transitions de workflow avec données JSON';
COMMENT ON TABLE system_notifications IS 'Notifications système avec priorités et expiration';
COMMENT ON TABLE blockchain_networks IS 'Configuration des réseaux blockchain supportés';
COMMENT ON TABLE deployed_contracts IS 'Smart contracts déployés avec vérification et ABI';
COMMENT ON TABLE payment_processors IS 'Configuration des processeurs de paiement (Stripe, PayPal, etc.) avec frais et pays supportés';

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
-- SCHEMA TERMINÉ - PRÊT POUR SUPABASE
-- ===================================================== 