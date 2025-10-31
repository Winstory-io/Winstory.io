# 🎯 Stratégie d'Upload S3 - Développement vs Production

## 📋 Contexte

Pour optimiser les coûts de stockage AWS S3 et éviter de stocker des vidéos d'utilisateurs qui confirment mais ne paient jamais, la stratégie d'upload varie selon l'environnement.

---

## 🔄 Phase actuelle : DÉVELOPPEMENT

### Comportement actuel
- ✅ **Upload S3 lors de la CONFIRMATION** (bouton "Confirm" sur la page Recap)
- 📍 Permet de tester l'intégration S3 facilement
- 📍 Simplifie le développement et les tests

### Fichiers concernés
- `/app/creation/b2c/recap/page.tsx` - Upload au `handleConfirm()`
- `/app/creation/individual/recap/page.tsx` - Upload au `handleConfirm()`
- `/app/creation/agencyb2c/recap/page.tsx` - Upload au `handleConfirm()`
- `/app/completion/recap/page.tsx` - Upload au `handleMint()` (déjà sur le mint)

### Pourquoi maintenant ?
```javascript
// Phase DEV : Upload immédiat pour tester l'intégration
handleConfirm() {
  uploadToS3();  // ← Upload ici pour tester
  createCampaign();
  redirectToMint();
}
```

---

## 🚀 Phase future : PRODUCTION

### Comportement prévu
- ✅ **Upload S3 lors du PAIEMENT/MINT** (après confirmation de paiement)
- 💰 Évite les coûts de stockage pour les utilisateurs qui ne paient pas
- 🔐 Garantit que seules les campagnes payées sont stockées

### Flux de production prévu

```
Utilisateur → Recap (Confirm) → Paiement → ✅ UPLOAD S3 → Mint
                                  ↓
                                 ❌ Abandon = Pas d'upload = Pas de coût
```

### Implémentation future

```javascript
// Phase PROD : Upload après paiement confirmé
handlePaymentSuccess(transactionHash) {
  uploadToS3();  // ← Upload seulement si paiement réussi
  createCampaign();
  redirectToSuccess();
}

handlePaymentError() {
  // Pas d'upload = Pas de coût S3
  rollback();
}
```

---

## 💰 Analyse des coûts

### Scénario avec upload à la confirmation (DEV - actuel)
```
100 utilisateurs confirment → 100 vidéos uploadées sur S3
├── 70 paient → 70 campagnes créées ✅
└── 30 abandonnent → 30 vidéos inutiles sur S3 ❌
    └── Coût inutile : ~30 vidéos × 500 MB × $0.023/GB = ~$0.35/mois
```

### Scénario avec upload après paiement (PROD - futur)
```
100 utilisateurs confirment
├── 70 paient → 70 vidéos uploadées sur S3 ✅
└── 30 abandonnent → 0 vidéos sur S3 ✅
    └── Économie : 30 vidéos non stockées = $0.35/mois économisés
```

**Sur 10 000 utilisateurs par mois :**
- Upload à la confirmation : ~$35/mois de stockage inutile
- Upload après paiement : $0 de stockage inutile
- **Économie annuelle : ~$420**

---

## 🔧 Migration DEV → PROD

### Étapes pour passer en production

#### 1. Modifier les pages Recap (B2C, Individual, Agency)

**Avant (DEV) :**
```typescript
const handleConfirm = async () => {
  // Upload immédiat
  const s3VideoUrl = await uploadToS3();
  await createCampaign({ s3VideoUrl });
  router.push("/mint");
};
```

**Après (PROD) :**
```typescript
const handleConfirm = async () => {
  // Pas d'upload, juste créer la campagne avec videoId IndexedDB
  await createCampaign({ videoId: film.videoId });
  router.push("/payment");
};

const handlePaymentSuccess = async (transactionHash) => {
  // Upload APRÈS paiement confirmé
  const s3VideoUrl = await uploadToS3();
  await updateCampaign({ s3VideoUrl });
  router.push("/mint");
};
```

#### 2. Modifier l'API `/api/campaigns/create`

**Ajouter un champ `payment_status` :**
```typescript
interface CampaignData {
  // ... autres champs
  paymentStatus?: 'pending' | 'confirmed' | 'failed';
  videoId?: string; // Garde l'ID IndexedDB jusqu'au paiement
}

// Créer la campagne sans video_url si pas encore payé
if (data.paymentStatus === 'pending') {
  videoUrl = `pending_payment:${data.videoId}`;
} else if (data.s3VideoUrl) {
  videoUrl = data.s3VideoUrl;
}
```

