# 🎯 Flux de modération et gestion des vidéos S3

## 📋 Vue d'ensemble du process

```
Création/Completion
        ↓
    /pending ← Accessible aux modérateurs (/moderation)
        ↓
   Modération
    ↙     ↘
Refusé   Validé
   ↓        ↓
Brûlé    /success
(metadata) (vidéo conservée*)
```

*\*Conditions de conservation détaillées ci-dessous*

---

## 📁 Structure du bucket S3

```
winstory-videos/
├── pending/          ← Phase de modération (après agent IA)
│   ├── campaign_*.mp4
│   └── completion_*.mp4
│
└── success/          ← Contenu validé par les modérateurs
    ├── initial/      ← Campagnes initiales (toutes conservées)
    │   └── campaign_*.mp4
    └── completions/  ← Completions (top 3 uniquement)
        └── completion_*.mp4
```

**Note : Pas de dossier `/refused`** - Les vidéos refusées sont brûlées immédiatement.

---

## 🔄 Flux détaillé

### 1️⃣ Création/Paiement → `/pending`

**Quand :**
- ✅ DEV : Lors de la confirmation (Recap)
- 🚀 PROD : Lors du paiement confirmé (après Mint)

**Action :**
```typescript
// Upload vers /pending
const s3Url = uploadToS3(video, 'pending', campaignId);

// Enregistrer dans Supabase
await supabase
  .from('campaign_contents')
  .insert({
    campaign_id: campaignId,
    video_url: s3Url,  // https://...s3.eu-north-1.../pending/...
    moderation_status: 'PENDING_MODERATION'
  });
```

**Résultat :**
- 📹 Vidéo stockée dans S3 `/pending`
- 📊 Metadata dans Supabase avec status `PENDING_MODERATION`
- 👁️ **Visible dans `/moderation` pour les modérateurs**

---

### 2️⃣ Phase de modération

#### Agent IA (automatique)
```typescript
// 1. L'agent IA analyse la vidéo
const aiResult = await analyzeVideoWithAI(s3Url);

// 2. Enregistrer le résultat
await supabase
  .from('moderation_ai_results')
  .insert({
    campaign_id: campaignId,
    ai_decision: aiResult.decision, // 'approve' | 'flag' | 'reject'
    ai_confidence: aiResult.confidence,
    ai_reasons: aiResult.reasons
  });
```

#### Modération humaine
```typescript
// Les modérateurs votent sur /moderation
// La vidéo est accessible via l'URL S3 /pending
```

---

### 3️⃣ Décision finale

#### A) 🔥 Contenu REFUSÉ

```typescript
// 1. Brûler la vidéo S3
await deleteFromS3('pending', fileKey);

// 2. Mettre à jour le status (garder metadata uniquement)
await supabase
  .from('campaign_contents')
  .update({
    video_url: 'REFUSED_AND_DELETED',  // Ou null
    moderation_status: 'REFUSED'
  })
  .eq('campaign_id', campaignId);

// 3. Enregistrer les raisons du refus (metadata)
await supabase
  .from('moderation_history')
  .insert({
    campaign_id: campaignId,
    final_decision: 'REFUSED',
    refusal_reasons: reasons,
    moderator_votes: votes
  });
```

**Résultat :**
- ❌ Vidéo supprimée de S3 (économie de stockage)
- ✅ Metadata conservée (historique, raisons du refus)
- ✅ La campagne existe toujours en base avec status `REFUSED`

---

#### B) ✅ Contenu VALIDÉ

##### Pour les CAMPAGNES INITIALES (créations)

```typescript
// 1. Déplacer de /pending vers /success/initial
const newS3Url = await moveS3File(
  'pending', 
  'success/initial', 
  fileKey
);

// 2. Mettre à jour le status
await supabase
  .from('campaign_contents')
  .update({
    video_url: newS3Url,  // https://.../success/initial/...
    moderation_status: 'APPROVED'
  })
  .eq('campaign_id', campaignId);
```

**Résultat :**
- ✅ Vidéo conservée dans `/success/initial`
- ✅ Campagne accessible au public
- ✅ **TOUTES les vidéos de campagnes initiales sont conservées**

---

##### Pour les COMPLETIONS

**🏆 TOP 3 (podium)**

