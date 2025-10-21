-- =====================================================
-- FIX: Mise à jour de la table campaign_creation_logs
-- =====================================================
-- Ce script ajoute les colonnes manquantes à la table existante

-- Vérifier si la table existe et ajouter les colonnes manquantes
DO $$ 
BEGIN
    -- Ajouter les colonnes B2C si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'b2c_currency') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN b2c_currency TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'b2c_unit_value_usd') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN b2c_unit_value_usd NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'b2c_net_profit_usd') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN b2c_net_profit_usd NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'b2c_max_completions') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN b2c_max_completions INT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'b2c_is_free_reward') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN b2c_is_free_reward BOOLEAN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'b2c_is_no_reward') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN b2c_is_no_reward BOOLEAN;
    END IF;

    -- Ajouter les colonnes Individual si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'individual_currency') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN individual_currency TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'individual_winc_value') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN individual_winc_value NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'individual_max_completions') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN individual_max_completions INT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'individual_duration_days') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN individual_duration_days INT;
    END IF;

    -- Ajouter les colonnes de base si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'submission_timestamp_iso') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN submission_timestamp_iso TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'submission_timestamp_local') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN submission_timestamp_local TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'campaign_type') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN campaign_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'wallet_address') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN wallet_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'wallet_source') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN wallet_source TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'user_email') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN user_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'company_name') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN company_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'story_title') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN story_title TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'story_guideline') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN story_guideline TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'film_video_id') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN film_video_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'film_file_name') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN film_file_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'film_format') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN film_format TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaign_creation_logs' 
                   AND column_name = 'raw_payload') THEN
        ALTER TABLE public.campaign_creation_logs 
        ADD COLUMN raw_payload JSONB;
    END IF;

    RAISE NOTICE 'Table campaign_creation_logs mise à jour avec succès!';
END $$;

-- Créer les index si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_ccl_created_at ON public.campaign_creation_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_ccl_campaign_type ON public.campaign_creation_logs (campaign_type);
CREATE INDEX IF NOT EXISTS idx_ccl_wallet_address ON public.campaign_creation_logs (wallet_address);

-- Vérifier la structure finale
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaign_creation_logs' 
ORDER BY ordinal_position;
