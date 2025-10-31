# ⚙️ Configuration Finale - Paramètres Winstory

## 🎯 Paramètres Validés

### 1. ⭐ Échelle de notation modération
**Valeur : 0-100**

- ✅ **Déjà implémenté** dans le code
- Chaque modérateur peut attribuer un score de 0 à 100
- Chaque score ne peut être utilisé qu'**une seule fois par campagne** par modérateur
- Oblige les modérateurs à hiérarchiser les completions

**Localisation dans le code :**
- `app/api/moderation/moderator-scores/route.ts`
- `components/CompletionScoringModal.tsx`
- `MODERATOR_SPECIFIC_SCORING_SYSTEM.md`

**Calcul du score final :**
```typescript
// Sans Super-Modérateur
finalScore = moyenne(scores_modérateurs)

// Avec Super-Modérateur (B2C/Agency)
finalScore = (moyenne_communauté × 0.49) + (score_super_mod × 0.51)
```

---

### 2. 💰 Montant minimum staking $WINC
**Statut : À déterminer ultérieurement**

- ⏳ Pas pertinent à l'heure actuelle
- Sera paramétré lors de la phase de lancement token
- Architecture prête pour intégration future

**Placeholder actuel :**
```typescript
const MIN_WINC_STAKING = 100; // Valeur temporaire pour tests
```

**Fichiers à mettre à jour ultérieurement :**
- `app/api/moderation/check-eligibility/route.ts`
- Variable d'environnement : `MIN_WINC_STAKING_AMOUNT`

---

### 3. ⛓️ Blockchain pour les votes
**Valeur : Base**

- ✅ Base blockchain (Layer 2 Ethereum)
- 🔧 Paramétrable ultérieurement via configuration
- Avantages : Gas fees bas, rapidité, compatibilité Ethereum

**Configuration future :**
```typescript
// .env
BLOCKCHAIN_NETWORK=base
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
BLOCKCHAIN_CHAIN_ID=8453

// Pour modération votes
VOTING_CONTRACT_ADDRESS=0x... // À déployer sur Base
```

**Raisons du choix Base :**
- ✅ Frais de transaction très bas
- ✅ Vitesse de confirmation rapide
- ✅ Écosystème Ethereum (compatibilité)
- ✅ Support Coinbase
- ✅ Sécurité héritée d'Ethereum

**Alternative configurable :**
```typescript
// Facile de changer vers une autre blockchain
const SUPPORTED_CHAINS = {
  base: { chainId: 8453, rpc: 'https://mainnet.base.org' },
  polygon: { chainId: 137, rpc: 'https://polygon-rpc.com' },
  arbitrum: { chainId: 42161, rpc: 'https://arb1.arbitrum.io/rpc' },
  // ... autres blockchains
};
```

---

### 4. ⏱️ Délai maximum en modération
**Valeur : Aucun délai (indéfini)**

- ✅ Les vidéos restent en `/pending` jusqu'à décision finale
- Pas de suppression automatique après X jours
- Le contenu reste jusqu'à ce qu'il soit :
  - ✅ Validé → déplacement vers `/success`
  - ❌ Refusé → suppression (brûlé)

**Logique :**
```typescript
// Pas de timeout automatique
const MODERATION_TIMEOUT = null; // Indéfini

// Le contenu reste en pending tant que:
while (status === 'PENDING_MODERATION') {
  // Continue d'accepter des votes
  // Affiché aux modérateurs selon priorité
  // Pas de suppression automatique
}

// Changement de status seulement si:
if (finalDecision === 'VALID') {
  moveToSuccess();
} else if (finalDecision === 'REFUSE') {
  deleteAndBurn();
}
```

**Priorité d'affichage :**
1. 🔴 Campagnes initiales < 22 votes (bloquantes)
2. 🟠 Échéance de campagne < 24h (si définie)
3. 🟢 Moins de votes = plus visible (pondération)

**Cas particuliers :**
- Une campagne peut définir sa **propre échéance** (deadline)
- Si échéance atteinte sans décision finale → Reste en pending
- L'équipe Winstory peut intervenir manuellement si nécessaire

---

## 📊 Résumé Configuration

| Paramètre | Valeur | Statut | Fichier config |
|-----------|--------|--------|----------------|
| **Échelle notation** | 0-100 | ✅ Implémenté | Hardcodé |
| **Min staking $WINC** | TBD | ⏳ Ultérieur | `.env` (futur) |
| **Blockchain votes** | Base | ✅ Défini | `.env` |
| **Délai modération** | Aucun | ✅ Défini | Logic dans code |

