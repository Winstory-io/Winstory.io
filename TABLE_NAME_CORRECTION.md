# Correction du nom de table campaign_rewards_configs

## Problème résolu

L'erreur suivante se produisait lors de la création de campagnes :
```
Could not find the table 'public.campaign_rewards' in the schema cache
```

## Cause identifiée

Le code utilisait le nom de table incorrect `campaign_rewards` alors que la vraie table s'appelle `campaign_rewards_configs`.

## Solution implémentée

### Correction du nom de table

**Avant** (incorrect) :
```typescript
const { error: rewardsError } = await supabase
  .from('campaign_rewards')  // ❌ Table inexistante
  .insert({ ... });
```

**Après** (correct) :
```typescript
const { error: rewardsError } = await supabase
  .from('campaign_rewards_configs')  // ✅ Bon nom de table
  .insert({ ... });
```

## Tables de campagne correctes

Voici les noms corrects des tables de campagne dans le schéma :

- ✅ `campaigns` - Campagnes principales
- ✅ `creator_infos` - Informations des créateurs
- ✅ `campaign_contents` - Contenu des campagnes (vidéos, histoires)
- ✅ `campaign_rewards_configs` - Configuration des récompenses
- ✅ `campaign_metadata` - Métadonnées des campagnes
- ✅ `moderation_progress` - Progrès de modération
- ✅ `campaign_creation_logs` - Logs de création

## Vérification du schéma

Pour éviter ce type d'erreur à l'avenir, voici comment vérifier les noms de tables :

```sql
-- Lister toutes les tables de campagne
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'campaign%' 
AND table_schema = 'public';
```

## Test de la correction

Maintenant, la création de campagne devrait fonctionner correctement :

1. **Créer une campagne B2C** avec les options payantes
2. **Vérifier les logs** : Plus d'erreur de table inexistante
3. **Confirmer** : Toutes les tables sont correctement remplies
4. **Vérifier** : Les données apparaissent sur `/mywin`

## Avantages de cette correction

- ✅ **Nom de table correct** : Utilise `campaign_rewards_configs`
- ✅ **Plus d'erreur** : La table existe et est accessible
- ✅ **Cohérence** : Tous les noms de tables sont maintenant corrects
- ✅ **Fonctionnalité complète** : Les récompenses sont correctement gérées

Cette correction simple mais importante permet maintenant la création complète de campagnes avec toutes les options payantes ! 🎉
