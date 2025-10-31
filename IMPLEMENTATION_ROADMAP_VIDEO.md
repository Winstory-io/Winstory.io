# 🗺️ Roadmap d'implémentation - Système Vidéo Winstory

## Vue d'ensemble

Ce document détaille la feuille de route pour implémenter toutes les fonctionnalités vidéo spécifiées dans `SPECIFICATIONS_VIDEO.md`.

---

## ✅ Phase 1 : Fondations (IMMÉDIAT)

### 1.1 Validation côté client ✅ FAIT
- [x] Créer `/lib/videoValidation.ts`
- [x] Fonction `validateVideoFile()` (format MP4, taille 100 MB)
- [x] Fonction `extractVideoMetadata()` (durée, résolution, orientation)
- [x] Fonction `validateCompletionOrientation()` (respect orientation campagne)

### 1.2 Intégration dans les pages existantes
- [ ] **Page `/app/creation/b2c/yourfilm/page.tsx`**
  - [ ] Importer `validateVideoComplete()`
  - [ ] Valider avant de stocker dans IndexedDB
  - [ ] Afficher erreurs de validation
  - [ ] Montrer métadonnées (durée, résolution, taille)

- [ ] **Page `/app/creation/individual/yourfilm/page.tsx`**
  - [ ] Même validation que B2C

- [ ] **Page `/app/creation/agencyb2c/yourfilm/page.tsx`**
  - [ ] Même validation que B2C

- [ ] **Composant `CompletionPopup.tsx`**
  - [ ] Valider orientation par rapport à la campagne
  - [ ] Récupérer orientation depuis `currentCampaign.video_orientation`
  - [ ] Bloquer si orientation incorrecte

### 1.3 Génération de thumbnails
- [ ] Intégrer `generateThumbnail()` lors de l'upload
- [ ] Uploader thumbnail vers S3 (`/thumbnails`)
- [ ] Enregistrer `thumbnail_url` en DB

### 1.4 Métadonnées en base de données
- [ ] Exécuter migration SQL :
```sql
ALTER TABLE campaign_contents 
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS resolution_width INTEGER,
  ADD COLUMN IF NOT EXISTS resolution_height INTEGER,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mint_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS validation_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS refusal_date TIMESTAMP WITH TIME ZONE;
```
- [ ] Mettre à jour `app/api/campaigns/create/route.ts` pour enregistrer les métadonnées

---

## 🟡 Phase 2 : Optimisation & Performance (COURT TERME)

### 2.1 Compression AWS Lambda
- [ ] **Créer fonction Lambda** `winstory-video-compressor`
  - [ ] Setup FFmpeg layer pour Lambda
  - [ ] Code de compression (H.264, CRF 23)
  - [ ] Remplacement vidéo dans S3

- [ ] **Configurer S3 Event Notification**
  - [ ] Trigger Lambda sur upload dans `/pending`
  - [ ] Filtrer par extension `.mp4`

- [ ] **Monitoring**
  - [ ] CloudWatch logs pour tracking compression
  - [ ] Alertes si échec compression

### 2.2 Presigned URLs pour `/pending`
- [ ] **Créer API** `/app/api/s3/presigned-url/route.ts`
  - [ ] Vérifier éligibilité modérateur
  - [ ] Générer URL signée (expiration 1h)

- [ ] **Modifier page modération**
  - [ ] Récupérer presigned URL avant affichage vidéo
  - [ ] Renouveler URL si expirée

- [ ] **Configurer bucket S3**
  - [ ] `/pending` : Privé
  - [ ] `/success` : Public
  - [ ] `/thumbnails` : Public

