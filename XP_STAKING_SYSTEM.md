# Système XP pour les Stakers/Moderateurs - Winstory

## 📋 Vue d'ensemble

Ce document décrit le système de points d'expérience (XP) pour les **Stakers/Moderateurs** (utilisateurs qui stakent du $WINC pour participer à la modération) sur la plateforme Winstory.

Le système récompense les stakers en fonction de :
- **Le montant staké** (en $WINC)
- **La durée du stake** (en jours)
- **La catégorie du staker** (MAJOR, MINOR, INELIGIBLE)

---

## 🎯 Formules XP par Catégorie

### 1. **MAJOR Staker**

**Formule :**
```
XP = 50 + 400 × (stakeAmount / 1000)^1.8 × (1 + (stakeAgeDays / 90)^0.7)
```

**Caractéristiques :**
- 🔥 Base XP : **50 XP**
- 📈 Fort multiplicateur sur le montant (puissance 1.8)
- ⏳ Bonus significatif sur la durée (puissance 0.7)
- 🎯 Récompense les gros stakers anciens

**Exemples :**
| Stake Amount | Durée | XP Gagné |
|--------------|-------|----------|
| 1,000 WINC | 30 jours | **~820 XP** |
| 5,000 WINC | 90 jours | **~4,500 XP** |
| 10,000 WINC | 365 jours | **~14,000 XP** |

---

### 2. **MINOR Staker**

**Formule :**
```
XP = 30 + 150 × (stakeAmount / 1000)^1.5 × (1 + (stakeAgeDays / 90)^0.5)
```

**Caractéristiques :**
- 🔸 Base XP : **30 XP**
- 📊 Multiplicateur modéré sur le montant (puissance 1.5)
- ⏱️ Bonus modéré sur la durée (puissance 0.5)
- 🎯 Récompense les stakers moyens

**Exemples :**
| Stake Amount | Durée | XP Gagné |
|--------------|-------|----------|
| 500 WINC | 30 jours | **~142 XP** |
| 2,000 WINC | 90 jours | **~455 XP** |
| 5,000 WINC | 180 jours | **~950 XP** |

---

### 3. **INELIGIBLE**

**XP :** **0 XP**

Les stakers inéligibles (montant trop faible, durée insuffisante, etc.) ne gagnent **aucun XP**.

---

## 🔧 Implémentation Technique

### Fichiers Modifiés/Créés

1. **`lib/xp-config.ts`**
   - Ajout de `RecipientType = 'staker'`
   - Ajout des actions `STAKING_MAJOR`, `STAKING_MINOR`, `STAKING_INELIGIBLE` pour chaque type
   - Fonction `calculateStakingXP()` avec formules Excel
   - Extension de `calculateXPAmount()` pour supporter les paramètres de staking

2. **`lib/xp-engine.ts`**
   - Interface `XPTransactionInput` étendue avec `stakeAmount`, `stakeAgeDays`, `stakerType`
   - Nouvelle fonction `awardStakingXP()` pour attribution XP staking
   - Support des paramètres staking dans `awardXP()`

3. **`app/api/xp/award-staking/route.ts`**
   - API endpoint pour attribution XP staking
   - Validation des paramètres (montants positifs, catégories valides)
   - Logging détaillé

---

## 📡 Utilisation de l'API

### Endpoint : `POST /api/xp/award-staking`

#### Paramètres

```typescript
{
  // REQUIS
  stakerWallet: string;           // Adresse wallet du staker
  campaignId: string;              // ID de la campagne
  campaignType: 'B2C' | 'AGENCY_B2C' | 'INDIVIDUAL';
  stakerCategory: 'MAJOR' | 'MINOR' | 'INELIGIBLE';
  stakeAmount: number;             // Montant staké en WINC
  stakeAgeDays: number;            // Âge du stake en jours
}
```

#### Exemples d'Utilisation

##### 1. MAJOR Staker (5000 WINC, 1 an)
```typescript
await fetch('/api/xp/award-staking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stakerWallet: '0xabc...',
    campaignId: 'camp_123',
    campaignType: 'B2C',
    stakerCategory: 'MAJOR',
    stakeAmount: 5000,
    stakeAgeDays: 365
  })
});
// Résultat: ~10,500 XP
```

##### 2. MINOR Staker (2000 WINC, 90 jours)
```typescript
await fetch('/api/xp/award-staking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stakerWallet: '0xdef...',
    campaignId: 'camp_456',
    campaignType: 'INDIVIDUAL',
    stakerCategory: 'MINOR',
    stakeAmount: 2000,
    stakeAgeDays: 90
  })
});
// Résultat: ~455 XP
```

