# Système XP (Membership) Winstory - Documentation Complète

## Vue d'ensemble

Le système XP (Experience Points) de Winstory est un système de gamification complet qui récompense les utilisateurs pour leurs actions sur la plateforme : création de campagnes, modération, et complétion de contenus. Le système est conçu pour encourager l'engagement et la qualité des contributions.

## Architecture du Système

### 1. Configuration (`/lib/xp-config.ts`)

Fichier de configuration centralisé définissant :
- **Types d'utilisateurs** : B2C, AGENCY_B2C, INDIVIDUAL
- **Actions XP** : Règles de gains/pertes par type d'utilisateur
- **Niveaux** : 20 niveaux progressifs (niveau 1 à 20)
- **Calculs** : Fonctions utilitaires pour le calcul d'XP

### 2. Moteur XP (`/lib/xp-engine.ts`)

Bibliothèque principale gérant :
- Attribution d'XP pour chaque action
- Calculs basés sur formules dynamiques
- Intégration avec Supabase
- Fonctions spécialisées par contexte :
  - `awardCampaignCreationXP()` - Création de campagne
  - `awardModerationVoteXP()` - Vote de modération
  - `awardFinalModerationXP()` - Décision finale
  - `awardCompletionXP()` - Soumission et validation de complétion
  - `awardAgencyClientOnboardingXP()` - Onboarding client B2C

### 3. Base de Données (`/supabase/migrations/20250126_xp_transactions.sql`)

Trois tables principales :

#### `xp_transactions`
Historique complet de toutes les transactions XP :
- ID unique, wallet utilisateur, type d'utilisateur
- Type de transaction (MINT, modération, complétion, etc.)
- Montant XP (positif ou négatif)
- XP avant/après transaction
- Contexte (campaign_id, completion_id, etc.)
- Métadonnées JSON pour audit

#### `xp_balances`
État actuel de l'XP par wallet :
- XP total, niveau actuel
- XP vers prochain niveau
- Statistiques lifetime (XP gagné/perdu)
- Compteurs d'activité

#### `agency_b2c_clients`
Suivi des clients d'agences :
- Lien agence ↔ client
- État d'onboarding
- Attribution XP différée

### 4. API Endpoints

#### `/api/xp/balance` (GET)
Récupérer le solde XP d'un wallet
```typescript
GET /api/xp/balance?wallet=0x...
Response: { success, data: { total_xp, current_level, ... } }
```

#### `/api/xp/transactions` (GET/POST)
- **GET** : Historique des transactions
- **POST** : Créer une transaction manuelle (admin)

#### `/api/xp/award-campaign-creation` (POST)
Attribuer XP pour création de campagne
```typescript
POST /api/xp/award-campaign-creation
Body: {
  userWallet, campaignType, campaignId, mintValueUSD,
  options: { winstoryCreatesVideo, noRewards, mintValueWINC }
}
```

#### `/api/xp/award-moderation` (POST)
Attribuer XP pour modération
```typescript
POST /api/xp/award-moderation
Body: {
  type: 'vote' | 'final',
  moderatorWallet, creatorWallet,
  campaignId, campaignType,
  voteDecision, finalDecision
}
```

#### `/api/xp/award-completion` (POST)
Attribuer XP pour complétion
```typescript
POST /api/xp/award-completion
Body: {
  completerWallet, campaignId, completionId,
  isValidated: boolean
}
```

#### `/api/xp/agency-client` (POST)
Gérer les clients d'agences B2C
```typescript
POST /api/xp/agency-client
Body: {
  action: 'register' | 'onboard',
  agencyWallet, clientEmail, clientWallet, ...
}
```

## Règles XP par Type d'Utilisateur

### 🟨 B2C

#### Création de Campagne
- **MINT (1000 USD)** : +1000 XP
- **Option "Winstory Creates Video"** : +500 XP
- **Option "No Rewards"** : +1000 XP

#### Modération
- **Vote VALID** (par modérateur) : +2 XP
- **Vote REFUSE** (par modérateur) : -1 XP
- **Campagne validée** (décision finale) : +100 XP
- **Campagne refusée** (décision finale) : -500 XP

#### Complétion
- **1 complétion soumise** : +10 XP
- **Complétion validée à 100%** : +100 XP

### 🟦 Agency B2C

