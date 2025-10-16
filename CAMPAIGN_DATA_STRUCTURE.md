# Campaign Data Structure - Référence Complète

## 📋 Guide de mapping Backend

Ce document liste **tous les champs disponibles** dans les données de campagne avec leurs **noms exacts** dans le code, pour faciliter le mapping avec votre base de données backend.

---

## 🏗️ Structure Globale

```typescript
{
  user: { ... },           // Informations utilisateur
  company: { ... },        // Informations entreprise
  story: { ... },          // Story (titre, texte, guideline)
  film: { ... },           // Vidéo/Film
  roiData: { ... },        // Données ROI (B2C)
  completions: { ... },    // Données completions (Individual)
  economicData: { ... },   // Simulation économique (Individual)
  standardToken: { ... },  // Rewards standard - tokens
  standardItem: { ... },   // Rewards standard - items
  premiumToken: { ... },   // Rewards premium - tokens
  premiumItem: { ... },    // Rewards premium - items
  unifiedConfig: { ... },  // Configuration unifiée rewards
  campaignType: string     // Type: "INDIVIDUAL" ou undefined (B2C)
}
```

---

## 👤 User Information

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| Email | `data.user.email` | string | Email de l'utilisateur |

### Exemple localStorage
```javascript
localStorage.getItem("user")
// → { "email": "contact@company.com" }
```

---

## 🏢 Company Information

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| Company Name | `data.company.name` | string | Nom de l'entreprise |

### Exemple localStorage
```javascript
localStorage.getItem("company")
// → { "name": "Nike" }
```

---

## 📖 Story Information

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| Title | `data.story.title` | string | Titre de la story |
| Starting Story | `data.story.startingStory` | string | Texte de la starting story |
| Guideline | `data.story.guideline` | string | Ligne directrice pour les completers |

### Exemple localStorage
```javascript
localStorage.getItem("story")
/* → {
  "title": "Just Do It",
  "startingStory": "In a world where...",
  "guideline": "Focus on inspiring content..."
} */
```

---

## 🎥 Film Information

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| AI Requested | `data.film.aiRequested` | boolean | Si Winstory doit créer la vidéo |
| Video ID | `data.film.videoId` | string | ID de la vidéo dans IndexedDB |
| File Name | `data.film.fileName` | string | Nom du fichier vidéo |
| File Size | `data.film.fileSize` | number | Taille en bytes |
| Format | `data.film.format` | string | "horizontal" ou "vertical" |
| URL | `data.film.url` | string | URL blob/base64 (temporaire) |

### Exemple localStorage
```javascript
localStorage.getItem("film")
/* → {
  "aiRequested": false,
  "videoId": "vid_1234567890",
  "fileName": "campaign_video.mp4",
  "fileSize": 26738688,
  "format": "horizontal",
  "url": "blob:http://..." // ou data:video/mp4;base64,...
} */
```

### Notes importantes
- `videoId` : Utilisé pour récupérer la vidéo depuis IndexedDB
- `url` : Temporaire, ne pas stocker en BDD
- `fileSize` : En bytes (diviser par 1024*1024 pour MB)

---

## 💰 ROI/Rewards Data (B2C Flow)

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| Unit Value | `data.roiData.unitValue` | number | Valeur unitaire de completion ($) |
| Net Profit | `data.roiData.netProfit` | number | Profit net ciblé ($) |
| Max Completions | `data.roiData.maxCompletions` | number | Nombre max de completions |
| Free Reward | `data.roiData.isFreeReward` | boolean | Si rewards gratuits |
| No Reward | `data.roiData.noReward` | boolean | Si pas de rewards |

### Exemple localStorage
```javascript
localStorage.getItem("roiData")
/* → {
  "unitValue": 25,
  "netProfit": 5000,
  "maxCompletions": 440,
  "isFreeReward": false,
  "noReward": false
} */
```

---

## 🎯 Completions Data (Individual Flow)

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| Unit Price | `data.completions.unitPrice` | number | Prix unitaire par completion ($) |
| Max Completions | `data.completions.maxCompletions` | number | Nombre max de completions |
| Campaign Duration | `data.completions.campaignDuration` | number | Durée en jours |