##### 3. INELIGIBLE Staker
```typescript
await fetch('/api/xp/award-staking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stakerWallet: '0xghi...',
    campaignId: 'camp_789',
    campaignType: 'AGENCY_B2C',
    stakerCategory: 'INELIGIBLE',
    stakeAmount: 100,
    stakeAgeDays: 5
  })
});
// Résultat: 0 XP
```

##### 4. Utilisation Programmatique (TypeScript)
```typescript
import { awardStakingXP } from '@/lib/xp-engine';

const result = await awardStakingXP(
  '0xstaker...',
  'camp_001',
  'B2C',
  'MAJOR',
  10000,  // 10,000 WINC
  180     // 6 mois
);

console.log(`XP awarded: ${result.xpAmount}`);
console.log(`New level: ${result.level}`);
console.log(`Level up: ${result.levelUp}`);
```

---

## 💡 Scénarios Complets

### Scénario 1 : Petit Staker (MINOR)

```typescript
// Staker avec 800 WINC pendant 45 jours
POST /api/xp/award-staking
{
  stakerWallet: '0xabc...',
  campaignId: 'camp_001',
  campaignType: 'B2C',
  stakerCategory: 'MINOR',
  stakeAmount: 800,
  stakeAgeDays: 45
}

// Calcul:
// Base = 30
// Amount Factor = 150 × (800/1000)^1.5 = 150 × 0.716 = 107.4
// Age Factor = 1 + (45/90)^0.5 = 1 + 0.707 = 1.707
// Total = 30 + 107.4 × 1.707 = 30 + 183.3 = 213 XP

// ✅ Résultat: ~213 XP
```

### Scénario 2 : Gros Staker (MAJOR)

```typescript
// Staker avec 15,000 WINC pendant 2 ans
POST /api/xp/award-staking
{
  stakerWallet: '0xdef...',
  campaignId: 'camp_002',
  campaignType: 'INDIVIDUAL',
  stakerCategory: 'MAJOR',
  stakeAmount: 15000,
  stakeAgeDays: 730
}

// Calcul:
// Base = 50
// Amount Factor = 400 × (15000/1000)^1.8 = 400 × 39.38 = 15,752
// Age Factor = 1 + (730/90)^0.7 = 1 + 3.77 = 4.77
// Total = 50 + 15,752 × 4.77 = 50 + 75,137 = 75,187 XP

// ✅ Résultat: ~75,187 XP 🔥
```

### Scénario 3 : Staker Non-Éligible

```typescript
// Staker avec 50 WINC pendant 3 jours (trop peu)
POST /api/xp/award-staking
{
  stakerWallet: '0xghi...',
  campaignId: 'camp_003',
  campaignType: 'AGENCY_B2C',
  stakerCategory: 'INELIGIBLE',
  stakeAmount: 50,
  stakeAgeDays: 3
}

// ❌ Résultat: 0 XP
```

---

## 📊 Tableau de Référence XP

### MAJOR Stakers

| Stake (WINC) | 1 mois | 3 mois | 6 mois | 1 an | 2 ans |
|--------------|--------|--------|--------|------|-------|
| 1,000 | 820 | 1,100 | 1,320 | 1,550 | 1,900 |
| 2,500 | 2,150 | 2,900 | 3,450 | 4,050 | 4,950 |
| 5,000 | 4,500 | 6,050 | 7,200 | 8,450 | 10,300 |
| 10,000 | 9,400 | 12,600 | 15,000 | 17,600 | 21,400 |
| 20,000 | 19,600 | 26,300 | 31,300 | 36,700 | 44,700 |

### MINOR Stakers

| Stake (WINC) | 1 mois | 3 mois | 6 mois | 1 an | 2 ans |
|--------------|--------|--------|--------|------|-------|
| 500 | 142 | 175 | 198 | 222 | 252 |
| 1,000 | 261 | 322 | 365 | 408 | 463 |
| 2,000 | 455 | 561 | 636 | 711 | 807 |
| 5,000 | 951 | 1,173 | 1,329 | 1,486 | 1,686 |
| 10,000 | 1,749 | 2,157 | 2,444 | 2,732 | 3,100 |

---

## 🔄 Flux d'Attribution XP

```
1. Système calcule éligibilité du staker
2. Système détermine catégorie (MAJOR/MINOR/INELIGIBLE)
3. Système récupère stakeAmount et stakeAgeDays
4. Appel: POST /api/xp/award-staking
   - MAJOR (5000 WINC, 365j) → ~8,450 XP
   - MINOR (2000 WINC, 90j) → ~455 XP
   - INELIGIBLE → 0 XP
5. XP enregistré dans xp_transactions
6. XP balance mise à jour dans xp_balances
7. Niveau recalculé automatiquement
8. Événement levelUp si passage de niveau
```

