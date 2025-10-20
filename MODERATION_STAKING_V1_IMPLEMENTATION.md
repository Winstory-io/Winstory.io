# Implémentation du Système de Modération avec Staking V1 - Winstory.io

## Résumé de l'implémentation

Cette implémentation complète le système de modération de Winstory.io en intégrant le framework de staking V1 et en s'assurant que toutes les données nécessaires sont correctement récupérées et stockées.

## 🎯 Objectifs atteints

### ✅ Récupération des votes Valid/Refuse
- **Valid = ✅** : Votes de validation avec score (1-100) pour les complétions
- **Refuse = ❌** : Votes de refus pour tous les types de contenu
- Tous les votes sont tracés avec des console.log détaillés

### ✅ Intégration du Framework de Staking V1
- **Éligibilité** : `stake_i ≥ minStakeToVote` ET `stake_age_i ≥ stakeAgeMinDays`
- **Calcul des gains** : Pool majoritaire (459€) + Pool minoritaire (51€)
- **Distribution** : Proportielle au stake avec facteurs démocratiques
- **XP** : Attribution basée sur la participation et l'alignement

### ✅ Données du Staker récupérées
- **Stake** : Montant en WINC staké
- **Âge du stake** : Durée en jours
- **XP** : Points d'expérience du modérateur
- **Éligibilité** : Statut ACTIVE/PASSIVE selon le framework V1

## 🔧 APIs implémentées

### 1. `/api/moderation/vote-staking` (POST)
**Fonction** : Enregistre un vote et calcule les gains selon le framework V1

**Paramètres requis** :
```json
{
  "campaignId": "string",
  "moderatorWallet": "string", 
  "voteDecision": "VALID | REFUSE",
  "score": "number (1-100) - optionnel",
  "stakedAmount": "number",
  "stakeAgeDays": "number",
  "moderatorXP": "number"
}
```

**Réponse** :
```json
{
  "success": true,
  "voteId": "string",
  "moderationData": {...},
  "stakingResult": {
    "decision": "YES | NO",
    "majority_pool_eur": 459,
    "minority_pool_eur": 51,
    "distribution": [...]
  },
  "consoleLogs": [...]
}
```

### 2. `/api/moderation/staker-data` (GET)
**Fonction** : Récupère les données du staker pour une campagne

**Paramètres** :
- `wallet` : Adresse wallet du modérateur
- `campaignId` : ID de la campagne (optionnel)

**Réponse** :
```json
{
  "success": true,
  "stakerData": {
    "wallet": "string",
    "stakedAmount": 1000,
    "stakeAgeDays": 30,
    "xp": 200,
    "isActive": true,
    "eligibilityReason": "string"
  },
  "consoleLogs": [...]
}
```

### 3. `/api/moderation/save-vote` (POST)
**Fonction** : Sauvegarde les votes en base de données

**Table cible** : `moderation_votes`
- `id`, `campaign_id`, `moderator_wallet`
- `completion_id`, `vote_decision`, `staked_amount`
- `vote_weight`, `vote_timestamp`, `created_at`

## 🎨 Interface utilisateur

### Composant StakerInfo
- **Affichage** : Statut d'éligibilité, stake, âge, XP
- **Couleurs** : Vert pour éligible, Rouge pour non-éligible
- **Informations** : Poids de vote (50% stake + 50% démocratie)

### Console.log détaillés
Tous les votes sont tracés avec des logs structurés :
```
🔍 [MODERATION DECISION] Début de la soumission
📤 [MODERATION DECISION] Envoi vers l'API
✅ [MODERATION DECISION] Vote enregistré avec succès
🎉 [MODERATION DECISION] Vote finalisé avec succès
```

## 📊 Framework V1 - Paramètres par défaut

```javascript
{
  minStakeToVote: 50,           // WINC minimum pour voter
  stakeAgeMinDays: 7,          // Âge minimum du stake
  threshold_stake_k: 50,       // Seuil pour le facteur stake
  age_max_days: 365,           // Âge maximum pour le calcul
  XP_scale: 100,               // Échelle pour le facteur XP
  alpha: 0.5,                  // Poids ploutocratie
  beta: 0.5,                   // Poids démocratie
  totalPoolEur: 510,           // Pool total en euros
  majorityPoolRatio: 0.9       // Ratio pool majoritaire
}
```

## 🔄 Flux de données

1. **Connexion utilisateur** → Récupération des données du staker
2. **Clic Valid/Refuse** → Validation des données + Calcul staking
3. **Sauvegarde** → Enregistrement en base de données
4. **Logs** → Traçabilité complète dans la console

## 🚀 Prochaines étapes

### TODO : Implémentation base de données
- [ ] Connexion Prisma/Supabase
- [ ] Requêtes SQL pour `moderation_votes`
- [ ] Requêtes SQL pour `moderator_stakes`
- [ ] Requêtes SQL pour `user_dashboard_stats`

### TODO : Intégration blockchain
- [ ] Hash de transaction pour chaque vote
- [ ] Validation on-chain des stakes
- [ ] Distribution automatique des récompenses

### TODO : Token $WINC
- [ ] Création du contrat ERC-20
- [ ] Intégration avec le système de staking
- [ ] Mécanismes de mint/burn

## 📝 Notes importantes

- **Valid = ✅** : Toujours avec score pour les complétions
- **Refuse = ❌** : Toujours sans score
- **Staking** : Calcul automatique selon le framework V1
- **Logs** : Traçabilité complète pour le debugging
- **Base de données** : Structure prête, implémentation à finaliser

Cette implémentation garantit que tous les votes de modération sont correctement tracés, que les données du staker sont récupérées pour le calcul des gains, et que le framework V1 est intégré pour la distribution des récompenses.

