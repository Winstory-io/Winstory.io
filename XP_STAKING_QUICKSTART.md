# 🚀 Quick Start - Système XP Staking

## Résumé Ultra-Rapide

### Formules XP

**MAJOR Staker:**
```
XP = 50 + 400 × (stake/1000)^1.8 × (1 + (days/90)^0.7)
```

**MINOR Staker:**
```
XP = 30 + 150 × (stake/1000)^1.5 × (1 + (days/90)^0.5)
```

**INELIGIBLE:**
```
XP = 0
```

---

## 📊 Exemples Rapides

| Catégorie | Stake | Durée | XP |
|-----------|-------|-------|-----|
| MAJOR | 5,000 WINC | 1 an | **~8,450 XP** |
| MAJOR | 10,000 WINC | 6 mois | **~15,000 XP** |
| MINOR | 2,000 WINC | 90 jours | **~455 XP** |
| MINOR | 5,000 WINC | 1 an | **~1,486 XP** |
| INELIGIBLE | n'importe quoi | n'importe quoi | **0 XP** |

---

## 📡 API Usage

```typescript
POST /api/xp/award-staking
{
  stakerWallet: "0x...",
  campaignId: "camp_123",
  campaignType: "B2C" | "AGENCY_B2C" | "INDIVIDUAL",
  stakerCategory: "MAJOR" | "MINOR" | "INELIGIBLE",
  stakeAmount: 5000,      // en WINC
  stakeAgeDays: 365       // en jours
}
```

### Code TypeScript
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

console.log(`XP: ${result.xpAmount}`);
// Output: XP: ~15,000
```

---

## 💡 Conseils Rapides

1. **Plus vous stakez, plus c'est exponentiel**
   - 2× stake = ~3.5× XP (MAJOR)
   
2. **La patience paie**
   - 1 an = 2× plus qu'1 mois
   
3. **MAJOR >> MINOR**
   - Même stake/durée = 5-6× plus d'XP en MAJOR

4. **Stratégie optimale**
   - Gros montant + Longue durée + Catégorie MAJOR = 🚀

---

**Voir `XP_STAKING_SYSTEM.md` pour la documentation complète.**