### Exemple localStorage
```javascript
localStorage.getItem("completions")
/* → {
  "unitPrice": 5,
  "maxCompletions": 100,
  "campaignDuration": 7
} */
```

---

## 💰 Economic Simulation Data (Individual Flow)

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| MINT Price | `data.economicData.mint` | number | Prix du MINT ($) |
| Total Pool | `data.economicData.poolTotal` | number | Pool total ($) |
| Creator Gain | `data.economicData.creatorGain` | number | Gain créateur ($) |
| Creator Net Gain | `data.economicData.creatorNetGain` | number | Gain net créateur ($) |
| Is Profitable | `data.economicData.isCreatorProfitable` | boolean | Si créateur profitable |
| Completion Rate | `data.economicData.tauxCompletion` | number | Taux de completion (%) |
| Top 1 Reward | `data.economicData.top1` | number | Reward 1er ($) |
| Top 2 Reward | `data.economicData.top2` | number | Reward 2ème ($) |
| Top 3 Reward | `data.economicData.top3` | number | Reward 3ème ($) |
| Platform Share | `data.economicData.platform` | number | Part plateforme ($) |
| Moderators Share | `data.economicData.moderators` | number | Part modérateurs ($) |
| Gain Multiplier | `data.economicData.multiplicateurGain` | number | Multiplicateur gain |
| XP Multiplier | `data.economicData.multiplicateurXP` | number | Multiplicateur XP |
| Creator XP | `data.economicData.creatorXP` | number | XP du créateur |
| Is Minimum Reached | `data.economicData.isMinimumCompletionsReached` | boolean | Si minimum atteint |
| Is Refund Top 1 | `data.economicData.isRefundTop1` | boolean | Si remboursement top 1 |
| Is Refund Top 2 | `data.economicData.isRefundTop2` | boolean | Si remboursement top 2 |
| Is Refund Top 3 | `data.economicData.isRefundTop3` | boolean | Si remboursement top 3 |
| Platform Total | `data.economicData.platformTotal` | number | Total plateforme brut ($) |

### Note
Ces données sont calculées dynamiquement et ne sont PAS stockées dans localStorage avant le recap.

---

## 🎁 Standard Rewards - Token

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| Type | `data.standardToken.type` | string | "token" |
| Name | `data.standardToken.name` | string | Nom du token |
| Contract Address | `data.standardToken.contractAddress` | string | Adresse du contrat |
| Blockchain | `data.standardToken.blockchain` | string | Ethereum, Polygon, etc. |
| Standard | `data.standardToken.standard` | string | ERC20, ERC1155, SPL, BRC20 |
| Amount Per User | `data.standardToken.amountPerUser` | number | Montant par user |
| Total Amount | `data.standardToken.totalAmount` | string | Montant total (formaté) |
| Has Enough Balance | `data.standardToken.hasEnoughBalance` | boolean | Si balance suffisante |
| Wallet Address | `data.standardToken.walletAddress` | string | Adresse du wallet |
| Token Info | `data.standardToken.tokenInfo` | object | Infos du token (name, symbol, decimals, totalSupply, balance) |

### Exemple localStorage
```javascript
localStorage.getItem("standardTokenReward")
/* → {
  "type": "token",
  "name": "USDC",
  "contractAddress": "0x...",
  "blockchain": "Ethereum",
  "standard": "ERC20",
  "amountPerUser": 10,
  "totalAmount": "4400.00000",
  "hasEnoughBalance": true,
  "walletAddress": "0x...",
  "tokenInfo": {
    "name": "USD Coin",
    "symbol": "USDC",
    "decimals": 6,
    "totalSupply": "1000000",
    "balance": "5000"
  }
} */
```

---

