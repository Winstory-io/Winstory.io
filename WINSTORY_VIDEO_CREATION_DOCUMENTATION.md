# 🎬 Documentation Complète : Création de Vidéos par Winstory

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Workflow complet](#workflow-complet)
3. [Configuration requise](#configuration-requise)
4. [Structure de la base de données](#structure-de-la-base-de-données)
5. [Interface Admin](#interface-admin)
6. [APIs](#apis)
7. [Sécurité et authentification](#sécurité-et-authentification)
8. [Processus de création vidéo](#processus-de-création-vidéo)
9. [Dépannage](#dépannage)
10. [Bonnes pratiques](#bonnes-pratiques)

---

## 1. Vue d'ensemble

### 1.1. Contexte

Lorsqu'une entreprise B2C crée une campagne sur Winstory, elle peut choisir l'option **"Winstory creates the Film"** (+$500). Dans ce cas :
- L'entreprise fournit uniquement : Starting Story, Guidelines, et les informations de base
- Winstory se charge de créer la vidéo dans un délai de 24h
- Une fois la vidéo créée, la campagne devient disponible pour modération

### 1.2. État actuel

✅ **Implémenté :**
- Détection automatique des campagnes nécessitant une vidéo
- Statut `PENDING_WINSTORY_VIDEO` dans la base de données
- Interface admin pour lister et gérer les vidéos
- Upload automatique vers S3
- Mise à jour automatique du statut après création

---

## 2. Workflow complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ENTREPRISE B2C CRÉE UNE CAMPAGNE                         │
│    - Sélectionne "Winstory creates the Film"               │
│    - Fournit Starting Story + Guidelines                   │
│    - Valide et paie                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CRÉATION DE LA CAMPAGNE DANS LA BASE                    │
│    - Status: PENDING_WINSTORY_VIDEO                        │
│    - video_url: 'winstory_delegated'                       │
│    - ai_option: true                                       │
│    - Intervention créée dans winstory_interventions        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. VISIBLE DANS /admin/video-creation                      │
│    - Liste toutes les campagnes en attente                 │
│    - Affiche Starting Story, Guidelines, Company Info      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. WINSTORY CRÉE LA VIDÉO                                   │
│    - Utilise Starting Story + Guidelines                   │
│    - Format: Horizontal (16:9) ou Vertical (9:16)          │
│    - Exporte en MP4                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. UPLOAD VIA /admin/video-creation/[campaignId]            │
│    - Sélection du fichier vidéo (max 500MB)                │
│    - Upload automatique vers S3 /pending                   │
│    - Barre de progression                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. MISE À JOUR AUTOMATIQUE                                  │
│    - campaign_contents.video_url → URL S3                 │
│    - campaigns.status → PENDING_MODERATION                 │
│    - winstory_interventions.status → completed            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. CAMPAGNE DISPONIBLE POUR MODÉRATION                      │
│    - Visible dans /moderation                              │
│    - Les modérateurs peuvent maintenant voter              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Configuration requise

### 3.1. Variables d'environnement

Créez ou modifiez `.env.local` à la racine du projet :

```env
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ==========================================
# AWS S3 CONFIGURATION
# ==========================================
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=winstory-videos

# ==========================================
# ADMIN ACCESS CONFIGURATION
# ==========================================
# Liste des wallets autorisés (séparés par des virgules)
ADMIN_WALLETS=0x1234...,0x5678...

# OU utiliser une clé secrète pour les API calls
ADMIN_SECRET_KEY=your-secret-admin-key-here
```

### 3.2. Vérification de la base de données

#### 3.2.1. Vérifier le statut `PENDING_WINSTORY_VIDEO`

```sql
-- Vérifier que le statut existe dans l'enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'campaign_status'
);

-- Devrait retourner :
-- PENDING_MODERATION
-- IN_REVIEW
-- PENDING_WINSTORY_VIDEO  ← Doit être présent
-- APPROVED
-- REJECTED
-- COMPLETED
```

#### 3.2.2. Vérifier la table `winstory_interventions`

```sql
-- Vérifier que la table existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'winstory_interventions'
);

-- Vérifier les types d'intervention autorisés
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%intervention_type%';

-- Devrait inclure : 'video_creation'
```

#### 3.2.3. Vérifier `campaign_pricing_configs.ai_option`

```sql
-- Vérifier que la colonne ai_option existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaign_pricing_configs' 
  AND column_name = 'ai_option';

-- Devrait retourner : ai_option | boolean
```

### 3.3. Configuration AWS S3

1. **Créer un bucket S3** (ou utiliser un existant) :
   - Nom : `winstory-videos` (ou celui configuré dans `.env.local`)
   - Région : `eu-north-1` (Stockholm) ou votre région préférée

2. **Créer un utilisateur IAM** avec les permissions suivantes :
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::winstory-videos/*",
           "arn:aws:s3:::winstory-videos"
         ]
       }
     ]
   }
   ```

3. **Récupérer les credentials** :
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

## 4. Structure de la base de données

### 4.1. Table `campaigns`

```sql
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  status campaign_status NOT NULL DEFAULT 'PENDING_MODERATION',
  -- ... autres colonnes
  
  -- Statuts possibles :
  -- 'PENDING_MODERATION'     : Campagne avec vidéo, prête pour modération
  -- 'PENDING_WINSTORY_VIDEO' : Campagne en attente de création vidéo
  -- 'IN_REVIEW'              : En cours de modération
  -- 'APPROVED'               : Approuvée
  -- 'REJECTED'               : Rejetée
  -- 'COMPLETED'              : Terminée
);
```

### 4.2. Table `campaign_contents`

```sql
CREATE TABLE campaign_contents (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  video_url TEXT NOT NULL,
  -- ...
  
  -- Valeurs possibles pour video_url :
  -- 'winstory_delegated'     : Vidéo à créer par Winstory
  -- 'https://...s3.../...'   : URL S3 de la vidéo créée
  -- 'indexeddb:xxx'          : Ancien système (legacy)
);
```

### 4.3. Table `campaign_pricing_configs`

```sql
CREATE TABLE campaign_pricing_configs (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  ai_option BOOLEAN DEFAULT FALSE,
  -- ...
  
  -- ai_option = true : L'entreprise a choisi "Winstory creates the Film"
);
```

### 4.4. Table `winstory_interventions`

```sql
CREATE TABLE winstory_interventions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  intervention_type TEXT NOT NULL CHECK (
    intervention_type IN (
      'video_creation',      -- ← Type pour création vidéo
      'super_moderation',
      'anti_complot',
      'quality_control'
    )
  ),
  intervention_status TEXT DEFAULT 'pending',
  -- 'pending'  : Intervention en attente
  -- 'in_progress' : En cours
  -- 'completed'    : Terminée
  deadline_hours INTEGER DEFAULT 24,
  intervention_details JSONB,
  -- Contient : starting_story, guidelines, video_orientation, etc.
  completed_at TIMESTAMP WITH TIME ZONE,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. Interface Admin

### 5.1. Route principale : `/admin/video-creation`

**URL :** `https://your-domain.com/admin/video-creation`

**Fonctionnalités :**
- Liste toutes les campagnes nécessitant une vidéo
- Affiche les informations clés : titre, entreprise, date de création
- Aperçu de la Starting Story et Guidelines
- Bouton pour accéder aux détails de chaque campagne

**Protection :**
- Accès contrôlé par wallet ou clé secrète (voir section Sécurité)

### 5.2. Route de détails : `/admin/video-creation/[campaignId]`

**URL :** `https://your-domain.com/admin/video-creation/campaign_1234567890_abc123`

**Fonctionnalités :**
- Affichage complet de la Starting Story et Guidelines
- Informations de l'entreprise (nom, email)
- Upload de vidéo avec barre de progression
- Validation du format et de la taille
- Upload automatique vers S3
- Mise à jour automatique de la base de données

**Processus d'upload :**
1. Sélection du fichier vidéo (max 500MB)
2. Validation : format vidéo, taille, orientation
3. Upload vers S3 dans le dossier `/pending`
4. Mise à jour de `campaign_contents.video_url`
5. Changement de statut vers `PENDING_MODERATION`
6. Mise à jour de l'intervention en `completed`

---

## 6. APIs

### 6.1. GET `/api/admin/pending-videos`

**Description :** Liste toutes les campagnes nécessitant une vidéo

**Authentification :** Requis (voir section Sécurité)

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "campaign_1234567890_abc123",
      "title": "Ma Campagne",
      "description": "...",
      "status": "PENDING_WINSTORY_VIDEO",
      "type": "INITIAL",
      "createdAt": "2024-01-27T10:30:00Z",
      "updatedAt": "2024-01-27T10:30:00Z",
      "startingStory": "Il était une fois...",
      "guidelines": "Respecter le ton sérieux...",
      "videoOrientation": "horizontal",
      "companyName": "Mon Entreprise",
      "email": "contact@entreprise.com",
      "aiOption": true,
      "videoUrl": "winstory_delegated"
    }
  ],
  "count": 1
}
```

### 6.2. PUT `/api/admin/update-video`

**Description :** Met à jour la vidéo d'une campagne après upload

**Authentification :** Requis (voir section Sécurité)

**Body :**
```json
{
  "campaignId": "campaign_1234567890_abc123",
  "videoUrl": "https://winstory-videos.s3.eu-north-1.amazonaws.com/pending/campaign_1234567890_abc123_1706357400000_video.mp4"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Video updated successfully",
  "campaignId": "campaign_1234567890_abc123",
  "videoUrl": "https://..."
}
```

**Actions automatiques :**
- Mise à jour de `campaign_contents.video_url`
- Changement de `campaigns.status` de `PENDING_WINSTORY_VIDEO` à `PENDING_MODERATION`
- Mise à jour de `winstory_interventions.status` à `completed`
- Enregistrement de `completed_at` et `outcome`

---

## 7. Sécurité et authentification

### 7.1. Protection des routes admin

Deux méthodes d'authentification sont disponibles :

#### Méthode 1 : Wallet Address (recommandée pour production)

1. Ajouter les wallets autorisés dans `.env.local` :
   ```env
   ADMIN_WALLETS=0x1234...,0x5678...
   ```

2. L'utilisateur doit se connecter avec son wallet

3. Le wallet est vérifié côté serveur

#### Méthode 2 : Clé secrète (pour les API calls)

1. Ajouter une clé secrète dans `.env.local` :
   ```env
   ADMIN_SECRET_KEY=your-super-secret-key-here
   ```

2. Envoyer la clé dans les headers :
   ```javascript
   fetch('/api/admin/pending-videos', {
     headers: {
       'x-admin-key': 'your-super-secret-key-here'
     }
   })
   ```

### 7.2. Protection des pages admin

Pour protéger les pages `/admin/*`, vous pouvez :

1. **Créer un composant de protection** (exemple fourni dans `lib/adminAuth.ts`)
2. **Utiliser le middleware Next.js** (à configurer selon vos besoins)
3. **Ajouter une vérification côté client** dans chaque page admin

Exemple de protection côté client :
```typescript
'use client';

import { useActiveAccount } from 'thirdweb/react';
import { isAdminWallet } from '@/lib/adminAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    if (!account?.address || !isAdminWallet(account.address)) {
      router.push('/'); // Rediriger si pas admin
    }
  }, [account, router]);

  if (!account?.address || !isAdminWallet(account.address)) {
    return <div>Accès refusé</div>;
  }

  return <div>Contenu admin...</div>;
}
```

### 7.3. Protection des APIs admin

Les APIs `/api/admin/*` vérifient automatiquement l'accès via `checkAdminAccess()`. 

**En développement :** L'accès est autorisé par défaut pour faciliter les tests.

**En production :** L'accès est strictement contrôlé.

---

## 8. Processus de création vidéo

### 8.1. Checklist avant création

- [ ] Vérifier la Starting Story
- [ ] Vérifier les Guidelines
- [ ] Vérifier le format requis (horizontal/vertical)
- [ ] Vérifier les informations de l'entreprise
- [ ] Vérifier la date de création (délai de 24h)

### 8.2. Étapes de création

1. **Lire attentivement** :
   - Starting Story : histoire de base à raconter
   - Guidelines : contraintes et préférences
   - Format : orientation de la vidéo

2. **Créer la vidéo** :
   - Utiliser les outils de votre choix (After Effects, Premiere, etc.)
   - Respecter le format demandé (16:9 ou 9:16)
   - Exporter en MP4, qualité optimale mais taille raisonnable

3. **Vérifier la vidéo** :
   - Durée appropriée
   - Qualité audio/vidéo
   - Respect des Guidelines
   - Format correct

4. **Uploader via l'interface admin**

### 8.3. Formats acceptés

- **Extension :** `.mp4` (recommandé)
- **Codec vidéo :** H.264 ou H.265
- **Codec audio :** AAC
- **Taille max :** 500MB
- **Orientation :**
  - Horizontal : 16:9 (1920x1080, 1280x720, etc.)
  - Vertical : 9:16 (1080x1920, 720x1280, etc.)

---

## 9. Dépannage

### 9.1. Les campagnes n'apparaissent pas dans `/admin/video-creation`

**Vérifications :**
1. ✅ Vérifier que `ai_option = true` dans `campaign_pricing_configs`
2. ✅ Vérifier que `video_url = 'winstory_delegated'` dans `campaign_contents`
3. ✅ Vérifier que `status = 'PENDING_WINSTORY_VIDEO'` ou `'PENDING_MODERATION'` dans `campaigns`
4. ✅ Vérifier les logs de l'API : `GET /api/admin/pending-videos`
5. ✅ Vérifier que Supabase est bien configuré

**Requête SQL de diagnostic :**
```sql
SELECT 
  c.id,
  c.title,
  c.status,
  cc.video_url,
  cpc.ai_option
FROM campaigns c
LEFT JOIN campaign_contents cc ON cc.campaign_id = c.id
LEFT JOIN campaign_pricing_configs cpc ON cpc.campaign_id = c.id
WHERE cpc.ai_option = true
  AND (cc.video_url = 'winstory_delegated' OR cc.video_url IS NULL);
```

### 9.2. L'upload échoue

**Vérifications :**
1. ✅ Vérifier les credentials AWS dans `.env.local`
2. ✅ Vérifier que le bucket S3 existe
3. ✅ Vérifier les permissions IAM
4. ✅ Vérifier la taille du fichier (max 500MB)
5. ✅ Vérifier le format du fichier (vidéo)
6. ✅ Vérifier les logs de l'API : `POST /api/s3/upload`

### 9.3. La vidéo n'est pas mise à jour dans la base de données

**Vérifications :**
1. ✅ Vérifier les logs de l'API : `PUT /api/admin/update-video`
2. ✅ Vérifier que l'URL S3 est valide
3. ✅ Vérifier que `campaignId` est correct
4. ✅ Vérifier les permissions Supabase (Service Role Key)

**Requête SQL de diagnostic :**
```sql
SELECT 
  c.id,
  c.status,
  cc.video_url,
  wi.intervention_status
FROM campaigns c
LEFT JOIN campaign_contents cc ON cc.campaign_id = c.id
LEFT JOIN winstory_interventions wi ON wi.campaign_id = c.id
WHERE c.id = 'campaign_xxx';
```

### 9.4. La campagne n'apparaît pas dans `/moderation` après upload

**Vérifications :**
1. ✅ Vérifier que le statut a bien changé : `SELECT status FROM campaigns WHERE id = 'xxx'`
2. ✅ Vérifier que `video_url` n'est plus `'winstory_delegated'`
3. ✅ Vérifier que `video_url` est une URL HTTP/HTTPS valide
4. ✅ Vérifier les logs de l'API de modération

**Réparation manuelle si nécessaire :**
```sql
-- Mettre à jour le statut manuellement
UPDATE campaigns 
SET status = 'PENDING_MODERATION' 
WHERE id = 'campaign_xxx' 
  AND status = 'PENDING_WINSTORY_VIDEO';
```

---

## 10. Bonnes pratiques

### 10.1. Pour les créateurs de vidéos Winstory

1. **Respecter le délai de 24h** : Prioriser les campagnes selon leur date de création
2. **Lire attentivement les Guidelines** : Respecter les préférences de l'entreprise
3. **Vérifier le format** : S'assurer que la vidéo correspond à l'orientation demandée
4. **Optimiser la taille** : Compresser si nécessaire pour rester sous 500MB
5. **Tester la vidéo** : Vérifier la lecture avant upload

### 10.2. Pour les développeurs

1. **Ne jamais exposer les clés admin** : Toujours utiliser `.env.local`
2. **Logger les actions admin** : Pour audit et debugging
3. **Valider les inputs** : Taille, format, URLs
4. **Gérer les erreurs** : Messages clairs pour les utilisateurs
5. **Tester en développement** : Utiliser des wallets de test

### 10.3. Monitoring

**Métriques à suivre :**
- Nombre de campagnes en attente de vidéo
- Temps moyen de création (objectif : < 24h)
- Taux d'erreur d'upload
- Taille moyenne des vidéos uploadées

**Queries utiles :**
```sql
-- Nombre de campagnes en attente
SELECT COUNT(*) 
FROM campaigns c
JOIN campaign_pricing_configs cpc ON cpc.campaign_id = c.id
JOIN campaign_contents cc ON cc.campaign_id = c.id
WHERE cpc.ai_option = true
  AND cc.video_url = 'winstory_delegated'
  AND c.status = 'PENDING_WINSTORY_VIDEO';

-- Temps moyen de création
SELECT 
  AVG(EXTRACT(EPOCH FROM (wi.completed_at - wi.created_at)) / 3600) as avg_hours
FROM winstory_interventions wi
WHERE wi.intervention_type = 'video_creation'
  AND wi.intervention_status = 'completed';
```

---

## 11. Évolutions futures possibles

- [ ] Notifications automatiques (email/Slack) quand une vidéo est requise
- [ ] Dashboard de statistiques (temps moyen, backlog, etc.)
- [ ] Attribution automatique des vidéos aux créateurs
- [ ] Système de révision avant upload
- [ ] Intégration avec outils de création vidéo (API)

---

## 12. Support et contact

Pour toute question ou problème :
1. Vérifier cette documentation
2. Consulter les logs (browser console + server logs)
3. Vérifier la base de données avec les requêtes SQL fournies
4. Contacter l'équipe technique si nécessaire

---

**Dernière mise à jour :** 2024-01-27
**Version :** 1.0.0

