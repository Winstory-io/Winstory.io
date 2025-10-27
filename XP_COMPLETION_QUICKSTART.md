# 🚀 Quick Start - Système XP Completions

## Résumé Ultra-Rapide

### B2C & Agency B2C
| Action | XP |
|--------|-----|
| 📝 Soumission gratuite | **+100 XP** |
| 💰 Soumission payante | **+100 XP + Prix** |
| ✅ Validation | **+100 XP** |
| ❌ Refus | **-50 XP** |
| 👍 Moderator valide | **+2 XP** |
| 👎 Moderator refuse | **-1 XP** |

### Individual
| Action | XP |
|--------|-----|
| 📝 Soumission | **= MINT $WINC** |
| ✅ Validation | **+100 XP** |
| ❌ Refus | **- (MINT / 2)** |
| 👍 Moderator valide | **+2 XP** |
| 👎 Moderator refuse | **-1 XP** |

---

## 📡 API Usage

### Soumission
```typescript
POST /api/xp/award-completion
{
  completerWallet: "0x...",
  campaignId: "camp_123",
  completionId: "comp_456",
  campaignType: "B2C" | "AGENCY_B2C" | "INDIVIDUAL",
  isPaid?: boolean,
  priceCompletion?: number,
  mintValueWINC?: number
}
```

### Validation
```typescript
POST /api/xp/award-completion
{
  completerWallet: "0x...",
  campaignId: "camp_123",
  completionId: "comp_456",
  campaignType: "B2C",
  isValidated: true
}
```

### Refus
```typescript
POST /api/xp/award-completion
{
  completerWallet: "0x...",
  campaignId: "camp_123",
  completionId: "comp_456",
  campaignType: "INDIVIDUAL",
  isRefused: true,
  mintValueWINC: 5000
}
```

### Vote Modération
```typescript
import { awardCompletionModerationXP } from '@/lib/xp-engine';

await awardCompletionModerationXP(
  moderatorWallet,
  campaignId,
  completionId,
  campaignType,
  'VALID' | 'REFUSE'
);
```

---

## 💡 Exemples Rapides

**B2C Payant (300 USD) Validé**
- Soumission: +400 XP (100 + 300)
- 3 modérateurs validants: +6 XP total
- Validation: +100 XP
- **Total: +500 XP**

**Individual (2000 WINC) Refusé**
- Soumission: +2000 XP
- 2 validants, 3 refusants: +1 XP total modérateurs
- Refus: -1000 XP
- **Total: +1000 XP**

---

**Voir `XP_COMPLETION_SYSTEM.md` pour la documentation complète.**