```typescript
// 1. Déplacer vers /success/completions
const newS3Url = await moveS3File(
  'pending',
  'success/completions',
  fileKey
);

// 2. Mettre à jour le status
await supabase
  .from('completions')
  .update({
    video_url: newS3Url,  // https://.../success/completions/...
    moderation_status: 'APPROVED',
    is_top3: true,
    ranking: ranking  // 1, 2, ou 3
  })
  .eq('completion_id', completionId);
```

**Résultat :**
- ✅ Vidéo conservée dans `/success/completions`
- 🏆 Completion visible avec sa vidéo

---

**👥 HORS TOP 3 (participants validés)**

```typescript
// 1. Supprimer la vidéo de S3 (économie de stockage)
await deleteFromS3('pending', fileKey);

// 2. Mettre à jour le status (garder metadata uniquement)
await supabase
  .from('completions')
  .update({
    video_url: 'APPROVED_BUT_NOT_TOP3',  // Ou null
    moderation_status: 'APPROVED',
    is_top3: false,
    metadata: {
      video_existed: true,
      deleted_reason: 'Not in top 3',
      approval_date: new Date().toISOString()
    }
  })
  .eq('completion_id', completionId);
```

**Résultat :**
- ❌ Vidéo supprimée de S3 (pas dans le top 3)
- ✅ Metadata conservée (preuve de participation)
- ✅ L'utilisateur reçoit quand même les récompenses standard

---

## 📊 Récapitulatif de conservation

| Type de contenu | Décision | Vidéo conservée ? | Metadata conservée ? |
|-----------------|----------|-------------------|---------------------|
| **Campagne initiale** | Validée | ✅ Oui → `/success/initial` | ✅ Oui |
| **Campagne initiale** | Refusée | ❌ Non (brûlée) | ✅ Oui |
| **Completion TOP 3** | Validée | ✅ Oui → `/success/completions` | ✅ Oui |
| **Completion hors TOP 3** | Validée | ❌ Non (supprimée) | ✅ Oui |
| **Completion** | Refusée | ❌ Non (brûlée) | ✅ Oui |

---

## 🔧 Implémentation technique

### API pour déplacer les fichiers S3

```typescript
// /app/api/s3/move/route.ts
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  const { sourceKey, destinationFolder } = await request.json();
  
  // sourceKey exemple : "pending/campaign_123_video.mp4"
  const fileName = sourceKey.split('/').pop();
  const destinationKey = `${destinationFolder}/${fileName}`;
  
  // 1. Copier vers la nouvelle destination
  await s3Client.send(new CopyObjectCommand({
    Bucket: BUCKET_NAME,
    CopySource: `${BUCKET_NAME}/${sourceKey}`,
    Key: destinationKey
  }));
  
  // 2. Supprimer l'original
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: sourceKey
  }));
  
  const newUrl = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${destinationKey}`;
  return NextResponse.json({ success: true, newUrl });
}
```

### API pour supprimer les fichiers S3

```typescript
// /app/api/s3/delete/route.ts
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  const { fileKey } = await request.json();
  
  await s3Client.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey
  }));
  
  return NextResponse.json({ success: true });
}
```

---

## 🎯 Intégration avec `/moderation`

### Affichage des contenus en attente

```typescript
// Page /moderation
const { data: pendingContent } = await supabase
  .from('campaign_contents')
  .select(`
    *,
    campaigns (*)
  `)
  .eq('moderation_status', 'PENDING_MODERATION')
  .order('created_at', { ascending: true });

// Afficher les vidéos depuis S3 /pending
pendingContent.map(content => (
  <VideoCard
    videoUrl={content.video_url}  // URL S3 /pending
    campaignId={content.campaign_id}
    onApprove={handleApprove}
    onReject={handleReject}
  />
));
```

### Actions des modérateurs

```typescript
const handleApprove = async (campaignId, isTop3 = null) => {
  // 1. Déterminer la destination
  const destinationFolder = isCampaign 
    ? 'success/initial'
    : isTop3 
      ? 'success/completions'
      : null;  // Pas de déplacement, sera supprimé
  
  if (destinationFolder) {
    // 2. Déplacer la vidéo
    await fetch('/api/s3/move', {
      method: 'POST',
      body: JSON.stringify({ sourceKey, destinationFolder })
    });
  } else {
    // 3. Supprimer la vidéo (hors top 3)
    await fetch('/api/s3/delete', {
      method: 'POST',
      body: JSON.stringify({ fileKey: sourceKey })
    });
  }
  
  // 4. Mettre à jour le status
  await updateModerationStatus(campaignId, 'APPROVED');
};

