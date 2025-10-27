# Système XP pour les Completeurs - Winstory

## 📋 Vue d'ensemble

Ce document décrit le système de points d'expérience (XP) pour les **Completeurs** (utilisateurs qui soumettent des completions de campagnes) sur la plateforme Winstory.

Le système est cohérent avec celui des Créateurs et gère différemment les XP selon :
- **Le type de campagne** (B2C, Agency B2C, Individual)
- **Le statut de paiement** (gratuit vs payant pour B2C/Agency)
- **Le résultat de modération** (validé vs refusé)
- **La valeur MINT** (pour Individual)

---

## 🎯 Règles XP par Type de Campagne

### 1. **B2C & Agency B2C**

#### Soumission de Completion
| Action | Condition | XP Gagné |
|--------|-----------|----------|
| **Completion gratuite** | Mission gratuite | **+100 XP** |
| **Completion payante** | Mission payante | **+100 XP + Prix de la mission** |

#### Résultat de Modération
| Action | XP Gagné/Perdu |
|--------|----------------|
| **Completion validée** | **+100 XP** (bonus) |
| **Completion refusée** | **-50 XP** (pénalité) |

#### Modérateurs
| Action | XP Gagné/Perdu |
|--------|----------------|
| **Vote VALIDE** | **+2 XP** |
| **Vote REFUS** | **-1 XP** |

---

### 2. **Individual**

#### Soumission de Completion
| Action | XP Gagné |
|--------|----------|
| **Completion soumise** | **= Valeur MINT en $WINC** |

#### Résultat de Modération
| Action | XP Gagné/Perdu |
|--------|----------------|
| **Completion validée** | **+100 XP** (bonus) |
| **Completion refusée** | **- (MINT $WINC / 2)** |

#### Modérateurs
| Action | XP Gagné/Perdu |
|--------|----------------|
| **Vote VALIDE** | **+2 XP** |
| **Vote REFUS** | **-1 XP** |

---

## 🔧 Implémentation Technique

### Fichiers Modifiés/Créés

1. **`lib/xp-config.ts`** 
   - Ajout des actions de completion pour chaque type d'utilisateur
   - Support des formules dynamiques : `100 + PRICE_COMPLETION`, `MINT_VALUE_$WINC`

2. **`lib/xp-engine.ts`**
   - Fonction `awardCompletionXP()` mise à jour avec support multi-types
   - Nouvelle fonction `awardCompletionModerationXP()` pour les modérateurs
   - Support de `priceCompletion` dans les calculs XP

3. **`app/api/xp/award-completion/route.ts`**
   - API mise à jour pour accepter tous les paramètres nécessaires
   - Validation des types de campagne

---

## 📡 Utilisation de l'API

### Endpoint : `POST /api/xp/award-completion`

#### Paramètres

```typescript
{
  // REQUIS
  completerWallet: string;      // Adresse wallet du compléteur
  campaignId: string;            // ID de la campagne
  completionId: string;          // ID de la completion
  campaignType: 'B2C' | 'AGENCY_B2C' | 'INDIVIDUAL';
  
  // OPTIONNELS
  isValidated?: boolean;         // true si completion validée
  isRefused?: boolean;           // true si completion refusée
  isPaid?: boolean;              // true si mission payante (B2C/Agency)
  priceCompletion?: number;      // Prix de la mission (pour payantes)
  mintValueWINC?: number;        // Valeur MINT en WINC (pour Individual)
}
```

#### Exemples d'Utilisation

##### 1. Soumission B2C Gratuite
```typescript
await fetch('/api/xp/award-completion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    completerWallet: '0xabc...',
    campaignId: 'camp_123',
    completionId: 'comp_456',
    campaignType: 'B2C',
    isPaid: false
  })
});
// Résultat: +100 XP
```

##### 2. Soumission B2C Payante (500 USD)
```typescript
await fetch('/api/xp/award-completion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    completerWallet: '0xabc...',
    campaignId: 'camp_123',
    completionId: 'comp_456',
    campaignType: 'B2C',
    isPaid: true,
    priceCompletion: 500
  })
});
// Résultat: +600 XP (100 + 500)
```