---

## 🔧 Variables d'environnement futures

### `.env.production` (à créer lors du lancement)

```bash
# ===================================
# MODÉRATION & BLOCKCHAIN
# ===================================

# Staking minimum (à définir)
MIN_WINC_STAKING_AMOUNT=100  # En $WINC

# Blockchain configuration
BLOCKCHAIN_NETWORK=base
BLOCKCHAIN_CHAIN_ID=8453
BLOCKCHAIN_RPC_URL=https://mainnet.base.org
VOTING_CONTRACT_ADDRESS=0x...  # À déployer

# Token $WINC
WINC_TOKEN_ADDRESS=0x...  # À déployer
WINC_TOKEN_DECIMALS=18

# ===================================
# MODÉRATION TIMEOUTS (optionnel)
# ===================================

# Pas de timeout pour l'instant
MODERATION_TIMEOUT_DAYS=null

# Mais possibilité d'alertes
MODERATION_WARNING_DAYS=7  # Alerte si > 7 jours sans votes

# ===================================
# AWS S3
# ===================================

AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=winstory-videos

# ===================================
# SUPABASE
# ===================================

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 🎯 Prochaines étapes d'implémentation

### Phase 1 : Actuel (Fonctionnel)
- ✅ Système de notation 0-100
- ✅ Validation unique des scores par modérateur
- ✅ Upload S3 vers `/pending`
- ✅ Pas de timeout modération

### Phase 2 : Blockchain (À venir)
- [ ] Déployer contrat de votes sur Base
- [ ] Intégrer signature de votes on-chain
- [ ] Interface wallet Web3 pour modération
- [ ] Events blockchain pour tracking votes

### Phase 3 : Token $WINC (À venir)
- [ ] Déployer token $WINC sur Base
- [ ] Implémenter système de staking
- [ ] Définir montant minimum staking
- [ ] Interface staking dans l'app

### Phase 4 : Analytics (Plus tard)
- [ ] Dashboard modération temps réel
- [ ] Alertes pour contenus > X jours en pending
- [ ] Statistiques par modérateur
- [ ] Leaderboard modérateurs

---

## 📝 Notes importantes

### Flexibilité du système

Le système est conçu pour être **hautement configurable** :

```typescript
// Exemple de configuration centralisée
export const MODERATION_CONFIG = {
  scoring: {
    min: 0,
    max: 100,
    uniquePerCampaign: true
  },
  
  staking: {
    minAmount: process.env.MIN_WINC_STAKING_AMOUNT || 100,
    tokenAddress: process.env.WINC_TOKEN_ADDRESS || null
  },
  
  blockchain: {
    network: process.env.BLOCKCHAIN_NETWORK || 'base',
    chainId: process.env.BLOCKCHAIN_CHAIN_ID || 8453
  },
  
  timeout: {
    moderationDays: null, // Aucun timeout
    warningDays: 7        // Alerte après 7 jours
  }
};
```

### Migration facile

Si besoin de changer de blockchain :

```typescript
// Avant (Base)
BLOCKCHAIN_NETWORK=base

// Après (Polygon)
BLOCKCHAIN_NETWORK=polygon
BLOCKCHAIN_CHAIN_ID=137

// Le code s'adapte automatiquement
```

---

## 🔐 Sécurité

### Smart Contracts à déployer

1. **VotingContract.sol** (Base)
   - Enregistrement votes
   - Vérification staking $WINC
   - Émission events

2. **WINCToken.sol** (Base)
   - Token ERC-20
   - Fonction staking
   - Governance

3. **ModerationRegistry.sol** (Base)
   - Registry modérateurs éligibles
   - Tracking réputation
   - Blacklist si nécessaire

---

## ✅ Configuration validée et prête !

**Tout est documenté, paramétrable et prêt pour l'implémentation future.**

### Actions immédiates : Aucune
Tous les paramètres sont soit déjà implémentés (notation 0-100), soit à configurer ultérieurement (staking, blockchain).

### Actions futures (Phase Token/Blockchain) :
1. Déployer token $WINC sur Base
2. Définir montant minimum staking
3. Déployer smart contracts de vote
4. Intégrer Web3 wallet dans modération

---

**📖 Consultez ce document lors de la phase de lancement pour paramétrer les valeurs finales !**

