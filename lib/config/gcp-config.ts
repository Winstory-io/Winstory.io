/**
 * Configuration GCP pour Winstory
 * Centralise toutes les configurations Google Cloud Platform
 */

export const GCP_CONFIG = {
  // Configuration du projet
  PROJECT_ID: 'winstory',
  PROJECT_NUMBER: '315476326573',
  
  // Configuration du service account et Workload Identity
  SERVICE_ACCOUNT: {
    EMAIL: 'ai-video-mint-winstory-v1@winstory.iam.gserviceaccount.com',
    WORKLOAD_IDENTITY_POOL: 'winstory-pool',
  },

  // Configuration par défaut des régions
  REGIONS: {
    DEFAULT: 'us-central1',
    VERTEX_AI: 'us-central1',
    STORAGE: 'us-central1',
    PUBSUB: 'global',
  },

  // Configuration Cloud Storage
  STORAGE: {
    DEFAULT_BUCKET: 'winstory-videos',
    VIDEO_BUCKET: 'winstory-video-uploads',
    PROCESSED_BUCKET: 'winstory-processed-videos',
    BACKUP_BUCKET: 'winstory-backups',
    UPLOAD_OPTIONS: {
      resumable: true,
      timeout: 300000, // 5 minutes
      chunkSize: 1024 * 1024 * 8, // 8MB chunks
    },
  },

  // Configuration Vertex AI
  VERTEX_AI: {
    DEFAULT_ENDPOINT: 'video-analysis-endpoint',
    MODELS: {
      VIDEO_CLASSIFICATION: 'video-classifier-v1',
      CONTENT_MODERATION: 'content-moderator-v1',
      QUALITY_ASSESSMENT: 'quality-assessor-v1',
    },
    PREDICTION_TIMEOUT: 60000, // 1 minute
  },

  // Configuration Pub/Sub
  PUBSUB: {
    TOPICS: {
      VIDEO_UPLOADED: 'winstory-video-uploaded',
      PREDICTION_COMPLETE: 'winstory-prediction-complete',
      WORKFLOW_STATUS: 'winstory-workflow-status',
      ERROR_NOTIFICATIONS: 'winstory-errors',
    },
    SUBSCRIPTION_OPTIONS: {
      ackDeadlineSeconds: 60,
      messageRetentionDuration: 604800, // 7 days
    },
  },

  // Configuration des scopes OAuth2
  SCOPES: [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/storage.full_control',
    'https://www.googleapis.com/auth/pubsub',
    'https://www.googleapis.com/auth/aiplatform',
  ],

  // Limites et quotas
  LIMITS: {
    MAX_VIDEO_SIZE: 1024 * 1024 * 1024 * 2, // 2GB
    MAX_CONCURRENT_UPLOADS: 5,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Messages par défaut
  MESSAGES: {
    UPLOAD_SUCCESS: 'Video uploaded successfully to Cloud Storage',
    PREDICTION_SUCCESS: 'Vertex AI prediction completed successfully',
    PUBSUB_SUCCESS: 'Message published to Pub/Sub successfully',
    WORKFLOW_COMPLETE: 'Winstory workflow completed successfully',
  },
} as const;

// Types dérivés de la configuration
export type GCPRegion = keyof typeof GCP_CONFIG.REGIONS;
export type StorageBucket = keyof typeof GCP_CONFIG.STORAGE;
export type VertexModel = keyof typeof GCP_CONFIG.VERTEX_AI.MODELS;
export type PubSubTopic = keyof typeof GCP_CONFIG.PUBSUB.TOPICS;

// Validation de la configuration
export function validateGCPConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validation des variables d'environnement requises
  const requiredEnvVars = [
    'GOOGLE_APPLICATION_CREDENTIALS',
    'GOOGLE_CLOUD_PROJECT',
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper pour obtenir les URLs des endpoints
export function getVertexEndpointUrl(endpointId: string): string {
  return `projects/${GCP_CONFIG.PROJECT_ID}/locations/${GCP_CONFIG.REGIONS.VERTEX_AI}/endpoints/${endpointId}`;
}

export function getStorageBucketUrl(bucketName: string): string {
  return `gs://${bucketName}`;
}

export function getPubSubTopicUrl(topicName: string): string {
  return `projects/${GCP_CONFIG.PROJECT_ID}/topics/${topicName}`;
}
