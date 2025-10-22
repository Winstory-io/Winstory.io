# Solution finale : Correction du trigger de campagne

## Problème résolu

Après avoir corrigé l'ordre des opérations, une nouvelle erreur est apparue :
```
insert or update on table "creator_infos" violates foreign key constraint "creator_infos_campaign_id_fkey"
```

## Cause racine identifiée

Le problème était une **contrainte circulaire** :

1. **`creator_infos`** dépend de **`campaigns`** (clé étrangère `campaign_id`)
2. **Le trigger sur `campaigns`** dépendait de **`creator_infos`** pour récupérer le `wallet_address`

Cette contrainte circulaire rendait impossible de créer les tables dans le bon ordre.

## Solution implémentée

### 1. Retour à l'ordre original des opérations

```typescript
// 1. Créer la campagne principale
const { data: campaign, error: campaignError } = await supabase
  .from('campaigns')
  .insert({ ... });

// 2. Créer les informations du créateur
const { error: creatorError } = await supabase
  .from('creator_infos')
  .insert({ ... });
```

### 2. Correction du trigger dans la base de données

**Ancien trigger problématique** :
```sql
CREATE OR REPLACE FUNCTION on_campaign_created()
RETURNS TRIGGER AS $$
BEGIN
  -- ❌ Problème : jointure avec creator_infos qui n'existe pas encore
  PERFORM update_user_dashboard_stats(
    (SELECT ci.wallet_address FROM creator_infos ci WHERE ci.campaign_id = NEW.id)
  );
END;
$$ LANGUAGE plpgsql;
```

**Nouveau trigger corrigé** :
```sql
CREATE OR REPLACE FUNCTION on_campaign_created()
RETURNS TRIGGER AS $$
BEGIN
  -- ✅ Solution : utiliser directement original_creator_wallet
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
```

### 3. Migration SQL créée

Le fichier `/supabase/migrations/20250122_fix_campaign_trigger.sql` contient :
- Suppression de l'ancien trigger
- Création de la nouvelle fonction corrigée
- Recréation du trigger avec la fonction corrigée

## Avantages de cette solution

- ✅ **Pas de contrainte circulaire** : Le trigger utilise directement les données de `campaigns`
- ✅ **Ordre naturel** : `campaigns` → `creator_infos` (respecte les clés étrangères)
- ✅ **Performance** : Pas de jointure supplémentaire dans le trigger
- ✅ **Robustesse** : Le trigger fonctionne même si `creator_infos` n'existe pas encore
- ✅ **Cohérence** : Toutes les fonctionnalités du trigger sont préservées

## Test de la solution

Pour tester la correction :

1. **Appliquer la migration** : Exécuter le fichier SQL dans Supabase
2. **Créer une campagne** via les pages Recap
3. **Vérifier les logs** : Plus d'erreur de contrainte
4. **Confirmer** : Les statistiques utilisateur sont mises à jour
5. **Vérifier** : Les activités et achievements sont créés

## Ordre final des opérations

1. **Initialiser l'utilisateur** (`ensureUserExists`)
2. **Créer `campaigns`** (déclenche le trigger corrigé)
3. **Créer `creator_infos`** (clé étrangère vers `campaigns`)
4. **Créer `campaign_contents`**
5. **Créer `campaign_rewards`**
6. **Créer `campaign_metadata`**
7. **Créer `moderation_progress`**
8. **Créer `campaign_creation_logs`**

## Notes techniques

- **Migration requise** : Il faut appliquer le fichier SQL dans Supabase
- **Pas de changement applicatif** : Seule la base de données est modifiée
- **Rétrocompatibilité** : Les campagnes existantes continuent de fonctionner
- **Performance** : Le trigger est maintenant plus efficace

Cette solution résout définitivement le problème de contrainte circulaire en modifiant le trigger pour qu'il utilise directement les données disponibles dans la table `campaigns`.
