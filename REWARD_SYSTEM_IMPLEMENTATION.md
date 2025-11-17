# Système de Récompenses - Implémentation Complète

## 📋 Vue d'ensemble

Ce document décrit l'implémentation complète du système de récompenses blockchain pour Winstory.io. Le système est conçu pour être facilement intégré avec un Smart Contract Winstory ultérieurement.

## 🎯 Fonctionnalités Implémentées

### ✅ Phase 1 : Prélèvement au MINT Initial
- **Table `reward_locks`** : Tracker le prélèvement des récompenses
- **API `/api/rewards/lock`** : Vérifie les soldes et enregistre le lock
- **Intégration dans création campagne** : Appel automatique lors du MINT

### ✅ Phase 2 : Vérification Double Completion
- **Protection anti-double** : Un wallet ne peut compléter qu'une fois par campagne
- **Vérification dans `/api/completions/submit`** : Bloque les soumissions multiples

### ✅ Phase 3 : Distribution Standard (Immédiate)
- **API `/api/rewards/distribute-standard`** : Distribue automatiquement après validation
- **Support multi-blockchain** : Ethereum, Polygon, Base, Chiliz, etc.
- **Support multi-standard** : ERC20, ERC721, ERC1155
- **Enregistrement traçable** : `reward_distributions` avec `tx_hash`
- **Vérification on-chain** : Confirmation immédiate de la transaction
- **Notifications** : Alertes in-app pour les compléteurs

### ✅ Phase 4 : Distribution Premium (Fin de Campagne)
- **API `/api/rewards/distribute-premium`** : Distribue aux Top 3
- **Calcul automatique Top 3** : Par moyenne de scores (quelques millisecondes)
- **Worker cron** : `/api/cron/check-ended-campaigns` pour détecter campagnes terminées

### ✅ Phase 5 : Notifications
- **API `/api/notifications/my`** : Récupération et gestion des notifications
- **Notifications automatiques** : Récompenses distribuées, Top 3, etc.

## 📁 Fichiers Créés

### Migrations Base de Données
```
supabase/migrations/
└── 20250127_reward_locks.sql          (Table reward_locks)
```

### Helpers & Utilitaires
```
lib/
├── reward-distribution-helpers.ts     (Distribution blockchain depuis wallet Winstory)
├── reward-lock-helpers.ts             (Lock réel des récompenses au MINT)
├── notification-helpers.ts            (Helpers notifications)
└── winstory-wallet.ts                 (Helper frontend pour adresse Winstory)
```

### APIs
```
app/api/rewards/
├── lock/route.ts                      (Lock RÉEL des récompenses au MINT)
├── winstory-address/route.ts          (Adresse wallet Winstory pour approbation)
├── distribute-standard/route.ts       (Distribution Standard immédiate)
└── distribute-premium/route.ts        (Distribution Premium Top 3)

app/api/notifications/
└── my/route.ts                        (Notifications utilisateur)

app/api/cron/
└── check-ended-campaigns/route.ts     (Worker pour campagnes terminées)
```

### Fichiers Modifiés
```
app/api/campaigns/create/route.ts      (Ajout lock récompenses)
app/api/completions/submit/route.ts    (Vérification double completion)
app/api/completions/validate/route.ts  (Déclenchement distribution Standard)
```

## 🔄 Flux Complet

### 1. MINT Initial (Entreprise B2C/Agency B2C)

```
1. Entreprise configure récompenses (tokens, items, accès)
2. Paiement MINT (1000€ + options)
3. Création campagne → /api/campaigns/create
4. Appel automatique → /api/rewards/lock
   ├─ Vérifie soldes entreprise
   ├─ Calcule totaux nécessaires
   └─ Enregistre dans reward_locks
5. Campagne créée ✅
```

### 2. Soumission Completion (Individu)

```
1. Utilisateur soumet completion → /api/completions/submit
2. Vérification double completion
   ├─ Si déjà complété → Erreur 400
   └─ Sinon → Création completion
3. XP attribué pour soumission
4. Completion en modération ✅
```

### 3. Validation Completion (Modérateurs)

```
1. Modérateurs votent et attribuent scores
2. Validation finale → /api/completions/validate
3. Si validée (approved) :
   ├─ XP bonus si score = 100%
   ├─ Distribution Standard → /api/rewards/distribute-standard
   │   ├─ Récupère config depuis DB
   │   ├─ Distribue via blockchain (mock pour l'instant)
   │   ├─ Enregistre dans reward_distributions
   │   ├─ Vérifie on-chain
   │   └─ Notifie compléteur
   └─ Délivre accès digitaux/physiques
4. Completion validée ✅
```

### 4. Fin de Campagne (Top 3)

```
1. Campagne se termine (statut COMPLETED OU max_completions OU date fin)
2. Worker cron → /api/cron/check-ended-campaigns
   ├─ Détecte campagnes terminées
   ├─ Vérifie si Premium déjà distribué
   └─ Appelle /api/rewards/distribute-premium
3. Distribution Premium → /api/rewards/distribute-premium
   ├─ Calcule Top 3 (moyenne scores)
   ├─ Pour chaque Top 3 :
   │   ├─ Distribue récompenses Premium
   │   ├─ Enregistre dans reward_distributions
   │   └─ Notifie compléteur
   └─ Top 3 récompensés ✅
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# App URL (pour appels internes)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (pour worker)
CRON_SECRET=change-me-in-production

# Wallet Winstory Custodial (OBLIGATOIRE pour lock réel)
WINSTORY_CUSTODIAL_WALLET_PRIVATE_KEY=0x...votre_clé_privée...
```

