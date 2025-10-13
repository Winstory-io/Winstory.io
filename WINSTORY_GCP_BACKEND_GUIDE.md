# 🚀 Winstory GCP Backend Agent - Guide Complet

## 📋 Vue d'ensemble

Le **Winstory GCP Backend Agent** est un système automatisé pour gérer les tâches cloud avec Google Cloud Platform. Il utilise l'authentification via **Workload Identity Federation** pour sécuriser l'accès aux services GCP sans clés JSON.

### 🏗️ Architecture

```
Service Account: ai-video-mint-winstory-v1@winstory.iam.gserviceaccount.com
Workload Identity Pool: winstory-pool  
Projet GCP: winstory (ID: 315476326573)

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloud Storage  │    │   Vertex AI     │    │    Pub/Sub      │
│   (Upload)      │───▶│ (Prédictions)   │───▶│ (Notifications) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Installation

### 1. Dépendances

Les dépendances sont déjà ajoutées dans `package.json` :

```bash
npm install @google-cloud/storage @google-cloud/pubsub google-auth-library googleapis
```

### 2. Variables d'environnement

Créez un fichier `.env.local` :

```bash
# GCP Configuration
GOOGLE_CLOUD_PROJECT=winstory
GOOGLE_APPLICATION_CREDENTIALS=/path/to/workload-identity-config.json

# Winstory Specific
WINSTORY_SERVICE_ACCOUNT=ai-video-mint-winstory-v1@winstory.iam.gserviceaccount.com
WINSTORY_WORKLOAD_POOL=winstory-pool
```

## 📁 Structure des fichiers

```
lib/
├── gcp-winstory-agent.ts     # Service principal
├── config/
│   └── gcp-config.ts         # Configuration centralisée
│
app/api/winstory/
├── gcp-workflow/route.ts     # API workflow complet
├── upload-video/route.ts     # API upload seul
├── vertex-predict/route.ts   # API prédiction seule
└── pubsub-publish/route.ts   # API Pub/Sub seul

examples/
└── gcp-winstory-usage.ts     # Exemples d'utilisation
```

## 🎯 Utilisation

### 1. Workflow Complet (Recommandé)

```typescript
import { executeComplete, WinstoryInputs } from '@/lib/gcp-winstory-agent';

const inputs: WinstoryInputs = {
  // Upload vidéo
  localVideoPath: '/path/to/video.mp4',
  bucketName: 'winstory-videos',
  objectName: 'campaigns/video-123.mp4',

  // Prédiction Vertex AI  
  vertexEndpoint: 'video-analysis-endpoint',
  vertexInput: {
    videoUrl: 'gs://winstory-videos/campaigns/video-123.mp4',
    analysisType: 'content_moderation'
  },

  // Publication Pub/Sub
  pubsubTopic: 'winstory-video-processed',
  pubsubMessage: {
    videoId: 'video-123',
    status: 'processed',
    timestamp: new Date().toISOString()
  }
};

const result = await executeComplete(inputs);
console.log('Workflow result:', result);
```

### 2. Services Individuels

#### Upload Cloud Storage
```typescript
import { uploadVideo } from '@/lib/gcp-winstory-agent';

const result = await uploadVideo(
  '/local/video.mp4',
  'winstory-videos', 
  'uploads/video-001.mp4'
);
```

#### Prédiction Vertex AI
```typescript
import { runPrediction } from '@/lib/gcp-winstory-agent';

const result = await runPrediction(
  'video-classifier-endpoint',
  { videoUri: 'gs://bucket/video.mp4' }
);
```

#### Publication Pub/Sub
```typescript
import { publishMessage } from '@/lib/gcp-winstory-agent';

const result = await publishMessage(
  'winstory-events',
  { eventType: 'video_processed', videoId: '123' }
);
```

### 3. Via API HTTP

#### Test de connectivité
```bash
curl -X GET http://localhost:3000/api/winstory/gcp-workflow
```

#### Workflow complet
```bash
curl -X POST http://localhost:3000/api/winstory/gcp-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "localVideoPath": "/tmp/video.mp4",
    "bucketName": "winstory-videos",
    "objectName": "test/video.mp4",
    "vertexEndpoint": "analysis-endpoint",
    "vertexInput": {"videoUri": "gs://winstory-videos/test/video.mp4"},
    "pubsubTopic": "winstory-events",
    "pubsubMessage": {"status": "completed"}
  }'