#### Création de Campagne
- **MINT (1000 USD)** : +1000 XP (pour l'agence)
- **Option "No Rewards"** : +1000 XP (pour l'agence)

#### Client B2C
- **Client connecté à Winstory** : +1000 XP (pour le CLIENT, pas l'agence)

### 🟩 Individual

#### Création de Campagne
- **MINT** : +XP = montant en $WINC minté

#### Modération
- **Vote VALID** (par modérateur) : +2 XP
- **Vote REFUSE** (par modérateur) : -1 XP
- **Campagne validée** : +100 XP
- **Campagne refusée** : -XP = (MINT $WINC / 2)

## Niveaux et Progression

| Niveau | XP Requis | Gain par rapport au précédent |
|--------|-----------|-------------------------------|
| 1      | 0         | -                             |
| 2      | 100       | +100                          |
| 3      | 250       | +150                          |
| 4      | 500       | +250                          |
| 5      | 1,000     | +500                          |
| 6      | 2,000     | +1,000                        |
| 7      | 3,500     | +1,500                        |
| 8      | 5,500     | +2,000                        |
| 9      | 8,000     | +2,500                        |
| 10     | 12,000    | +4,000                        |
| 11     | 17,000    | +5,000                        |
| 12     | 23,000    | +6,000                        |
| 13     | 30,000    | +7,000                        |
| 14     | 40,000    | +10,000                       |
| 15     | 52,000    | +12,000                       |
| 16     | 67,000    | +15,000                       |
| 17     | 85,000    | +18,000                       |
| 18     | 107,000   | +22,000                       |
| 19     | 133,000   | +26,000                       |
| 20     | 165,000   | +32,000                       |

## Intégration dans les Flux Existants

### 1. Création de Campagne (`/app/api/campaigns/create/route.ts`)
- ✅ Attribution XP immédiate après création réussie
- ✅ Prise en compte des options premium
- ✅ Enregistrement client Agency B2C

### 2. Vote de Modération (`/app/api/moderation/vote-staking/route.ts`)
- ✅ Attribution XP après enregistrement du vote
- ✅ +2 XP pour VALID, -1 XP pour REFUSE
- ✅ Support de tous les types de campagne

### 3. Soumission de Complétion (`/app/api/completions/submit/route.ts`)
- ✅ +10 XP à la soumission

### 4. Validation de Complétion (`/app/api/completions/validate/route.ts`)
- ✅ +100 XP bonus si score final = 100%

## Fonctions Utilitaires

### Calcul du Niveau
```typescript
import { calculateLevel } from '@/lib/xp-config';

const result = calculateLevel(2500);
// { level: 6, xpToNextLevel: 1500, xpInCurrentLevel: 500 }
```

### Récupération du Solde
```typescript
import { getXPBalance } from '@/lib/xp-engine';

const balance = await getXPBalance(walletAddress);
// { total_xp, current_level, xp_to_next_level, ... }
```

### Attribution Manuelle
```typescript
import { awardXP } from '@/lib/xp-engine';

const result = await awardXP({
  userWallet: '0x...',
  userType: 'B2C',
  action: 'B2C_MINT_1000USD',
  campaignId: 'campaign_...',
  mintValueUSD: 1000
});
```

## Sécurité et Audit

1. **Immutabilité** : Toutes les transactions sont historisées dans `xp_transactions`
2. **Traçabilité** : Chaque transaction enregistre :
   - XP avant/après
   - Contexte complet (campaign, completion, etc.)
   - Métadonnées JSON
   - Timestamp précis
3. **Protection contre les pertes excessives** : L'XP ne peut jamais descendre en-dessous de 0
4. **Atomicité** : Les transactions sont gérées via fonction PL/pgSQL pour garantir la cohérence

## Migration de la Base de Données

Pour appliquer la migration :

```bash
# Via Supabase CLI
supabase migration up

# Ou exécuter directement le fichier SQL
psql -f supabase/migrations/20250126_xp_transactions.sql
```

La migration crée automatiquement :
- Les 3 tables principales
- Les index pour performances
- Les fonctions PL/pgSQL
- Les triggers de mise à jour

## Cas d'Usage Spécifiques

### Agency B2C - Attribution Différée

1. **Lors de la création de campagne** :
   - Agence reçoit XP immédiatement
   - Client enregistré dans `agency_b2c_clients` avec `xp_granted = false`

2. **Lors de la première connexion du client** :
   - Client reçoit +1000 XP
   - Table `agency_b2c_clients` mise à jour : `xp_granted = true`

### Individual - MINT Dynamique

Le montant d'XP est calculé dynamiquement :
```typescript
// Si MINT = 5000 $WINC
Individual_MINT → +5000 XP

// Si campagne refusée
Creation_Refused_Final → -2500 XP (5000 / 2)
```

## Tests et Validation

### Test de Base
```bash
# Test création de campagne B2C
curl -X POST http://localhost:3000/api/xp/award-campaign-creation \
  -H "Content-Type: application/json" \
  -d '{
    "userWallet": "0x123...",
    "campaignType": "B2C",
    "campaignId": "campaign_test",
    "mintValueUSD": 1000,
    "options": {
      "winstoryCreatesVideo": true,
      "noRewards": false
    }
  }'

# Vérifier le solde
curl http://localhost:3000/api/xp/balance?wallet=0x123...
```

## Logs et Monitoring

Tous les endpoints XP produisent des logs détaillés :
- ✅ Succès avec résumé
- ⚠️ Avertissements si XP non-critique échoue
- ❌ Erreurs avec contexte complet

Exemple de log :
```
🎯 [XP] Starting XP award for campaign creation...
💰 [XP] Mint Value: { mintValueUSD: 1000, mintValueWINC: 1000 }
⚙️ [XP] Options: { winstoryCreatesVideo: true, noRewards: false }
✅ [XP] Campaign creation XP awarded: { total: 2, successful: 2, totalXP: 1500 }
```

## Évolutions Futures

Améliorations potentielles :
1. **Multiplicateurs de saison** : Événements temporaires avec bonus XP
2. **Achievements** : Badges débloqués à certains seuils
3. **Leaderboards** : Classements par niveau/XP
4. **Système de prestige** : Reset avec avantages permanents
5. **XP boosts** : Items temporaires augmentant les gains

## Support et Maintenance

- **Logs** : Tous les endpoints génèrent des logs détaillés
- **Rollback** : Possibilité de créer des transactions négatives pour correction
- **Audit** : Table `xp_transactions` conserve l'historique complet
- **Performance** : Index sur toutes les colonnes de recherche fréquente

---

**Date de création** : 26 janvier 2025  
**Version** : 1.0.0  
**Auteur** : Winstory Development Team