##### 3. Validation de Completion
```typescript
await fetch('/api/xp/award-completion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    completerWallet: '0xabc...',
    campaignId: 'camp_123',
    completionId: 'comp_456',
    campaignType: 'B2C',
    isValidated: true
  })
});
// Résultat: +100 XP (bonus validation)
```

##### 4. Refus de Completion
```typescript
await fetch('/api/xp/award-completion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    completerWallet: '0xabc...',
    campaignId: 'camp_123',
    completionId: 'comp_456',
    campaignType: 'B2C',
    isRefused: true
  })
});
// Résultat: -50 XP (pénalité)
```

##### 5. Soumission Individual (2000 WINC)
```typescript
await fetch('/api/xp/award-completion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    completerWallet: '0xabc...',
    campaignId: 'camp_123',
    completionId: 'comp_456',
    campaignType: 'INDIVIDUAL',
    mintValueWINC: 2000
  })
});
// Résultat: +2000 XP
```

##### 6. Vote Modérateur (Validation)
```typescript
import { awardCompletionModerationXP } from '@/lib/xp-engine';

const result = await awardCompletionModerationXP(
  '0xmoderator...',
  'camp_123',
  'comp_456',
  'B2C',
  'VALID'
);
// Résultat: +2 XP pour le modérateur
```

---

## 💡 Scénarios Complets

### Scénario 1 : Completion B2C Payante Validée

```typescript
// 1. Soumission (payante 300 USD)
POST /api/xp/award-completion
{
  completerWallet: '0xabc...',
  campaignId: 'camp_001',
  completionId: 'comp_001',
  campaignType: 'B2C',
  isPaid: true,
  priceCompletion: 300
}
// ✅ +400 XP (100 base + 300 prix)

// 2. Modération (3 modérateurs votent VALID)
awardCompletionModerationXP('0xmod1...', 'camp_001', 'comp_001', 'B2C', 'VALID'); // +2 XP
awardCompletionModerationXP('0xmod2...', 'camp_001', 'comp_001', 'B2C', 'VALID'); // +2 XP
awardCompletionModerationXP('0xmod3...', 'camp_001', 'comp_001', 'B2C', 'VALID'); // +2 XP

// 3. Validation finale
POST /api/xp/award-completion
{
  completerWallet: '0xabc...',
  campaignId: 'camp_001',
  completionId: 'comp_001',
  campaignType: 'B2C',
  isValidated: true
}
// ✅ +100 XP (bonus validation)

// TOTAL COMPLÉTEUR : +500 XP
// TOTAL MODÉRATEURS : +6 XP (3 x +2 XP)
```

### Scénario 2 : Completion Individual Refusée

```typescript
// 1. Soumission (5000 WINC)
POST /api/xp/award-completion
{
  completerWallet: '0xdef...',
  campaignId: 'camp_002',
  completionId: 'comp_002',
  campaignType: 'INDIVIDUAL',
  mintValueWINC: 5000
}
// ✅ +5000 XP

// 2. Modération (2 VALID, 3 REFUSE)
awardCompletionModerationXP('0xmod1...', 'camp_002', 'comp_002', 'INDIVIDUAL', 'VALID');   // +2 XP
awardCompletionModerationXP('0xmod2...', 'camp_002', 'comp_002', 'INDIVIDUAL', 'VALID');   // +2 XP
awardCompletionModerationXP('0xmod3...', 'camp_002', 'comp_002', 'INDIVIDUAL', 'REFUSE');  // -1 XP
awardCompletionModerationXP('0xmod4...', 'camp_002', 'comp_002', 'INDIVIDUAL', 'REFUSE');  // -1 XP
awardCompletionModerationXP('0xmod5...', 'camp_002', 'comp_002', 'INDIVIDUAL', 'REFUSE');  // -1 XP

// 3. Refus final (majorité REFUSE)
POST /api/xp/award-completion
{
  completerWallet: '0xdef...',
  campaignId: 'camp_002',
  completionId: 'comp_002',
  campaignType: 'INDIVIDUAL',
  isRefused: true,
  mintValueWINC: 5000
}
// ❌ -2500 XP (5000 / 2)

// TOTAL COMPLÉTEUR : +2500 XP (5000 - 2500)
// TOTAL MODÉRATEURS : +1 XP (4 - 3)
```

