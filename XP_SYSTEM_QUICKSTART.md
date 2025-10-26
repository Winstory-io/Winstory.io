# XP System - Guide de Démarrage Rapide

## 🚀 Mise en Service Rapide

### 1. Migration de la Base de Données

```bash
# Appliquer la migration XP
cd /Users/voteer/Downloads/Winstory.io-main
psql -d your_database -f supabase/migrations/20250126_xp_transactions.sql
```

Ou via Supabase Dashboard :
1. Aller dans SQL Editor
2. Copier le contenu de `supabase/migrations/20250126_xp_transactions.sql`
3. Exécuter

### 2. Variables d'Environnement

Assurez-vous que votre `.env.local` contient :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Vérification de l'Installation

```bash
# Démarrer le serveur
npm run dev

# Test API XP
curl http://localhost:3000/api/xp/balance?wallet=0xTEST
```

Réponse attendue :
```json
{
  "success": true,
  "data": {
    "user_wallet": "0xTEST",
    "total_xp": 0,
    "current_level": 1,
    "xp_to_next_level": 100
  }
}
```

## 📊 Utilisation des APIs

### Créer une Campagne avec XP

Aucune modification nécessaire ! Le système XP est automatiquement intégré :

```typescript
// Création de campagne B2C
const response = await fetch('/api/campaigns/create', {
  method: 'POST',
  body: JSON.stringify({
    campaignType: 'B2C',
    walletAddress: '0x123...',
    roiData: { unitValue: 1000 },
    film: { videoId: null }, // Winstory creates = +500 XP
    // Pas de rewards custom = +1000 XP
    // Total: 1000 (MINT) + 500 (video) + 1000 (no rewards) = 2500 XP
  })
});
```

### Vote de Modération avec XP

```typescript
// Vote de modération
const response = await fetch('/api/moderation/vote-staking', {
  method: 'POST',
  body: JSON.stringify({
    campaignId: 'campaign_...',
    moderatorWallet: '0x456...',
    voteDecision: 'VALID', // +2 XP
    stakedAmount: 100
  })
});
```

### Soumettre une Complétion avec XP

```typescript
// Soumission de complétion
const response = await fetch('/api/completions/submit', {
  method: 'POST',
  body: JSON.stringify({
    campaignId: 'campaign_...',
    completerWallet: '0x789...',
    title: 'Ma complétion',
    videoUrl: 'https://...'
    // +10 XP automatiquement attribués
  })
});
```

## 🎮 Récupérer l'XP d'un Utilisateur

### Dans un Composant React

```typescript
import { useState, useEffect } from 'react';

function UserXPBadge({ wallet }: { wallet: string }) {
  const [xpData, setXpData] = useState(null);

  useEffect(() => {
    fetch(`/api/xp/balance?wallet=${wallet}`)
      .then(res => res.json())
      .then(data => setXpData(data.data));
  }, [wallet]);

  if (!xpData) return <div>Loading...</div>;

  return (
    <div className="xp-badge">
      <span>Level {xpData.current_level}</span>
      <span>{xpData.total_xp} XP</span>
      <div className="progress-bar">
        <div style={{ 
          width: `${(xpData.xp_in_current_level / 
                    (xpData.xp_in_current_level + xpData.xp_to_next_level)) * 100}%` 
        }} />
      </div>
    </div>
  );
}
```

### Historique des Transactions

```typescript
// Récupérer les 50 dernières transactions XP
const response = await fetch(
  `/api/xp/transactions?wallet=${wallet}&limit=50&offset=0`
);
const { data } = await response.json();

data.forEach(tx => {
  console.log(`${tx.transaction_type}: ${tx.xp_amount > 0 ? '+' : ''}${tx.xp_amount} XP`);
});
```

## 🏢 Agency B2C - Attribution Client

### Étape 1 : Enregistrer le Client

Automatique lors de la création de campagne Agency B2C :
```typescript
// Dans le formulaire de création Agency B2C
{
  campaignType: 'AGENCY_B2C',
  agencyInfo: { email: 'agency@example.com' },
  clientInfo: { 
    contactEmail: 'client@example.com',
    companyName: 'Client Corp'
  }
  // Le client est automatiquement enregistré pour recevoir XP à la connexion
}
```

### Étape 2 : Attribution XP lors de la Connexion