```

## 📊 Format des Réponses

### Réponse Succès
```json
{
  "upload": {
    "status": "success",
    "message": "Upload completed",
    "data": {
      "bucket": "winstory-videos",
      "object": "video.mp4",
      "size": 125829120,
      "contentType": "video/mp4"
    }
  },
  "prediction": {
    "status": "success", 
    "message": "Prediction completed",
    "data": {
      "prediction": {
        "contentScore": 0.95,
        "categories": {"safe": 0.98, "violence": 0.01}
      }
    }
  },
  "pubsub": {
    "status": "success",
    "message": "Message published", 
    "data": {
      "topic": "winstory-events",
      "messageId": "1234567890",
      "messageSize": 256
    }
  }
}
```

### Réponse Erreur
```json
{
  "upload": {
    "status": "error",
    "message": "File not found: /path/to/video.mp4"
  },
  "prediction": {
    "status": "error", 
    "message": "Vertex AI prediction failed: Invalid endpoint"
  },
  "pubsub": {
    "status": "error",
    "message": "Topic does not exist: invalid-topic"
  }
}
```

## 🔒 Sécurité

### Authentification Workload Identity

Le système utilise **Workload Identity Federation** pour l'authentification :

- ✅ **Pas de clé JSON** stockée localement
- ✅ Authentification via le service account configuré
- ✅ Accès sécurisé aux ressources GCP
- ✅ Rotation automatique des tokens

### Permissions Requises

Le service account `ai-video-mint-winstory-v1@winstory.iam.gserviceaccount.com` doit avoir :

```bash
# Storage
roles/storage.admin

# Vertex AI  
roles/aiplatform.user
roles/ml.admin

# Pub/Sub
roles/pubsub.publisher
roles/pubsub.subscriber

# IAM (pour Workload Identity)
roles/iam.workloadIdentityUser
```

## ⚡ Configuration Avancée

### Limits et Quotas

```typescript
// Dans gcp-config.ts
LIMITS: {
  MAX_VIDEO_SIZE: 1024 * 1024 * 1024 * 2, // 2GB
  MAX_CONCURRENT_UPLOADS: 5,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
}
```

### Buckets par Défaut

```typescript
STORAGE: {
  VIDEO_BUCKET: 'winstory-video-uploads',
  PROCESSED_BUCKET: 'winstory-processed-videos', 
  BACKUP_BUCKET: 'winstory-backups',
}
```

### Topics Pub/Sub

```typescript
PUBSUB: {
  TOPICS: {
    VIDEO_UPLOADED: 'winstory-video-uploaded',
    PREDICTION_COMPLETE: 'winstory-prediction-complete',
    WORKFLOW_STATUS: 'winstory-workflow-status',
  }
}
```

## 🚀 Démarrage Rapide

### 1. Installation
```bash
cd /Users/voteer/Downloads/Winstory.io-main
npm install
```

### 2. Configuration environnement
```bash
# Copier le fichier de configuration
cp .env.example .env.local

# Éditer les variables GCP
vim .env.local
```

### 3. Test de connectivité
```bash
# Via API
curl http://localhost:3000/api/winstory/gcp-workflow

# Via code
npm run dev
# Ouvrir http://localhost:3000/api/winstory/gcp-workflow
```

### 4. Premier workflow
```typescript
import { executeComplete } from '@/lib/gcp-winstory-agent';

// Test simple
const result = await executeComplete({
  pubsubTopic: 'winstory-test',
  pubsubMessage: { test: 'hello winstory' }
});

console.log(result);
```

## 🛠️ Développement

### Tests
```bash
# Test de connectivité
npm run test:gcp-connectivity

# Test workflow complet  
npm run test:gcp-workflow

# Tous les tests
npm run test:gcp
```

### Debug
```bash
# Logs détaillés
DEBUG=winstory:gcp npm run dev

# Logs GCP uniquement
DEBUG=@google-cloud/* npm run dev
```

### Monitoring
```bash
# Métriques GCP
npm run monitor:gcp

# Dashboard Winstory
npm run dashboard:winstory
```

## 📞 Support

### Erreurs Communes

#### 1. "Failed to obtain access token"
```bash
# Vérifier la configuration Workload Identity
gcloud auth application-default login
gcloud config set project winstory
```

#### 2. "Topic does not exist"
```bash
# Créer le topic manquant
gcloud pubsub topics create winstory-events
```

#### 3. "Bucket access denied"  
```bash
# Vérifier les permissions du service account
gcloud projects add-iam-policy-binding winstory \
  --member="serviceAccount:ai-video-mint-winstory-v1@winstory.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### Logs Utiles

```typescript
// Activer les logs détaillés
process.env.DEBUG = 'winstory:*';

// Dans le code
import { testConnection } from '@/lib/gcp-winstory-agent';
const healthCheck = await testConnection();
console.log('GCP Status:', healthCheck);
```

## 🎯 Prochaines Étapes

1. **Installer les dépendances** : `npm install`
2. **Configurer les variables d'environnement**
3. **Tester la connectivité** : `GET /api/winstory/gcp-workflow`
4. **Exécuter le premier workflow**
5. **Intégrer dans votre application Winstory**

---

🔥 **Le backend GCP Winstory est prêt !** 

Toutes les fonctions retournent des **JSON structurés** avec `status`, `message`, et `data`. L'authentification se fait via **Workload Identity Federation** (pas de clés JSON). Le système supporte les **uploads résiliants**, **prédictions Vertex AI**, et **notifications Pub/Sub**.

**Happy coding ! 🚀**