### 2.3 Tracking des vues
- [ ] **Créer fonction SQL**
```sql
CREATE OR REPLACE FUNCTION increment_view_count(p_campaign_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE campaign_contents
  SET view_count = view_count + 1
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Créer API** `/app/api/videos/track-view/route.ts`
  - [ ] Éviter doubles comptages (localStorage)
  - [ ] Appeler fonction RPC

- [ ] **Intégrer dans VideoPlayer**
  - [ ] Tracker au démarrage de la lecture
  - [ ] Débounce pour éviter spam

### 2.4 Dashboard /mywin
- [ ] **Afficher statistiques vidéo**
  - [ ] Nombre de vues
  - [ ] Status modération
  - [ ] Votes en cours (si pending)
  - [ ] Ratio Valid/Refuse

- [ ] **Section notifications**
  - [ ] Campagne passée en modération
  - [ ] Campagne validée
  - [ ] Campagne refusée
  - [ ] Completion dans TOP 3

---

## 🟢 Phase 3 : Fonctionnalités Avancées (MOYEN TERME)

### 3.1 Watermarking automatique
- [ ] **Créer fonction Lambda** `winstory-watermark-applier`
  - [ ] Trigger lors déplacement vers `/success`
  - [ ] Overlay logo Winstory (bas droite, opacité 30%)
  - [ ] FFmpeg complexFilter

- [ ] **Assets**
  - [ ] Créer logo watermark (PNG transparent)
  - [ ] Uploader dans S3 ou Layer Lambda

- [ ] **Intégration**
  - [ ] Appliquer uniquement sur `/success/initial` et `/success/completions`
  - [ ] Pas de watermark sur `/pending`

### 3.2 Préchargement vidéo (Modération)
- [ ] **Modifier `/app/moderation/page.tsx`**
  - [ ] State `nextContent` pour vidéo suivante
  - [ ] Hook `useEffect` pour préchargement
  - [ ] Créer élément `<video>` invisible avec `preload="auto"`

- [ ] **API `/api/moderation/next-content`**
  - [ ] Paramètre `excludeIds` pour exclure contenu actuel
  - [ ] Retourner contenu suivant selon priorités

### 3.3 Player Court-métrage
- [ ] **Créer composant** `ShortFilmPlayer.tsx`
  - [ ] Lecture séquentielle : création → transition → completion
  - [ ] Écran noir + logo (0.1s) entre les deux
  - [ ] Contrôles : PiP, sous-titres

- [ ] **Créer transitions**
  - [ ] Animation logo Winstory (0.1s)
  - [ ] Fade in/out smooth

- [ ] **Intégration**
  - [ ] Page Explorer (sélection completion)
  - [ ] Page campagne détaillée

### 3.4 Re-upload en cas de refus
- [ ] **Créer workflow re-upload**
  - [ ] Afficher raisons du refus
  - [ ] Checklist des violations
  - [ ] Rediriger vers `/creation/yourfilm` avec state

- [ ] **Vérification MINTs disponibles**
  - [ ] Checker balance utilisateur
  - [ ] Bloquer si pas de MINT et prix > 0
  - [ ] Proposer achat MINT

---

## 🔵 Phase 4 : Expérience Utilisateur (LONG TERME)

### 4.1 CDN CloudFront
- [ ] **Configurer CloudFront**
  - [ ] Distribution devant bucket S3
  - [ ] Compression automatique (Gzip, Brotli)
  - [ ] Edge locations pour latence réduite

- [ ] **Mettre à jour URLs**
  - [ ] Utiliser CloudFront domain au lieu de S3 direct
  - [ ] Invalider cache lors de changements

### 4.2 Thumbnail personnalisé
- [ ] **Interface de sélection**
  - [ ] Timeline avec frames
  - [ ] Sélection frame custom
  - [ ] Preview en temps réel

- [ ] **Enregistrement choix**
  - [ ] Stocker `thumbnail_timestamp` en DB
  - [ ] Régénérer thumbnail au timestamp choisi

### 4.3 Sous-titres automatiques
- [ ] **Intégration service transcription**
  - [ ] AWS Transcribe ou équivalent
  - [ ] Générer SRT/VTT automatiquement

- [ ] **Upload sous-titres**
  - [ ] Stocker dans S3 (`/subtitles`)
  - [ ] Format WebVTT

- [ ] **Player avec sous-titres**
  - [ ] Track `<track kind="subtitles">`
  - [ ] Toggle on/off

### 4.4 Mobile responsive avancé
- [ ] **Stories-style pour vidéos verticales**
  - [ ] Swipe up/down navigation
  - [ ] Fullscreen par défaut
  - [ ] Interface minimale

- [ ] **Modération mobile**
  - [ ] Swipe pour voter (left = refuse, right = valid)
  - [ ] Interface tactile optimisée
  - [ ] Notes par tap (étoiles)

### 4.5 Analytics avancés
- [ ] **Métriques détaillées**
  - [ ] Temps de visionnage moyen
  - [ ] Taux de complétion
  - [ ] Heatmap des moments clés
  - [ ] Taux de rétention

- [ ] **Dashboard créateurs**
  - [ ] Graphiques évolution vues
  - [ ] Comparaison avec moyenne plateforme
  - [ ] Conseils d'optimisation

---

## 📊 Priorisation

### 🔴 CRITIQUE (Bloquer release)
1. Validation vidéo côté client
2. Métadonnées en DB
3. Génération thumbnails
4. Validation orientation completions

### 🟠 IMPORTANT (Améliorer UX significativement)
5. Compression Lambda
6. Presigned URLs pour sécurité
7. Tracking vues
8. Dashboard /mywin

### 🟡 SOUHAITABLE (Nice to have)
9. Watermarking
10. Préchargement modération
11. Player court-métrage
12. Re-upload refus

### 🟢 FUTUR (Roadmap long terme)
13. CDN CloudFront
14. Thumbnail personnalisé
15. Sous-titres
16. Mobile avancé

---

## 🧪 Tests à effectuer

### Tests fonctionnels
- [ ] Upload vidéo MP4 valide → Succès
- [ ] Upload vidéo > 100 MB → Erreur
- [ ] Upload non-MP4 → Erreur
- [ ] Upload vidéo corrompue → Erreur
- [ ] Completion orientation incorrecte → Erreur
- [ ] Génération thumbnail → Succès
- [ ] Métadonnées extraites correctement

### Tests performance
- [ ] Upload 50 MB → Temps acceptable
- [ ] Compression Lambda → < 2 minutes
- [ ] Préchargement vidéo → Pas de lag
- [ ] CDN CloudFront → Latence réduite

### Tests sécurité
- [ ] Presigned URL expire après 1h
- [ ] Modérateur non-éligible → Accès refusé
- [ ] Bucket `/pending` privé
- [ ] Bucket `/success` public

---

## 📝 Notes d'implémentation

### Ordre recommandé
1. **Semaine 1** : Phase 1 (Fondations)
2. **Semaine 2-3** : Phase 2 (Optimisation)
3. **Semaine 4-5** : Phase 3 (Avancées)
4. **Mois 2+** : Phase 4 (UX long terme)

### Dépendances
- AWS Lambda nécessite :
  - FFmpeg layer
  - Rôle IAM avec accès S3
  - Configuration S3 Events

- CloudFront nécessite :
  - DNS configuré
  - Certificat SSL
  - Invalidation cache automatisée

### Budget estimé
- **Stockage S3** : ~$0.023/GB/mois
- **Lambda** : ~$0.20/million requêtes + compute
- **CloudFront** : ~$0.085/GB transfert
- **Total estimé** : ~$50-200/mois selon usage

---

**🚀 Prêt pour l'implémentation ! Commencer par Phase 1.**