## 🎁 Standard Rewards - Item

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| Type | `data.standardItem.type` | string | "item" |
| Name | `data.standardItem.name` | string | Nom de l'item |
| Contract Address | `data.standardItem.contractAddress` | string | Adresse du contrat NFT |
| Blockchain | `data.standardItem.blockchain` | string | Ethereum, Polygon, etc. |
| Standard | `data.standardItem.standard` | string | ERC721, ERC1155, etc. |
| Amount Per User | `data.standardItem.amountPerUser` | number | Nombre d'items par user |
| Wallet Address | `data.standardItem.walletAddress` | string | Adresse du wallet |

### Exemple localStorage
```javascript
localStorage.getItem("standardItemReward")
/* → {
  "type": "item",
  "name": "Nike NFT Sneaker",
  "contractAddress": "0x...",
  "blockchain": "Ethereum",
  "standard": "ERC721",
  "amountPerUser": 1,
  "walletAddress": "0x..."
} */
```

---

## 🏆 Premium Rewards - Token

### Structure identique à Standard Token

Champs disponibles via `data.premiumToken.*`

### Exemple localStorage
```javascript
localStorage.getItem("premiumTokenReward")
// → Structure identique à standardTokenReward
```

---

## 🏆 Premium Rewards - Item

### Structure identique à Standard Item

Champs disponibles via `data.premiumItem.*`

### Exemple localStorage
```javascript
localStorage.getItem("premiumItemReward")
// → Structure identique à standardItemReward
```

---

## 🎁 Autres types de Rewards

### Digital Exclusive Access
```javascript
localStorage.getItem("standardDigitalAccessReward")
localStorage.getItem("premiumDigitalAccessReward")
```

### Physical Exclusive Access
```javascript
localStorage.getItem("standardPhysicalAccessReward")
localStorage.getItem("premiumPhysicalAccessReward")
```

Structure similaire avec :
- `type`: "digital_access" ou "physical_access"
- `name`, `contractAddress`, `blockchain`, `amountPerUser`, etc.

---

## ⚙️ Unified Config

### Champs disponibles

| Nom du champ | Chemin d'accès | Type | Description |
|--------------|---------------|------|-------------|
| Standard Rewards | `data.unifiedConfig.standard` | array | Array de toutes les rewards standard |
| Premium Rewards | `data.unifiedConfig.premium` | array | Array de toutes les rewards premium |

### Exemple
```javascript
{
  unifiedConfig: {
    standard: [
      { type: "token", name: "USDC", ... },
      { type: "item", name: "NFT", ... }
    ],
    premium: [
      { type: "token", name: "ETH", ... }
    ]
  }
}
```

---

## 📊 Mapping avec Prisma Schema

### Table: `Campaign`

```prisma
model Campaign {
  id          String   @id @default(cuid())
  title       String                    // ← data.story.title
  description String?                   // ← data.story.startingStory
  status      CampaignStatus
  type        CampaignType              // B2C ou INDIVIDUAL
  creatorType CreatorType
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  creatorInfo    CreatorInfo?
  content        CampaignContent?
  rewards        CampaignRewards?
  metadata       CampaignMetadata?
}
```

### Table: `CreatorInfo`

```prisma
model CreatorInfo {
  id           String @id @default(cuid())
  campaignId   String @unique
  
  companyName  String?                  // ← data.company.name
  agencyName   String?                  // Si agency
  walletAddress String                  // ← data.standardToken.walletAddress
  email        String?                  // ← data.user.email
}
```

### Table: `CampaignContent`

```prisma
model CampaignContent {
  id           String @id @default(cuid())
  campaignId   String @unique
  
  videoUrl     String                   // ← Uploader depuis IndexedDB (data.film.videoId)
  videoOrientation String?              // ← data.film.format
  startingStory String                  // ← data.story.startingStory
  guidelines   String?                  // ← data.story.guideline
}
```

### Table: `CampaignRewards`

```prisma
model CampaignRewards {
  id           String @id @default(cuid())
  campaignId   String @unique
  
  standardReward String?                // ← JSON stringifié de data.standardToken
  premiumReward  String?                // ← JSON stringifié de data.premiumToken
  completionPrice String?               // ← data.roiData.unitValue
}
```

