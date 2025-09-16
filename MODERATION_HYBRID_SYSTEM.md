# Système de Modération Hybride 50/50 - Winstory

## Vue d'ensemble

Le système de modération hybride implémente un modèle 50/50 qui combine démocratie (1 compte = 1 voix) et ploutocratie (1 $WINC staké = 1 poids) pour éviter les attaques Sybil tout en préservant l'aspect communautaire.

## Fonctionnalités principales

### 1. Évaluation Hybride 50/50

- **Poids démocratique** : 50% basé sur le nombre de votes
- **Poids ploutocratique** : 50% basé sur le montant staké
- **Seuil de décision** : Ratio 2:1 entre majoritaire et minoritaire
- **VictoryFactor** : Mesure la solidité de la victoire (influence XP et récompenses)

### 2. Types de contenu supportés

- `INITIAL_B2C` : Contenu initial B2C (1000 USDC, 510 aux stakers)
- `INITIAL_AGENCY_B2C` : Contenu initial Agence B2C
- `COMPLETION_PAID_B2C` : Complétion payante (40% aux modérateurs)
- `COMPLETION_FREE_B2C` : Complétion gratuite (XP uniquement)
- `INITIAL_INDIVIDUAL` : Contenu individuel (logique existante)
- `COMPLETION_INDIVIDUAL` : Complétion individuelle (logique existante)

### 3. Calcul des récompenses

#### Pools de récompenses
- **ActivePool** : 90% des récompenses aux participants actifs
- **PassivePool** : 10% aux participants passifs (redistribué si tous participent)
- **PenaltyPool** : Pénalités des minoritaires redistribuées aux majoritaires

#### VictoryFactor
- **Victoire écrasante** (0.9 vs 0.1) : VictoryFactor ≈ 0.89
- **Victoire serrée** (0.52 vs 0.48) : VictoryFactor ≈ 0.076
- **Influence** : Multiplie les gains/XP des majoritaires, réduit ceux des minoritaires

## Utilisation

### 1. Évaluation de modération

```typescript
import { evaluateModeration, ModerationStatus } from '@/lib/moderation-engine';

const result = evaluateModeration(
  20, // votesYes
  5,  // votesNo
  BigInt(8000 * 1e18), // stakeYes (8000 WINC)
  BigInt(2000 * 1e18), // stakeNo (2000 WINC)
  1000, // mintPriceUSDC
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
);

if (result.status === ModerationStatus.VALIDATED) {
  console.log('Contenu validé !');
  console.log('VictoryFactor:', Number(result.victoryFactor) / 1e18);
}
```

### 2. Calcul des paiements

```typescript
import { computePayoutsAndXP, ContentType, ParticipantData } from '@/lib/moderation-engine';

const participantsActive: ParticipantData[] = [
  { address: '0x1', stakeWINC: BigInt(1000 * 1e18), voteChoice: 'YES' },
  { address: '0x2', stakeWINC: BigInt(2000 * 1e18), voteChoice: 'YES' },
  { address: '0x3', stakeWINC: BigInt(500 * 1e18), voteChoice: 'NO' },
];

const payoutResult = computePayoutsAndXP(
  ContentType.INITIAL_B2C,
  1000, // priceUSDC
  20,   // votesYes
  5,    // votesNo
  BigInt(8000 * 1e18), // stakeYes
  BigInt(2000 * 1e18), // stakeNo
  participantsActive,
  [], // participantsPassive
  BigInt(1e18) // wincPerUSDC
);

console.log('Payouts:', payoutResult.payouts);
console.log('Penalties:', payoutResult.penalties);
```

### 3. Hook React

```typescript
import { useHybridModeration } from '@/lib/hooks/useHybridModeration';

const MyComponent = () => {
  const {
    moderationResult,
    payoutResult,
    isLoading,
    victoryFactor,
    scores
  } = useHybridModeration({
    votesYes: 20,
    votesNo: 5,
    stakeYes: 8000,
    stakeNo: 2000,
    mintPriceUSDC: 1000,
    contentType: ContentType.INITIAL_B2C,
    priceUSDC: 1000
  });

  return (
    <div>
      <p>Statut: {moderationResult?.status}</p>
      <p>VictoryFactor: {(victoryFactor * 100).toFixed(1)}%</p>
      <p>Score OUI: {(scores.scoreYes * 100).toFixed(1)}%</p>
      <p>Score NON: {(scores.scoreNo * 100).toFixed(1)}%</p>
    </div>
  );
};
```

## Exemples de scénarios

### 1. Whale vs Micro-stakers

