# 🎬 Gestion du cycle de vie des vidéos S3

## 📋 Vue d'ensemble

Ce document décrit l'implémentation complète de la gestion automatique des vidéos S3 lors des décisions finales de modération (validation/refus).

## ✅ Ce qui a été implémenté

### 1. **Fonctions utilitaires S3** (`lib/s3Utils.ts`)

- `extractS3KeyFromUrl(url: string)`: Extrait la clé S3 depuis une URL complète
- `isS3Url(url: string)`: Vérifie si une URL est une URL S3 valide
- `buildS3Url(key: string, bucketName?: string, region?: string)`: Construit une URL S3 complète

### 2. **API de décision finale** (`app/api/s3/final-decision/route.ts`)

Endpoint `POST /api/s3/final-decision` qui gère le déplacement/suppression des vidéos selon la décision finale :

#### Pour les **CAMPAGNES INITIALES** :
- ✅ **VALIDATED** → Déplace de `/pending` vers `/success/initial`
- ❌ **REFUSED** → Supprime de `/pending` (metadata conservée)

#### Pour les **COMPLETIONS** :
- ✅ **VALIDATED + TOP 3** → Déplace de `/pending` vers `/success/completions`
- ✅ **VALIDATED + HORS TOP 3** → Supprime de `/pending` (metadata conservée)
- ❌ **REFUSED** → Supprime de `/pending` (metadata conservée)

### 3. **API de vérification** (`app/api/moderation/check-final-decision/route.ts`)

Endpoint `POST /api/moderation/check-final-decision` qui :
1. Récupère les données de modération depuis la base de données
2. Vérifie si toutes les conditions de validation sont remplies
3. Appelle automatiquement `/api/s3/final-decision` si une décision finale est atteinte

### 4. **Intégration automatique** (`lib/hooks/useModeration.ts`)

Après chaque vote ou score de modération :
- Vérifie automatiquement si une décision finale est atteinte
- Déclenche le déplacement/suppression des vidéos S3 si nécessaire
- Met à jour la base de données avec la nouvelle URL ou le statut

## 🔄 Flux complet

```
1. Modérateur vote sur /moderation
   ↓
2. Vote sauvegardé dans DB
   ↓
3. Vérification automatique : check-final-decision
   ↓
4. Si conditions remplies → final-decision
   ↓
5. Déplacement/suppression S3
   ↓
6. Mise à jour DB avec nouvelle URL
```

## 📁 Structure S3

```
winstory-videos/
├── pending/              # Vidéos en attente de modération
│   ├── campaign_123_video.mp4
│   └── completion_456_video.mp4
│
├── success/
│   ├── initial/         # Campagnes initiales validées
│   │   └── campaign_123_video.mp4
│   │
│   └── completions/     # Complétions TOP 3 validées
│       └── completion_456_video.mp4
│
└── (vide supprimée si refusée ou hors TOP 3)
```

## 🔧 Utilisation

### Appel manuel (pour debug ou cron job)

```typescript
// Vérifier une campagne spécifique
const response = await fetch('/api/moderation/check-final-decision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 'campaign_123',
    campaignType: 'INITIAL',
  }),
});
```

### Automatique

Le système vérifie automatiquement après chaque vote. Aucune action manuelle nécessaire.

## ⚠️ TODO : TOP 3 pour les complétions

La logique de détermination du TOP 3 doit encore être implémentée. Actuellement, `isTop3` est défini à `true` par défaut pour les complétions validées.

**À implémenter :**
1. Après la fin de la période de complétion (1 semaine) ou 100% de complétions
2. Calculer la moyenne des scores pour toutes les complétions validées
3. Classer les complétions (minimum 5 pour avoir un classement)
4. Identifier le TOP 3
5. Appeler `/api/s3/final-decision` pour chaque complétion avec `isTop3: true/false`

## 🔐 Variables d'environnement requises

```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=winstory-videos
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Pour les appels internes
```

## 📝 Notes importantes

1. **Idempotence** : L'API `final-decision` peut être appelée plusieurs fois sans problème (vérifie que la vidéo est dans `/pending` avant traitement)

2. **Gestion d'erreurs** : Les erreurs S3 ne bloquent pas le processus de modération. Elles sont loggées mais n'empêchent pas les votes.

3. **Metadata** : Même si la vidéo est supprimée (refus ou hors TOP 3), toutes les metadata sont conservées dans la base de données.

4. **Statut DB** : Le statut de la campagne/complétion est mis à jour avec `VALIDATED` ou `REFUSED` après traitement S3.

