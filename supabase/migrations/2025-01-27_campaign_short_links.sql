-- ============================================
-- MIGRATION POUR LES LIENS COURTS DE CAMPAGNES
-- ============================================
-- Table pour stocker les liens courts de redirection vers les pages de completion
-- Uniquement pour les campagnes B2C/Agence B2C totalement validées

CREATE TABLE IF NOT EXISTS campaign_short_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  short_code TEXT NOT NULL UNIQUE,
  full_url TEXT NOT NULL,
  creator_wallet TEXT NOT NULL,
  creator_type creator_type NOT NULL CHECK (creator_type IN ('FOR_B2C', 'B2C_AGENCIES')),
  clicks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_short_links_campaign_id ON campaign_short_links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_short_links_short_code ON campaign_short_links(short_code);
CREATE INDEX IF NOT EXISTS idx_short_links_creator_wallet ON campaign_short_links(creator_wallet);

-- Fonction pour générer un code court unique (style bit.ly)
-- Format: 7 caractères alphanumériques (base62)
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  result TEXT := '';
  i INTEGER;
  random_char INTEGER;
BEGIN
  FOR i IN 1..7 LOOP
    random_char := floor(random() * 62)::INTEGER + 1;
    result := result || substr(chars, random_char, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_campaign_short_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_short_links_updated_at
  BEFORE UPDATE ON campaign_short_links
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_short_links_updated_at();

-- ============================================
-- VÉRIFICATION
-- ============================================
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'campaign_short_links'
-- ORDER BY column_name;