---

## 🔍 Exemple complet de mapping

### B2C Campaign

```typescript
// Frontend envoie:
{
  user: { email: "contact@nike.com" },
  company: { name: "Nike" },
  story: {
    title: "Just Do It",
    startingStory: "In a world...",
    guideline: "Focus on..."
  },
  film: {
    videoId: "vid_123",
    fileName: "nike.mp4",
    format: "horizontal",
    fileSize: 26738688
  },
  roiData: {
    unitValue: 25,
    netProfit: 5000,
    maxCompletions: 440
  },
  standardToken: {
    type: "token",
    name: "USDC",
    contractAddress: "0x...",
    blockchain: "Ethereum",
    amountPerUser: 10
  }
}

// Backend crée:
const campaign = await prisma.campaign.create({
  data: {
    title: data.story.title,
    type: "B2C_COMPANY",
    creatorType: "FOR_B2C",
    status: "PENDING_MODERATION",
    creatorInfo: {
      create: {
        companyName: data.company.name,
        email: data.user.email,
        walletAddress: data.standardToken.walletAddress
      }
    },
    content: {
      create: {
        videoUrl: uploadedVideoUrl, // Upload depuis IndexedDB
        videoOrientation: data.film.format,
        startingStory: data.story.startingStory,
        guidelines: data.story.guideline
      }
    },
    rewards: {
      create: {
        standardReward: JSON.stringify(data.standardToken),
        completionPrice: data.roiData.unitValue.toString()
      }
    }
  }
})
```

---

## 🗂️ localStorage Keys Reference

| Key | Contenu | Flow |
|-----|---------|------|
| `user` | Email utilisateur | Tous |
| `company` | Nom entreprise | B2C, Agency |
| `story` | Title, startingStory, guideline | Tous |
| `film` | videoId, fileName, format, etc. | Tous |
| `roiData` | unitValue, netProfit, maxCompletions | B2C |
| `completions` | unitPrice, maxCompletions, duration | Individual |
| `standardTokenReward` | Config token standard | B2C |
| `standardItemReward` | Config item standard | B2C |
| `premiumTokenReward` | Config token premium | B2C |
| `premiumItemReward` | Config item premium | B2C |
| `standardDigitalAccessReward` | Config digital access standard | B2C |
| `premiumDigitalAccessReward` | Config digital access premium | B2C |
| `standardPhysicalAccessReward` | Config physical access standard | B2C |
| `premiumPhysicalAccessReward` | Config physical access premium | B2C |
| `maxCompletions` | Nombre max (string) | B2C |
| `paymentMethod` | Méthode de paiement | Tous |
| `finalPrice` | Prix final (string) | B2C |
| `agencyName` | Nom agence | Agency |
| `clientB2CName` | Nom client | Agency |

---

## 🎯 Workflow de récupération Backend

### 1. Recevoir les données de l'API
```typescript
// app/api/log-campaign/route.ts envoie les données au terminal
// app/api/campaigns/create (à créer) reçoit les données
```

### 2. Valider les données
```typescript
const validateCampaignData = (data) => {
  if (!data.story?.title) throw new Error("Title required");
  if (!data.story?.startingStory) throw new Error("Story required");
  // etc.
}
```

### 3. Upload de la vidéo
```typescript
// Récupérer depuis IndexedDB côté client
const videoBlob = await getVideoFromIndexedDB(data.film.videoId);

// Uploader vers votre storage (S3, GCP, etc.)
const videoUrl = await uploadToStorage(videoBlob);
```

### 4. Créer la campagne
```typescript
const campaign = await prisma.campaign.create({
  data: {
    // Mapper les champs selon la structure ci-dessus
  }
});
```

---

## 📚 Documentation liée

- **TERMINAL_LOGGING_GUIDE.md** : Guide complet logging terminal
- **CONSOLE_LOGGING_GUIDE.md** : Guide console.log navigateur
- **prisma/schema.prisma** : Schéma database complet

---

**Dernière mise à jour** : 16 janvier 2025
**Version** : 1.0

