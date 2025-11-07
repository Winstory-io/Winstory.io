-- ============================================
-- MIGRATION POUR LE TRACKING DES CLICS SUR LES LIENS COURTS
-- ============================================
-- Table pour stocker les statistiques détaillées des clics sur les liens courts

CREATE TABLE IF NOT EXISTS campaign_short_link_clicks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  short_link_id TEXT NOT NULL REFERENCES campaign_short_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informations de géolocalisation
  country_code TEXT,
  country_name TEXT,
  region TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Source de trafic
  referrer TEXT,
  user_agent TEXT,
  
  -- Informations de sécurité
  ip_address TEXT, -- Stocké pour détection d'abus, peut être hashé plus tard
  wallet_address TEXT, -- Wallet connecté lors du clic (si disponible)
  
  -- Métadonnées
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  
  -- Statut (pour filtrer les spams)
  is_valid BOOLEAN DEFAULT true,
  is_spam BOOLEAN DEFAULT false,
  spam_reason TEXT
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_short_link_id ON campaign_short_link_clicks(short_link_id);
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_clicked_at ON campaign_short_link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_ip_address ON campaign_short_link_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_wallet_address ON campaign_short_link_clicks(wallet_address);
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_is_valid ON campaign_short_link_clicks(is_valid);
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_is_spam ON campaign_short_link_clicks(is_spam);

-- Table pour les limites de clics (protection anti-abus)
CREATE TABLE IF NOT EXISTS campaign_short_link_rate_limits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  short_link_id TEXT NOT NULL REFERENCES campaign_short_links(id) ON DELETE CASCADE,
  identifier TEXT NOT NULL, -- IP address ou wallet address
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'wallet')),
  click_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
  is_blocked BOOLEAN DEFAULT false,
  block_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_rate_limits_short_link_id ON campaign_short_link_rate_limits(short_link_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON campaign_short_link_rate_limits(identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON campaign_short_link_rate_limits(window_start, window_end);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rate_limits_updated_at
  BEFORE UPDATE ON campaign_short_link_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limits_updated_at();

-- Fonction pour nettoyer les anciennes entrées de rate limiting (plus de 24h)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM campaign_short_link_rate_limits
  WHERE window_end < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VÉRIFICATION
-- ============================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('campaign_short_link_clicks', 'campaign_short_link_rate_limits')
-- ORDER BY table_name, column_name;