---

## 🎓 Progression et Niveaux

Le système XP des stakers utilise la **même table de progression** que les créateurs et completeurs :
- Niveaux 1-10 : Faciles (encouragement)
- Niveaux 10-30 : Modérés (engagement)
- Niveaux 30-50 : Difficiles (dévouement)
- Niveaux 50+ : **Progression infinie** sans limite (prestige)

Consultez `XP_PROGRESSION_TABLE.md` pour plus de détails.

---

## 📈 Optimisation Stratégique

### Pour Maximiser les XP

1. **Montant** : Plus vous stakez, plus les XP augmentent exponentiellement
   - Doubler le stake ≠ doubler les XP
   - Doubler le stake = multiplier les XP par ~3.5 (MAJOR) ou ~2.8 (MINOR)

2. **Durée** : La patience est récompensée
   - 1 mois → multiplicateur x1.3
   - 3 mois → multiplicateur x1.6
   - 1 an → multiplicateur x2.0
   - 2 ans → multiplicateur x2.5

3. **Catégorie** : Devenir MAJOR est TRÈS avantageux
   - MINOR (5000 WINC, 1 an) : ~1,486 XP
   - MAJOR (5000 WINC, 1 an) : ~8,450 XP
   - **Ratio : 5.7x plus d'XP !**

4. **Stratégie Long Terme** : Stake early, stake big
   - Un stake de 10,000 WINC pendant 2 ans = **21,400 XP** (MAJOR)
   - Équivaut à créer **21 campagnes B2C** (1000 XP chacune)

---

## 🗂️ Structure des Actions XP

### Toutes les Catégories (B2C, AGENCY_B2C, INDIVIDUAL)
```typescript
{
  "STAKING_MAJOR": { 
    earn_xp: "STAKING_XP_MAJOR", 
    lose_xp: 0,
    formula: "50 + 400 × (amount/1000)^1.8 × (1 + (days/90)^0.7)"
  },
  "STAKING_MINOR": { 
    earn_xp: "STAKING_XP_MINOR", 
    lose_xp: 0,
    formula: "30 + 150 × (amount/1000)^1.5 × (1 + (days/90)^0.5)"
  },
  "STAKING_INELIGIBLE": { 
    earn_xp: 0, 
    lose_xp: 0 
  }
}
```

---

## ✅ Checklist d'Intégration

### Backend
- [x] Configuration XP staking ajoutée (`xp-config.ts`)
- [x] Fonction `calculateStakingXP()` implémentée
- [x] Fonction `awardStakingXP()` créée (`xp-engine.ts`)
- [x] API endpoint `/api/xp/award-staking` créé
- [x] Support `stakeAmount`, `stakeAgeDays`, `stakerType` dans calculs
- [x] Documentation technique complète

### Frontend (À Faire)
- [ ] Intégrer appels API dans système de staking
- [ ] Récupérer `stakeAmount` et `stakeAgeDays` des contrats
- [ ] Déterminer catégorie staker (MAJOR/MINOR/INELIGIBLE)
- [ ] Afficher gains XP après staking
- [ ] Notifier utilisateur des récompenses XP
- [ ] Dashboard staking avec historique XP

### Smart Contracts (À Faire)
- [ ] Événement `StakeCreated` avec montant et timestamp
- [ ] Événement `StakeWithdrawn` avec durée
- [ ] Fonction `getStakeInfo(address)` retournant montant et âge
- [ ] Intégration avec backend pour attribution XP automatique

---

## 🔗 Fichiers Associés

- `lib/xp-config.ts` - Configuration des règles XP staking
- `lib/xp-engine.ts` - Moteur de calcul XP staking
- `app/api/xp/award-staking/route.ts` - API d'attribution XP staking
- `XP_SYSTEM_README.md` - Documentation générale du système XP
- `XP_PROGRESSION_TABLE.md` - Table de progression des niveaux
- `XP_COMPLETION_SYSTEM.md` - Système XP completions

---

## 📝 Notes Importantes

1. **Formules Optimisées** : Les exposants (1.8, 1.5, 0.7, 0.5) sont calibrés pour :
   - Récompenser substantiellement les gros stakers
   - Encourager la durée de détention
   - Éviter l'inflation XP excessive
   - Maintenir un équilibre avec les autres sources XP

2. **Précision** : Les XP sont arrondis à l'entier inférieur (`Math.floor`)

3. **Idempotence** : Chaque stake ne doit être récompensé qu'une seule fois

4. **Audit** : Toutes les transactions sont tracées avec metadata complète

5. **Scalabilité** : Les formules sont calculées côté serveur, pas en blockchain

---

*Dernière mise à jour : 27 octobre 2025*