---

## 🗂️ Structure des Actions XP

### B2C
```typescript
{
  "Completion_Submit_B2C_Free": { earn_xp: 100, lose_xp: 0 },
  "Completion_Submit_B2C_Paid": { earn_xp: "100 + PRICE_COMPLETION", lose_xp: 0 },
  "Completion_Validated_B2C": { earn_xp: 100, lose_xp: 0 },
  "Completion_Refused_B2C": { earn_xp: 0, lose_xp: 50 },
  "Completion_Moderation_Validated": { earn_xp: 2, lose_xp: 0 },
  "Completion_Moderation_Refused": { earn_xp: 0, lose_xp: 1 }
}
```

### AGENCY_B2C
```typescript
{
  "Completion_Submit_Agency_Free": { earn_xp: 100, lose_xp: 0 },
  "Completion_Submit_Agency_Paid": { earn_xp: "100 + PRICE_COMPLETION", lose_xp: 0 },
  "Completion_Validated_Agency": { earn_xp: 100, lose_xp: 0 },
  "Completion_Refused_Agency": { earn_xp: 0, lose_xp: 50 },
  "Completion_Moderation_Validated": { earn_xp: 2, lose_xp: 0 },
  "Completion_Moderation_Refused": { earn_xp: 0, lose_xp: 1 }
}
```

### INDIVIDUAL
```typescript
{
  "Completion_Submit_Individual": { earn_xp: "MINT_VALUE_$WINC", lose_xp: 0 },
  "Completion_Validated_Individual": { earn_xp: 100, lose_xp: 0 },
  "Completion_Refused_Individual": { earn_xp: 0, lose_xp: "MINT_VALUE_$WINC / 2" },
  "Completion_Moderation_Validated": { earn_xp: 2, lose_xp: 0 },
  "Completion_Moderation_Refused": { earn_xp: 0, lose_xp: 1 }
}
```

---

## ✅ Checklist d'Intégration

Pour intégrer le système XP des completions dans votre flux applicatif :

- [x] **Soumission de completion** : Appeler l'API avec les bons paramètres (campaignType, isPaid, priceCompletion, mintValueWINC)
- [x] **Vote de modération** : Utiliser `awardCompletionModerationXP()` pour chaque vote
- [x] **Validation finale** : Appeler l'API avec `isValidated: true`
- [x] **Refus final** : Appeler l'API avec `isRefused: true` + mintValueWINC pour Individual
- [ ] **Affichage XP en temps réel** : Mettre à jour le dashboard après chaque action
- [ ] **Notifications** : Alerter l'utilisateur des gains/pertes XP
- [ ] **Historique** : Afficher l'historique des transactions XP via `/api/xp/transactions`

---

## 🎓 Progression et Niveaux

Le système XP des completions utilise la **même table de progression** que les créateurs :
- Niveaux 1-10 : 100 XP × 1.35^n (faciles)
- Niveaux 10-30 : Progression modérée
- Niveaux 30-50 : Difficiles
- Niveaux 50+ : **Progression infinie** sans limite

Consultez `XP_PROGRESSION_TABLE.md` pour plus de détails.

---

## 🔗 Fichiers Associés

- `lib/xp-config.ts` - Configuration des règles XP
- `lib/xp-engine.ts` - Moteur de calcul et attribution XP
- `app/api/xp/award-completion/route.ts` - API d'attribution XP completions
- `XP_SYSTEM_README.md` - Documentation générale du système XP
- `XP_PROGRESSION_TABLE.md` - Table de progression des niveaux

---

## 📝 Notes Importantes

1. **Idempotence** : Les transactions XP sont enregistrées avec des IDs uniques pour éviter les doublons
2. **Atomicité** : Les calculs XP et niveaux sont gérés par des fonctions PostgreSQL atomiques
3. **Audit** : Toutes les transactions sont tracées avec timestamps, metadata et auteur
4. **Rollback** : En cas d'erreur, les transactions XP peuvent être annulées manuellement via la base de données

---

*Dernière mise à jour : 27 octobre 2025*