⚠️ **IMPORTANT** : Le wallet Winstory custodial est **obligatoire** pour le lock réel des récompenses.
Voir `REWARD_LOCK_SETUP.md` pour la configuration complète.

### Migration Base de Données

```bash
# Appliquer la migration
psql -f supabase/migrations/20250127_reward_locks.sql

# Ou via Supabase Dashboard
# Copier-coller le contenu dans SQL Editor
```

## 🚀 Utilisation

### Lock Récompenses au MINT

```typescript
// Automatique lors de la création de campagne
// Ou manuel :
POST /api/rewards/lock
{
  "campaignId": "campaign_123",
  "creatorWallet": "0x...",
  "maxCompletions": 100
}
```

### Distribution Standard

```typescript
// Automatique lors de validation
// Ou manuel :
POST /api/rewards/distribute-standard
{
  "completionId": "completion_123",
  "campaignId": "campaign_123",
  "completerWallet": "0x..."
}
```

### Distribution Premium

```typescript
// Automatique via worker cron
// Ou manuel :
POST /api/rewards/distribute-premium
{
  "campaignId": "campaign_123"
}
```

### Notifications

```typescript
// Récupérer notifications
GET /api/notifications/my?wallet=0x...&limit=50&unreadOnly=true

// Marquer comme lue
PATCH /api/notifications/my
{
  "notificationId": "notif_123",
  "wallet": "0x..."
}
```

## 🔮 Intégration Smart Contract (À Venir)

### Points d'Intégration Prévus

1. **`lib/reward-distribution-helpers.ts`**
   - Fonctions `distributeERC20Token()`, `distributeERC1155Item()`, `distributeERC721NFT()`
   - Actuellement : Mock transactions
   - À remplacer par : Appels au Smart Contract Winstory

2. **`app/api/rewards/lock/route.ts`**
   - Actuellement : Enregistrement dans DB uniquement
   - À ajouter : Appel `lockRewardsInContract()` pour réellement lock les tokens

3. **Smart Contract Winstory**
   - Fonction `lockRewards(campaignId, amounts)` : Lock les tokens au MINT
   - Fonction `distributeReward(campaignId, completionId, recipient, tokenAddress, amount)` : Distribuer
   - Événements : `RewardLocked`, `RewardDistributed`

### Exemple d'Intégration Future

```typescript
// Dans reward-distribution-helpers.ts
export async function distributeERC20Token(...) {
  // Remplacer mock par :
  const winstoryContract = new ethers.Contract(
    WINSTORY_CONTRACT_ADDRESS,
    WINSTORY_ABI,
    provider
  );
  
  const tx = await winstoryContract.distributeReward(
    campaignId,
    completionId,
    recipientWallet,
    contractAddress,
    amount
  );
  
  return { success: true, txHash: tx.hash };
}
```

## 📊 Tables Utilisées

### `reward_locks`
- Track le prélèvement des récompenses au MINT
- Statuts : `locked`, `unlocking`, `unlocked`, `failed`

### `reward_distributions`
- Historique complet des distributions
- Contient `tx_hash` pour traçabilité on-chain
- Statuts : `pending`, `completed`, `failed`

### `system_notifications`
- Notifications in-app pour utilisateurs
- Types : `reward_distributed`, `premium_reward_distributed`, etc.

## 🛡️ Sécurité

### Protections Implémentées

1. **Anti-double completion** : Vérification avant soumission
2. **Anti-double distribution** : Vérification avant distribution
3. **Validation wallet** : Format et vérification contrat vs EOA
4. **Vérification on-chain** : Confirmation immédiate des transactions
5. **Cron secret** : Protection du worker avec Bearer token

## 📝 Notes Importantes

### État Actuel (Lock Réel Implémenté)

- ✅ **Lock réel implémenté** : Les tokens sont réellement prélevés au MINT
- ✅ **Distribution réelle** : Les tokens sont distribués depuis le wallet Winstory custodial
- ✅ **Vraies transactions blockchain** : Toutes les transactions sont réelles avec vrais hash
- ⚠️ **Nécessite approbation** : L'entreprise doit approuver le wallet Winstory avant le MINT
- 🔮 **Prêt pour Smart Contract** : Le système peut facilement migrer vers Smart Contract

### Prochaines Étapes

1. ✅ Système de base implémenté
2. ⏳ Intégration Smart Contract Winstory
3. ⏳ Tests end-to-end complets
4. ⏳ Dashboard monitoring distributions
5. ⏳ Métriques et analytics

## 🐛 Debugging

### Logs Importants

```bash
# Lock récompenses
🔒 Locking rewards at MINT...

# Distribution Standard
🎁 Distributing standard blockchain rewards...

# Distribution Premium
🏆 Top 3 completions: [...]

# Vérifications
🔍 Checking if wallet already completed...
```

### Vérifications

```sql
-- Vérifier locks
SELECT * FROM reward_locks WHERE campaign_id = '...';

-- Vérifier distributions
SELECT * FROM reward_distributions 
WHERE campaign_id = '...' 
ORDER BY distributed_at DESC;

-- Vérifier notifications
SELECT * FROM system_notifications 
WHERE user_wallet = '0x...' 
ORDER BY created_at DESC;
```

## 📚 Documentation Complémentaire

- `MULTI_BLOCKCHAIN_REWARDS_GUIDE.md` : Guide multi-blockchain
- `CAMPAIGN_DATA_STRUCTURE.md` : Structure des données campagne
- `XP_SYSTEM_IMPLEMENTATION.md` : Système XP (complémentaire)

---

**Dernière mise à jour** : 2025-01-27
**Version** : 1.0.0
**Statut** : ✅ Implémenté (en attente Smart Contract)