Lorsque le client se connecte pour la première fois :
```typescript
// Dans votre système d'authentification
const onUserLogin = async (email: string, wallet: string) => {
  // Vérifier si c'est un client d'agence
  const response = await fetch('/api/xp/agency-client', {
    method: 'POST',
    body: JSON.stringify({
      action: 'onboard',
      clientEmail: email,
      clientWallet: wallet
    })
  });
  
  if (response.ok) {
    const result = await response.json();
    if (result.success && result.data.xpAmount > 0) {
      // Afficher notification : "Bienvenue ! Vous avez reçu 1000 XP !"
      showWelcomeNotification(result.data.xpAmount);
    }
  }
};
```

## 📈 Cas d'Usage Complets

### Campagne B2C Complète

```typescript
// 1. Création (avec options premium)
await createCampaign({
  type: 'B2C',
  mint: 1000, // +1000 XP
  winstoryVideo: true, // +500 XP
  noRewards: false
});
// Total: 1500 XP

// 2. Modération
// - 10 modérateurs votent VALID: 10 × +2 = +20 XP (total modérateurs)
// - 2 modérateurs votent REFUSE: 2 × -1 = -2 XP (total modérateurs)
// - Décision finale: APPROVED: +100 XP (créateur)

// 3. Complétions
// - Completer A soumet: +10 XP
// - Completer B soumet: +10 XP
// - Completer A validé à 100%: +100 XP
// Total Completer A: 110 XP
```

### Individual avec MINT Variable

```typescript
// Création avec 5000 $WINC
await createCampaign({
  type: 'INDIVIDUAL',
  mintWINC: 5000 // +5000 XP
});

// Si refusé en modération: -2500 XP (5000 / 2)
// Si approuvé: +100 XP
```

## 🔍 Debugging

### Vérifier les Logs

Tous les appels XP génèrent des logs préfixés `[XP]` :
```bash
# Dans la console serveur
🎯 [XP] Starting XP award for campaign creation...
💰 [XP] Mint Value: { mintValueUSD: 1000, mintValueWINC: 1000 }
✅ [XP] Campaign creation XP awarded: { totalXP: 1500 }
```

### Requêtes SQL Directes

```sql
-- Vérifier le solde XP
SELECT * FROM xp_balances WHERE user_wallet = '0x123...';

-- Voir les dernières transactions
SELECT 
  transaction_type,
  xp_amount,
  description,
  created_at
FROM xp_transactions
WHERE user_wallet = '0x123...'
ORDER BY created_at DESC
LIMIT 10;

-- Top utilisateurs par XP
SELECT 
  user_wallet,
  total_xp,
  current_level
FROM xp_balances
ORDER BY total_xp DESC
LIMIT 20;
```

## ⚠️ Points d'Attention

1. **XP ne peut pas être négatif** : Le système empêche l'XP de descendre en dessous de 0
2. **Transactions asynchrones** : L'attribution XP ne bloque pas les opérations principales
3. **Échecs silencieux** : Si l'attribution XP échoue, l'opération principale (création de campagne, vote, etc.) continue
4. **Cache** : Les balances XP sont mises à jour immédiatement, pas besoin de cache invalidation

## 🛠️ Troubleshooting

### L'XP n'est pas attribué

1. Vérifier les logs serveur pour messages `[XP]`
2. Vérifier que les tables existent : `SELECT * FROM xp_transactions LIMIT 1;`
3. Vérifier les variables d'environnement
4. Tester l'endpoint directement : `curl http://localhost:3000/api/xp/balance?wallet=0xTEST`

### Les niveaux ne s'affichent pas correctement

```typescript
// Forcer le recalcul du niveau
import { calculateLevel } from '@/lib/xp-config';
const { level, xpToNextLevel } = calculateLevel(totalXP);
```

### Transactions en double

Le système utilise des IDs uniques générés automatiquement. Les duplicatas ne devraient pas être possibles. Si cela arrive :
```sql
-- Vérifier les duplicatas
SELECT 
  user_wallet,
  campaign_id,
  transaction_type,
  COUNT(*)
FROM xp_transactions
GROUP BY user_wallet, campaign_id, transaction_type
HAVING COUNT(*) > 1;
```

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation complète : `XP_SYSTEM_IMPLEMENTATION.md`
2. Vérifier les logs serveur
3. Exécuter les requêtes SQL de diagnostic ci-dessus

---

**Prochaines étapes** : Consultez `XP_SYSTEM_IMPLEMENTATION.md` pour la documentation technique complète.

