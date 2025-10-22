-- =====================================================
-- CORRECTION DU TRIGGER on_campaign_created
-- =====================================================
-- Le trigger utilise maintenant directement original_creator_wallet
-- au lieu de faire une jointure avec creator_infos qui peut ne pas exister encore

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trg_campaign_created ON campaigns;

-- Créer la nouvelle fonction corrigée
CREATE OR REPLACE FUNCTION on_campaign_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les stats du créateur en utilisant directement original_creator_wallet
  PERFORM update_user_dashboard_stats(NEW.original_creator_wallet);
  
  -- Créer une activité
  PERFORM create_user_activity(
    NEW.original_creator_wallet,
    'campaign_created',
    'Campaign Created: ' || NEW.title,
    'New campaign created and ready for moderation',
    NEW.id
  );
  
  -- Vérifier achievements
  PERFORM award_user_achievement(
    NEW.original_creator_wallet,
    'first_creation',
    'First Creator',
    'Created your first campaign on Winstory'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger avec la fonction corrigée
CREATE TRIGGER trg_campaign_created
AFTER INSERT ON campaigns
FOR EACH ROW EXECUTE FUNCTION on_campaign_created();

-- =====================================================
-- COMMENTAIRES
-- =====================================================
-- Cette correction résout le problème de contrainte circulaire :
-- - creator_infos dépend de campaigns (clé étrangère)
-- - Le trigger sur campaigns dépendait de creator_infos
-- 
-- Maintenant le trigger utilise directement original_creator_wallet
-- qui est toujours disponible dans la table campaigns
