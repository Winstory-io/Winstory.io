# ✅ Intégration AWS S3 - Résumé

## 🎯 Ce qui a été implémenté

L'intégration AWS S3 est maintenant **complète** pour votre application Winstory. Lors de la confirmation sur les pages Recap (création et completion), les vidéos sont automatiquement uploadées dans le bucket S3 `winstory-videos` dans le dossier `/pending`.

---

## 📁 Fichiers modifiés

### 1. **API Routes**
- ✅ `/app/api/s3/upload/route.ts` - **NOUVEAU** : API pour uploader les vidéos vers S3
- ✅ `/app/api/campaigns/create/route.ts` - Modifié pour accepter et stocker les URLs S3

### 2. **Pages Recap (Création de campagnes)**
- ✅ `/app/creation/b2c/recap/page.tsx` - Upload S3 lors de la confirmation
- ✅ `/app/creation/individual/recap/page.tsx` - Upload S3 lors de la confirmation
- ✅ `/app/creation/agencyb2c/recap/page.tsx` - Upload S3 lors de la confirmation

### 3. **Pages Completion**
- ✅ `/app/completion/recap/page.tsx` - Upload S3 lors de la confirmation

### 4. **Documentation**
- ✅ `AWS_S3_SETUP.md` - Guide complet de configuration AWS

---

## 🔧 Configuration requise

### Créer le fichier `.env.local`

À la **racine du projet** (même niveau que `package.json`), créez un fichier `.env.local` :

```bash
# Supabase Configuration (copiez depuis votre configuration existante)
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-supabase

# AWS S3 Configuration
# ==================== 
# 🔑 REMPLACEZ LES VALEURS CI-DESSOUS PAR VOS VRAIES CLÉS AWS
AWS_ACCESS_KEY_ID=VOTRE_AWS_ACCESS_KEY_ICI
AWS_SECRET_ACCESS_KEY=VOTRE_AWS_SECRET_ACCESS_KEY_ICI
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=winstory-videos

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔐 Où placer vos clés AWS ?

### **RÉPONSE : Dans le fichier `.env.local` à la racine du projet**

#### Comment obtenir vos clés AWS :

1. **Connectez-vous à AWS Console** : https://console.aws.amazon.com/
2. **Allez dans IAM** (Identity and Access Management)
3. **Créez un utilisateur** avec accès S3 :
   - Cliquez sur "Users" → "Add users"
   - Nom : `winstory-s3-uploader`
   - Cochez "Access key - Programmatic access"
4. **Attachez la politique** `AmazonS3FullAccess` (ou une politique personnalisée)
5. **Récupérez vos clés** :
   - `Access key ID` → Copiez dans `AWS_ACCESS_KEY_ID`
   - `Secret access key` → Copiez dans `AWS_SECRET_ACCESS_KEY`

⚠️ **IMPORTANT** : Téléchargez le fichier CSV ou copiez ces clés **maintenant**, vous ne pourrez plus voir la secret key après !

---

## 🗂️ Structure du bucket S3

Votre bucket S3 `winstory-videos` doit avoir cette structure :

```
winstory-videos/
├── pending/     ← Vidéos en attente de modération (IA + humaine)
└── success/     ← Vidéos validées par les modérateurs
```

Les vidéos sont **automatiquement uploadées** dans `/pending` lors de la confirmation.

---

## 🔄 Flux de fonctionnement

### ⚠️ IMPORTANT : Phase de développement vs Production

**Phase DÉVELOPPEMENT (actuelle) :**
- Upload S3 lors de la **confirmation** sur la page Recap
- Permet de tester facilement l'intégration S3

**Phase PRODUCTION (future) :**
- Upload S3 lors du **paiement/mint** (après confirmation de paiement)
- Évite les coûts de stockage S3 pour les utilisateurs qui confirment mais ne paient pas

📄 **Voir `S3_UPLOAD_STRATEGY.md` pour la stratégie complète**

---

### Pour les créations de campagnes (flux actuel - DEV) :

1. L'utilisateur crée une campagne (B2C, Individual, ou Agency)
2. Il uploade une vidéo sur la page "Your Film"
3. La vidéo est stockée temporairement dans **IndexedDB** (navigateur)
4. Sur la page **Recap**, quand il clique sur **"Confirm"** :
   - ✅ La vidéo est récupérée depuis IndexedDB
   - ✅ **[DEV ONLY]** Elle est uploadée vers S3 dans `/pending`
   - ✅ L'URL S3 est récupérée
   - ✅ La campagne est créée dans Supabase avec l'URL S3
   - ⚠️ **TODO PROD :** Déplacer l'upload vers `handlePaymentSuccess()`

### Pour les completions :

1. L'utilisateur complète une campagne
2. Il uploade une vidéo de completion
3. La vidéo est stockée dans `window.__completionVideo`
4. Sur la page **Completion Recap**, quand il clique sur **"MINT"** :
   - ✅ La vidéo est uploadée vers S3 dans `/pending`
   - ✅ L'URL S3 est stockée dans localStorage

---

## 📊 Base de données Supabase

La table `campaign_contents` stocke maintenant les URLs S3 dans le champ `video_url` :

```sql
-- Anciennes valeurs (legacy)
video_url = 'indexeddb:video_123456'
video_url = 'winstory_delegated'

-- Nouvelles valeurs (avec S3)
video_url = 'https://winstory-videos.s3.us-east-1.amazonaws.com/pending/temp_123_video.mp4'
```

Le système est **rétrocompatible** : il supporte à la fois les anciennes URLs IndexedDB et les nouvelles URLs S3.

---

## 🧪 Tester l'intégration

1. **Configurez vos clés AWS** dans `.env.local`
2. **Redémarrez le serveur** :
   ```bash
   npm run dev
   ```
3. **Créez une campagne** ou une completion avec une vidéo
4. **Vérifiez dans votre bucket S3** que la vidéo est bien uploadée dans `/pending`
5. **Vérifiez dans Supabase** que l'URL S3 est bien enregistrée dans `campaign_contents.video_url`

---

## 🔒 Sécurité

✅ **Bonnes pratiques implémentées** :
- Les clés AWS sont stockées côté serveur uniquement (`.env.local`)
- Le fichier `.env.local` est dans `.gitignore` (ne sera jamais commité)
- L'API `/api/s3/upload` vérifie la présence des clés avant d'uploader
- Les vidéos sont uploadées dans `/pending` pour validation avant `/success`

❌ **NE JAMAIS** :
- Commiter le fichier `.env.local` dans Git
- Partager vos clés AWS avec qui que ce soit
- Utiliser ces clés dans du code frontend

---

## 📦 Dépendances installées

```json
{
  "@aws-sdk/client-s3": "^3.x",
  "@aws-sdk/s3-request-presigner": "^3.x"
}
```

Ces packages sont déjà installés et ajoutés à votre `package.json`.

---

## 🎉 Prochaines étapes

1. **Créez votre fichier `.env.local`** avec vos clés AWS
2. **Testez l'intégration** en créant une campagne
3. **Implémentez la logique de modération** pour déplacer les vidéos de `/pending` vers `/success`
4. **(Optionnel)** Créez une politique IAM personnalisée plus restrictive pour plus de sécurité

---

## 🆘 Support

Pour toute question sur la configuration AWS S3, consultez le fichier `AWS_S3_SETUP.md` qui contient un guide détaillé étape par étape.

---

**✨ Implémentation terminée avec succès !**