#### 3. Créer une API `/api/campaigns/[id]/upload-video`

```typescript
// POST /api/campaigns/[campaignId]/upload-video
// Appelé APRÈS paiement confirmé
export async function POST(request, { params }) {
  const { campaignId } = params;
  const { videoFile } = await request.formData();
  
  // Upload vers S3
  const s3VideoUrl = await uploadToS3(videoFile, campaignId);
  
  // Mettre à jour la campagne
  await supabase
    .from('campaign_contents')
    .update({ video_url: s3VideoUrl })
    .eq('campaign_id', campaignId);
    
  return { success: true, s3VideoUrl };
}
```

#### 4. Nettoyer les vidéos IndexedDB après upload S3

```typescript
const handlePaymentSuccess = async (transactionHash) => {
  // Upload vers S3
  const s3VideoUrl = await uploadToS3();
  
  // Nettoyer IndexedDB pour libérer l'espace navigateur
  await deleteVideoFromIndexedDB(videoId);
  
  // Continuer...
};
```

---

## 📊 Comparaison des flux

### Flux DÉVELOPPEMENT (actuel)

```
┌─────────────┐
│   Recap     │
│  (Confirm)  │
└──────┬──────┘
       │
       ├─ Upload S3 (pending/)
       ├─ Create Campaign (avec S3 URL)
       │
       ▼
┌─────────────┐
│  Payment    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Mint     │
└─────────────┘
```

### Flux PRODUCTION (futur)

```
┌─────────────┐
│   Recap     │
│  (Confirm)  │
└──────┬──────┘
       │
       ├─ NO Upload (garde dans IndexedDB)
       ├─ Create Campaign (sans S3 URL)
       │
       ▼
┌─────────────┐
│  Payment    │◄─── Si abandon: Rien sur S3 ✅
└──────┬──────┘
       │ Paiement OK ✅
       │
       ├─ Upload S3 (pending/)
       ├─ Update Campaign (avec S3 URL)
       ├─ Clean IndexedDB
       │
       ▼
┌─────────────┐
│    Mint     │
└─────────────┘
```

---

## 🎯 Avantages du flux PRODUCTION

### 💰 Économie de coûts
- Pas de stockage S3 pour les abandons de paiement
- Stockage uniquement des campagnes payées

### 🚀 Performance
- Confirmation plus rapide (pas d'upload réseau)
- Upload en arrière-plan après paiement

### 🔐 Sécurité
- Vidéos accessibles uniquement après paiement
- Pas de vidéos "orphelines" sur S3

### 🧹 Maintenance
- Nettoyage automatique d'IndexedDB
- Pas besoin de script de nettoyage S3

---

## 📝 TODO pour passer en PROD

- [ ] Modifier `handleConfirm()` dans les pages Recap pour ne PAS uploader
- [ ] Créer `handlePaymentSuccess()` pour uploader APRÈS paiement
- [ ] Ajouter champ `payment_status` dans la table `campaigns`
- [ ] Créer API `/api/campaigns/[id]/upload-video`
- [ ] Ajouter nettoyage IndexedDB après upload S3
- [ ] Tester le flux complet avec abandon de paiement
- [ ] Documenter le nouveau flux pour l'équipe

---

## 🔍 Notes importantes

### Pourquoi IndexedDB est toujours nécessaire ?

Même en production, IndexedDB reste utile :
1. **Stockage temporaire** jusqu'au paiement
2. **Performance** : pas de re-upload si l'utilisateur revient
3. **UX** : l'utilisateur peut voir sa vidéo avant de payer
4. **Résilience** : si le paiement échoue, on peut réessayer sans re-uploader

### Que faire des vidéos dans `/pending` ?

Le dossier `/pending` reste pertinent :
- Phase modération IA (avant validation humaine)
- Phase modération humaine
- Une fois validé → déplacer vers `/success`

---

## 🎉 Conclusion

L'implémentation actuelle est **parfaite pour le développement** et permet de tester l'intégration S3.

Pour la **production**, il suffit de déplacer l'upload S3 du `handleConfirm()` vers le `handlePaymentSuccess()` pour optimiser les coûts.

**Aucun changement n'est nécessaire pour l'instant** - l'architecture actuelle est prête pour cette évolution future ! 🚀