```typescript
// Whale: 1 vote, 48M WINC
// Micro-stakers: 21 votes, 0.21 WINC total
const result = evaluateModeration(
  1,  // votesYes (whale)
  21, // votesNo (micro-stakers)
  BigInt(4839211175 * 1e18), // stakeYes (whale)
  BigInt(21 * 1e18 / 100),   // stakeNo (micro-stakers)
  1000, // mintPriceUSDC
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
);

// Résultat: EN_COURS (le poids démocratique des micro-stakers
// équilibre le poids ploutocratique de la whale)
```

### 2. Communauté engagée vs Whale isolée

```typescript
// Whale: 1 vote, 1000 WINC
// Communauté: 21 votes, 12600 WINC total
const result = evaluateModeration(
  1,   // votesYes (whale)
  21,  // votesNo (communauté)
  BigInt(1000 * 1e18),  // stakeYes (whale)
  BigInt(12600 * 1e18), // stakeNo (communauté)
  1000, // mintPriceUSDC
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
);

// Résultat: REJECTED (la communauté l'emporte)
```

### 3. Décision serrée

```typescript
// Cas équilibré
const result = evaluateModeration(
  10, // votesYes
  5,  // votesNo
  BigInt(1000 * 1e18), // stakeYes
  BigInt(2000 * 1e18), // stakeNo
  1000, // mintPriceUSDC
  Date.now(),
  Date.now() + 7 * 24 * 3600 * 1000
);

// Résultat: EN_COURS (ratio < 2:1)
```

## Configuration

### Constantes

```typescript
export const SCALE = 1e18; // Fixed-point arithmetic
export const MIN_VOTERS = 22; // Minimum de stakers requis
export const THRESHOLD_RATIO = 2; // Ratio majoritaire/minoritaire
```

### Types de contenu

```typescript
export const CONTENT_TYPE_CONFIG = {
  [ContentType.INITIAL_B2C]: {
    mintPriceUSDC: 1000,
    rewardPoolPercentage: 0.51, // 510 USDC sur 1000
    winstoryPercentage: 0.49,   // 490 USDC sur 1000
    activePoolPercentage: 0.90, // 90% aux actifs
    passivePoolPercentage: 0.10 // 10% aux passifs
  },
  // ... autres types
};
```

### Configuration XP

```typescript
export const XP_CONFIG = {
  [ContentType.INITIAL_B2C]: { 
    baseXP: 10, 
    minorityFactor: 0.25, 
    passiveFactor: 0.1 
  },
  [ContentType.COMPLETION_FREE_B2C]: { 
    baseXP: 100, // XP boosté pour les complétions gratuites
    minorityFactor: 0.25, 
    passiveFactor: 0.1 
  },
  // ... autres types
};
```

## API Endpoints

### POST /api/moderation/hybrid-evaluation

Évalue une modération et calcule les paiements.

**Body:**
```json
{
  "votesYes": 20,
  "votesNo": 5,
  "stakeYes": "8000000000000000000000",
  "stakeNo": "2000000000000000000000",
  "mintPriceUSDC": 1000,
  "contentType": "INITIAL_B2C",
  "priceUSDC": 1000,
  "participantsActive": [...],
  "participantsPassive": [...],
  "wincPerUSDC": "1000000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "moderationResult": {
    "status": "VALIDATED",
    "winner": "YES",
    "scoreYes": "500000000000000000000",
    "scoreNo": "200000000000000000000",
    "victoryFactor": "600000000000000000000",
    "reason": "VALIDATED"
  },
  "payoutResult": {
    "payouts": [...],
    "penalties": [...],
    "summary": {...}
  }
}
```

## Tests

Exécuter les tests unitaires :

```bash
npm test lib/__tests__/moderation-engine.test.ts
```

Les tests couvrent :
- Évaluation de modération (cas normaux et edge cases)
- Calcul des paiements et XP
- VictoryFactor
- Scénarios whale vs micro-stakers
- Gestion des erreurs

## Migration depuis l'ancien système

1. **Remplacer** `ModerationProgressPanel` par `ModerationProgressPanelHybrid`
2. **Utiliser** `useHybridModeration` au lieu de `useModeration` pour les calculs
3. **Mettre à jour** les appels API vers `/api/moderation/hybrid-evaluation`
4. **Adapter** la logique de paiement pour utiliser `computePayoutsAndXP`

## Sécurité

- **Fixed-point arithmetic** : Évite les erreurs de précision
- **Validation des entrées** : Vérification des données avant traitement
- **Protection contre les attaques Sybil** : Système hybride 50/50
- **Gestion des edge cases** : Zéro stakes, égalités, etc.

## Performance

- **Calculs optimisés** : Arithmétique en fixed-point
- **Cache** : Résultats mis en cache dans les hooks React
- **Auto-refresh** : Mise à jour automatique configurable
- **API efficace** : Endpoint unique pour évaluation et paiements
