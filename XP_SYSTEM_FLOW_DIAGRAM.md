# Système XP Winstory - Diagrammes de Flux

## 📊 Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                     WINSTORY XP SYSTEM                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │   B2C   │         │ AGENCY  │         │INDIVIDUAL│
    │         │         │   B2C   │         │         │
    └─────────┘         └─────────┘         └─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   XP ENGINE      │
                    │  (xp-engine.ts)  │
                    └──────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│xp_transactions  │  │  xp_balances    │  │agency_b2c_      │
│  (historique)   │  │  (solde actuel) │  │   clients       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 🔄 Flux de Création de Campagne B2C

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USER CREATES CAMPAIGN                                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. POST /api/campaigns/create                                │
│    {                                                          │
│      campaignType: 'B2C',                                    │
│      roiData: { unitValue: 1000 },                          │
│      film: { videoId: null },  ← Winstory creates           │
│      standardToken: null        ← No custom rewards         │
│    }                                                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. CAMPAIGN CREATED IN DATABASE                              │
│    campaign_id: "campaign_123..."                            │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. POST /api/xp/award-campaign-creation                      │
│    {                                                          │
│      userWallet: "0x123...",                                 │
│      campaignType: "B2C",                                    │
│      mintValueUSD: 1000,                                     │
│      options: {                                              │
│        winstoryCreatesVideo: true,   → +500 XP              │
│        noRewards: true                → +1000 XP            │
│      }                                                        │
│    }                                                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. XP ENGINE PROCESSES                                       │
│                                                               │
│    Base MINT:        +1000 XP                                │
│    Winstory Video:   +500 XP                                 │
│    No Rewards:       +1000 XP                                │
│    ─────────────────────────                                 │
│    TOTAL:            +2500 XP                                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. DATABASE UPDATES                                          │
│                                                               │
│    xp_transactions:                                          │
│    ├─ B2C_MINT: +1000 XP                                    │
│    ├─ OPTION_WINSTORY_VIDEO: +500 XP                        │
│    └─ OPTION_NO_REWARDS: +1000 XP                           │
│                                                               │
│    xp_balances:                                              │
│    ├─ total_xp: 0 → 2500                                    │
│    ├─ current_level: 1 → 6                                  │
│    └─ xp_to_next_level: 100 → 1500                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. SUCCESS RESPONSE                                          │
│    Campaign created + 2500 XP awarded                        │
│    Level up: 1 → 6 🎉                                        │
└──────────────────────────────────────────────────────────────┘
```

## 🗳️ Flux de Vote de Modération

```
┌──────────────────────────────────────────────────────────────┐
│ 1. MODERATOR VOTES ON CAMPAIGN                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. POST /api/moderation/vote-staking                         │
│    {                                                          │
│      campaignId: "campaign_123...",                          │
│      moderatorWallet: "0x456...",                            │
│      voteDecision: "VALID",                                  │
│      stakedAmount: 100                                       │
│    }                                                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. VOTE SAVED IN DATABASE                                    │
│    moderation_votes table                                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. GET CAMPAIGN TYPE                                         │
│    Query campaigns table → creator_type: "FOR_B2C"          │
│    Map to campaignType: "B2C"                                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. POST /api/xp/award-moderation                             │
│    {                                                          │
│      type: "vote",                                           │
│      moderatorWallet: "0x456...",                            │
│      campaignId: "campaign_123...",                          │
│      campaignType: "B2C",                                    │
│      voteDecision: "VALID"                                   │
│    }                                                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. XP ENGINE PROCESSES                                       │
│                                                               │
│    Vote VALID → +2 XP for moderator                         │
│    (or Vote REFUSE → -1 XP)                                  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. DATABASE UPDATES                                          │
│                                                               │
│    xp_transactions:                                          │
│    └─ MODERATION_VALIDATED_BY_MODERATOR: +2 XP             │
│                                                               │
│    xp_balances:                                              │
│    ├─ total_xp: +2                                          │
│    └─ total_moderations: +1                                 │
└──────────────────────────────────────────────────────────────┘
```

## 🎬 Flux de Complétion

```
┌──────────────────────────────────────────────────────────────┐
│ A. COMPLETION SUBMISSION FLOW                                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. USER SUBMITS COMPLETION                                   │
│    POST /api/completions/submit                              │
│    { campaignId, completerWallet, videoUrl, ... }           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. COMPLETION CREATED                                        │
│    completions table: status = 'in_progress'                 │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. AWARD SUBMISSION XP                                       │
│    POST /api/xp/award-completion                             │
│    { completerWallet, campaignId, completionId,             │
│      isValidated: false }                                    │
│                                                               │
│    → +10 XP awarded immediately                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ (Later, after moderation...)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ B. COMPLETION VALIDATION FLOW                                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. MODERATORS VOTE ON COMPLETION                             │
│    Average score calculated: 100/100 ✨                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. VALIDATE COMPLETION                                       │
│    POST /api/completions/validate                            │
│    { completionId, finalScore: 100, decision: 'approved' }  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. UPDATE COMPLETION STATUS                                  │
│    completions table:                                        │
│    ├─ status = 'completed'                                   │
│    ├─ score_avg = 100                                        │
│    ├─ validation_status = 'approved'                         │
│    └─ validation_conditions_met = true                       │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. AWARD 100% BONUS XP                                       │
│    POST /api/xp/award-completion                             │
│    { completerWallet, campaignId, completionId,             │
│      isValidated: true }                                     │
│                                                               │
│    → +100 XP bonus awarded! 🎉                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. TOTAL XP FOR COMPLETER                                    │
│                                                               │
│    Submission:       +10 XP                                  │
│    100% Validation:  +100 XP                                 │
│    ───────────────────────                                   │
│    TOTAL:            +110 XP                                 │
└──────────────────────────────────────────────────────────────┘
```

## 🏢 Flux Agency B2C Client

```
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1: CAMPAIGN CREATION (Agency)                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. AGENCY CREATES CAMPAIGN                                   │
│    POST /api/campaigns/create                                │
│    {                                                          │
│      campaignType: 'AGENCY_B2C',                            │
│      agencyInfo: { email: 'agency@example.com' },          │
│      clientInfo: {                                          │
│        contactEmail: 'client@example.com',                 │
│        companyName: 'Client Corp'                          │
│      }                                                        │
│    }                                                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. AGENCY RECEIVES XP                                        │
│    MINT: +1000 XP → Agency wallet                           │
│    No Rewards option: +1000 XP → Agency wallet              │
│    TOTAL: +2000 XP for agency                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. CLIENT REGISTERED FOR FUTURE XP                          │
│    POST /api/xp/agency-client (action: 'register')          │
│                                                               │
│    agency_b2c_clients table:                                 │
│    ├─ agency_wallet: "0x_agency..."                          │
│    ├─ client_email: "client@example.com"                     │
│    ├─ xp_granted: false ⏳                                   │
│    └─ campaign_id: "campaign_123..."                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ (Days or weeks later...)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ PHASE 2: CLIENT ONBOARDING                                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. CLIENT CONNECTS TO WINSTORY                               │
│    First time login with email: client@example.com          │
│    Wallet: 0x_client...                                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. CHECK FOR PENDING XP                                      │
│    POST /api/xp/agency-client (action: 'onboard')           │
│    {                                                          │
│      clientEmail: 'client@example.com',                      │
│      clientWallet: '0x_client...'                            │
│    }                                                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. FIND CLIENT RECORD                                        │
│    Query agency_b2c_clients:                                 │
│    WHERE client_email = 'client@example.com'                │
│      AND xp_granted = false                                  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. AWARD ONBOARDING XP TO CLIENT                            │
│    +1000 XP → Client wallet (NOT agency!) 🎉                │
│                                                               │
│    xp_transactions:                                          │
│    └─ B2C_CLIENT_ONBOARDED: +1000 XP                        │
│       recipient: client_wallet                               │
│       agency_wallet: stored for reference                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. UPDATE CLIENT RECORD                                      │
│    agency_b2c_clients:                                       │
│    ├─ client_wallet: "0x_client..."                          │
│    ├─ xp_granted: true ✅                                    │
│    └─ onboarded_at: NOW()                                    │
│                                                               │
│    → Prevents double XP award                                │
└──────────────────────────────────────────────────────────────┘
```

## 📊 État de la Base de Données (Exemple)

```sql
-- Après toutes les actions ci-dessus