const handleReject = async (campaignId) => {
  // 1. Supprimer la vidéo (brûler)
  await fetch('/api/s3/delete', {
    method: 'POST',
    body: JSON.stringify({ fileKey: sourceKey })
  });
  
  // 2. Mettre à jour le status
  await updateModerationStatus(campaignId, 'REFUSED');
};
```

---

## 💰 Optimisation des coûts

### Stockage conservé
- ✅ Campagnes initiales validées : **100%**
- ✅ Completions top 3 : **~3 par campagne**

### Stockage économisé
- ❌ Campagnes refusées : **Brûlées**
- ❌ Completions hors top 3 : **Supprimées**
- ❌ Completions refusées : **Brûlées**

**Exemple sur une campagne avec 100 completions :**
- 100 vidéos en `/pending`
- 3 vidéos conservées dans `/success/completions`
- 97 vidéos supprimées
- **Économie : 97% du stockage des completions**

---

## ✅ Règles de modération (CLARIFIÉES)

### 1️⃣ Timing du TOP 3
**Option choisie : APRÈS modération complète**

- Toutes les completions restent en `/pending` pendant la phase de modération
- Le classement s'établit **à la fin** de la période de completion (généralement 1 semaine) OU quand 100% des completions sont atteintes
- Le TOP 3 est basé sur la **moyenne des scores des modérateurs**
- ⚠️ **Minimum 5 completions** pour qu'un classement existe
- Une completion refusée par un modérateur = note de 0 (diminue la moyenne)
- Une completion peut être définitivement validée (répond aux 3 conditions) même avec des notes de 0

### 2️⃣ Critères de classement

**Score des modérateurs uniquement** :
- Chaque modérateur attribue **UNE note unique** par completion
- ❌ Pas de notes égales pour 2 completions d'une même campagne initiale
- Les modérateurs = la communauté (pas de vote social externe pour l'instant)
- Classement basé sur la **moyenne globale** des notes

**Règle importante** : Si < 5 completions → Pas de classement / Pas de TOP 3

### 3️⃣ Accès aux vidéos en `/pending`

**Sécurité par wallet + staking $WINC** :
- Pour accéder à `/moderation`, l'utilisateur DOIT être connecté avec un wallet
- Ce wallet DOIT avoir staké du token $WINC (montant à paramétrer ultérieurement)
- Si le wallet n'est pas éligible → Le contenu n'apparaît même pas
- Les votes sont enregistrés sur la blockchain
- Un vote d'un wallet non-éligible ne sera pas pris en compte

**Impact sur S3** :
- Les vidéos peuvent être publiques dans le bucket (pas de presigned URLs nécessaires)
- La sécurité est gérée par l'authentification wallet + staking
- Seuls les modérateurs éligibles verront les URLs des vidéos en `/pending`

### 4️⃣ Nettoyage automatique

**Pas de nettoyage automatique** :
- Les vidéos restent en `/pending` tant qu'elles ne sont pas définitivement validées ou refusées
- Dans les premiers temps, l'équipe Winstory modère (le temps que la communauté grandisse)
- Un contenu urgent peut être mis en avant dans la file de modération

### 5️⃣ Completion TOP 3 refusée ?

**Cas impossible** :
- Une completion TOP 3 a été définitivement validée avant d'être classée
- Impossible qu'elle soit refusée après coup
- Le TOP 3 n'existe qu'après validation complète + classement final

---

## 🚀 TODO pour implémentation complète

- [ ] Créer API `/api/s3/move` pour déplacer les vidéos
- [ ] Créer API `/api/s3/delete` pour supprimer les vidéos
- [ ] Ajouter champ `is_top3` dans la table `completions`
- [ ] Implémenter logique de sélection du TOP 3
- [ ] Intégrer les actions dans `/moderation`
- [ ] Ajouter permissions S3 appropriées (presigned URLs si besoin)
- [ ] Créer script de nettoyage automatique (optionnel)
- [ ] Documenter le processus pour les modérateurs

---

**📋 Ce document sera affiné après réponse aux questions de clarification**

