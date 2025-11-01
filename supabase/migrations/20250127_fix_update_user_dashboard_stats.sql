-- =====================================================
-- FIX update_user_dashboard_stats() - Prevent duplicate rows
-- =====================================================
-- Problem: The function generates multiple rows when multiple LEFT JOINs
-- return results, causing "ON CONFLICT DO UPDATE cannot affect row a second time"
--
-- Solution: Restructure the query to ensure it always returns exactly one row
-- by aggregating all subqueries into a single row

CREATE OR REPLACE FUNCTION update_user_dashboard_stats(p_user_wallet TEXT)
RETURNS VOID AS $$
DECLARE
  v_total_creations INTEGER;
  v_total_completions INTEGER;
  v_total_moderations INTEGER;
  v_total_winc_earned DECIMAL(20,8);
  v_total_winc_lost DECIMAL(20,8);
  v_total_xp_earned INTEGER;
  v_current_level INTEGER;
BEGIN
  -- Calculate all stats first using separate queries to avoid cartesian product
  SELECT COALESCE(COUNT(*), 0) INTO v_total_creations
  FROM campaigns c
  JOIN creator_infos ci ON c.id = ci.campaign_id
  WHERE ci.wallet_address = p_user_wallet;

  SELECT COALESCE(COUNT(*), 0) INTO v_total_completions
  FROM completions
  WHERE completer_wallet = p_user_wallet;

  SELECT COALESCE(COUNT(*), 0) INTO v_total_moderations
  FROM moderation_votes
  WHERE moderator_wallet = p_user_wallet;

  SELECT 
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)
  INTO v_total_winc_earned, v_total_winc_lost
  FROM user_earned_rewards
  WHERE user_wallet = p_user_wallet AND reward_type = 'winc';

  SELECT 
    COALESCE(total_xp, 0),
    COALESCE(current_level, 1)
  INTO v_total_xp_earned, v_current_level
  FROM user_xp_progression
  WHERE user_wallet = p_user_wallet;

  -- Now insert/update with a single row (guaranteed to be one row)
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
  VALUES (
    p_user_wallet,
    v_total_creations,
    v_total_completions,
    v_total_moderations,
    v_total_winc_earned,
    v_total_winc_lost,
    v_total_xp_earned,
    v_current_level,
    NOW()
  )
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

-- =====================================================
-- COMMENTAIRES
-- =====================================================
-- Cette correction résout le problème "ON CONFLICT DO UPDATE cannot affect row a second time"
-- en s'assurant que l'INSERT ne contient toujours qu'une seule ligne.
--
-- Ancien problème :
-- - Le SELECT avec plusieurs LEFT JOINs pouvait générer plusieurs lignes
-- - Si plusieurs JOINs retournaient des résultats, le produit cartésien créait plusieurs lignes
-- - PostgreSQL refuse de faire ON CONFLICT DO UPDATE sur plusieurs lignes avec la même clé
--
-- Nouvelle solution :
-- - Calculer chaque statistique séparément dans des variables
-- - Utiliser VALUES au lieu de SELECT pour garantir une seule ligne
-- - Cela évite complètement le problème de produit cartésien