-- xp_balances
┌──────────────┬──────────┬─────────┬────────────────┐
│ user_wallet  │ total_xp │ level   │ xp_to_next     │
├──────────────┼──────────┼─────────┼────────────────┤
│ 0x_creator   │ 2500     │ 6       │ 1500 to lvl 7  │
│ 0x_moderator │ 2        │ 1       │ 98 to lvl 2    │
│ 0x_completer │ 110      │ 2       │ 140 to lvl 3   │
│ 0x_agency    │ 2000     │ 6       │ 1000 to lvl 7  │
│ 0x_client    │ 1000     │ 5       │ 1000 to lvl 6  │
└──────────────┴──────────┴─────────┴────────────────┘

-- xp_transactions (dernières 5)
┌──────────────┬──────────────────────────┬──────────┐
│ user_wallet  │ transaction_type          │ xp_amount│
├──────────────┼──────────────────────────┼──────────┤
│ 0x_client    │ B2C_CLIENT_ONBOARDED     │ +1000    │
│ 0x_completer │ COMPLETION_100_VALIDATED │ +100     │
│ 0x_completer │ COMPLETION_SUBMITTED     │ +10      │
│ 0x_moderator │ MODERATION_VALIDATED...  │ +2       │
│ 0x_creator   │ OPTION_NO_REWARDS        │ +1000    │
└──────────────┴──────────────────────────┴──────────┘
```

## 🔄 Cycle de Vie d'une Campagne avec XP

```
START
  │
  ├─> [CREATION]
  │     User creates campaign
  │     ↓
  │     +1000 XP (MINT)
  │     +500 XP (Video option)
  │     +1000 XP (No rewards)
  │     = +2500 XP total
  │
  ├─> [MODERATION]
  │     22 moderators vote
  │     ↓
  │     15 VALID: 15 × +2 XP = +30 XP total
  │     7 REFUSE: 7 × -1 XP = -7 XP total
  │     ↓
  │     Campaign APPROVED
  │     ↓
  │     Creator: +100 XP
  │
  ├─> [COMPLETION]
  │     50 users submit completions
  │     ↓
  │     50 × +10 XP = +500 XP total
  │     ↓
  │     10 reach 100% score
  │     ↓
  │     10 × +100 XP = +1000 XP total
  │
  └─> [END]
        Total XP distributed:
        - Creator: +2600 XP
        - Moderators: +23 XP combined
        - Completers: +1500 XP combined
        
        GRAND TOTAL: +4123 XP in ecosystem! 🎉
```

## 🎯 Points Clés de l'Architecture

### ✅ Séparation des Responsabilités
```
xp-config.ts     → Définit les règles (QUOI)
xp-engine.ts     → Exécute la logique (COMMENT)
API routes       → Expose les fonctionnalités (OÙ)
Database         → Stocke l'état et l'historique (PERSISTANCE)
```

### ✅ Résilience
```
Si XP échoue → L'action principale (campagne, vote, etc.) continue
Logs détaillés → Facile à débugger
Transactions atomiques → Pas d'états incohérents
```

### ✅ Traçabilité
```
Chaque XP → Transaction avec contexte complet
Balance séparée → Lookup rapide
Historique immuable → Audit complet
```

---

**Ces diagrammes montrent le flux complet du système XP intégré dans Winstory.**

