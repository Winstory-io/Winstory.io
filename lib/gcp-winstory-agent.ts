/**
 * Winstory GCP Backend Agent
 * Service Account: ai-video-mint-winstory-v1@winstory.iam.gserviceaccount.com
 * Workload Identity Pool: winstory-pool
 * Project: winstory (ID: 315476326573)
 * 
 * ⚡ Règles strictes:
 * 1. Authentification via Workload Identity Federation (jamais de clé JSON)
 * 2. Retourner un JSON structuré avec status, message, et data
 * 3. Vérifier l'existence des fichiers avant toute opération
 * 4. Gestion d'erreurs explicite dans le JSON
 */

import { Storage } from '@google-cloud/storage';
import { PubSub } from '@google-cloud/pubsub';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Types pour la structuration des réponses
interface WinstoryResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

interface WinstoryCompleteResponse {
  upload?: WinstoryResponse;
  prediction?: WinstoryResponse;
  pubsub?: WinstoryResponse;
}

interface WinstoryInputs {
  localVideoPath?: string;
  bucketName?: string;
  objectName?: string;
  vertexEndpoint?: string;
  vertexInput?: any;
  pubsubTopic?: string;
  pubsubMessage?: any;
}

class WinstoryGCPAgent {
  private auth: GoogleAuth;
  private storage: Storage;
  private pubsub: PubSub;
  private projectId: string;
  private serviceAccountEmail: string;

  constructor() {
    this.projectId = 'winstory';
    this.serviceAccountEmail = 'ai-video-mint-winstory-v1@winstory.iam.gserviceaccount.com';
    
    // Configuration de l'authentification via Workload Identity Federation
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      projectId: this.projectId,
    });

    // Initialisation des clients GCP
    this.storage = new Storage({
      projectId: this.projectId,
      authClient: this.auth,
    });

    this.pubsub = new PubSub({
      projectId: this.projectId,
      authClient: this.auth,
    });
  }

  /**
   * Vérifie l'existence d'un fichier local
   */
  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valide les inputs reçus
   */
  private validateInputs(inputs: WinstoryInputs): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (inputs.localVideoPath && !inputs.bucketName) {
      errors.push('bucketName is required when localVideoPath is provided');
    }

    if (inputs.localVideoPath && !inputs.objectName) {
      errors.push('objectName is required when localVideoPath is provided');
    }

    if (inputs.vertexEndpoint && !inputs.vertexInput) {
      errors.push('vertexInput is required when vertexEndpoint is provided');
    }

    if (inputs.pubsubTopic && !inputs.pubsubMessage) {
      errors.push('pubsubMessage is required when pubsubTopic is provided');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 1. Upload de fichier vidéo vers Cloud Storage
   */
  async uploadVideoToStorage(
    localVideoPath: string,
    bucketName: string,
    objectName: string
  ): Promise<WinstoryResponse> {
    try {
      // Vérification de l'existence du fichier local
      const fileExists = await this.checkFileExists(localVideoPath);
      if (!fileExists) {
        return {
          status: 'error',
          message: `File not found: ${localVideoPath}`,
        };
      }

      // Vérification de la taille du fichier
      const stats = await fs.promises.stat(localVideoPath);
      if (stats.size === 0) {
        return {
          status: 'error',
          message: 'File is empty',
        };
      }

      // Upload vers Cloud Storage avec mode résilient
      const bucket = this.storage.bucket(bucketName);
      const file = bucket.file(objectName);

      // Configuration de l'upload avec reprise automatique
      const uploadOptions = {
        resumable: true,
        timeout: 300000, // 5 minutes timeout
        metadata: {
          contentType: this.getContentType(localVideoPath),
          metadata: {
            uploadedBy: this.serviceAccountEmail,
            uploadedAt: new Date().toISOString(),
            originalName: path.basename(localVideoPath),
          },
        },
      };

      await bucket.upload(localVideoPath, {
        destination: objectName,
        ...uploadOptions,
      });

      // Vérification que l'upload a réussi
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error('Upload failed - file not found in bucket after upload');
      }

      return {
        status: 'success',
        message: 'Upload completed',
        data: {
          bucket: bucketName,
          object: objectName,
          size: stats.size,
          contentType: uploadOptions.metadata.contentType,
        },
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `Upload failed: ${error.message}`,
      };
    }
  }

  /**
   * 2. Prédiction via Vertex AI
   */
  async runVertexPrediction(endpoint: string, inputData: any): Promise<WinstoryResponse> {
    try {
      // Configuration du client Vertex AI
      const aiplatform = google.aiplatform('v1');
      
      // Authentification
      const authClient = await this.auth.getClient();
      google.options({ auth: authClient });

      // Préparation de la requête de prédiction
      const request = {
        endpoint: `projects/${this.projectId}/locations/us-central1/endpoints/${endpoint}`,
        requestBody: {
          instances: [inputData],
        },
      };

      // Exécution de la prédiction
      const response = await aiplatform.projects.locations.endpoints.predict(request);

      if (!response.data.predictions) {
        throw new Error('No predictions returned from Vertex AI');
      }

      return {
        status: 'success',
        message: 'Prediction completed',
        data: {
          prediction: response.data.predictions[0],
          modelDisplayName: response.data.modelDisplayName,
          deployedModelId: response.data.deployedModelId,
        },
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `Vertex AI prediction failed: ${error.message}`,
      };
    }
  }

  /**
   * 3. Publication de message dans Pub/Sub
   */
  async publishToPubSub(topicName: string, message: any): Promise<WinstoryResponse> {
    try {
      // Récupération du topic
      const topic = this.pubsub.topic(topicName);

      // Vérification de l'existence du topic
      const [topicExists] = await topic.exists();
      if (!topicExists) {
        throw new Error(`Topic does not exist: ${topicName}`);
      }

      // Préparation du message
      const messageBuffer = Buffer.from(JSON.stringify(message));
      const messageAttributes = {
        source: 'winstory-backend-agent',
        timestamp: new Date().toISOString(),
        serviceAccount: this.serviceAccountEmail,
      };

      // Publication du message
      const messageId = await topic.publishMessage({
        data: messageBuffer,
        attributes: messageAttributes,
      });

      return {
        status: 'success',
        message: 'Message published',
        data: {
          topic: topicName,
          messageId: messageId,
          messageSize: messageBuffer.length,
        },
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `Pub/Sub publication failed: ${error.message}`,
      };
    }
  }

  /**
   * Orchestrateur principal - Exécute toutes les tâches dans l'ordre
   * Ordre: upload → prédiction → Pub/Sub
   */
  async executeWinstoryWorkflow(inputs: WinstoryInputs): Promise<WinstoryCompleteResponse> {
    const result: WinstoryCompleteResponse = {};

    // Validation des inputs
    const validation = this.validateInputs(inputs);
    if (!validation.isValid) {
      const errorResponse: WinstoryResponse = {
        status: 'error',
        message: `Input validation failed: ${validation.errors.join(', ')}`,
      };
      return { upload: errorResponse, prediction: errorResponse, pubsub: errorResponse };
    }

    try {
      // 1. Upload vers Cloud Storage (si requis)
      if (inputs.localVideoPath && inputs.bucketName && inputs.objectName) {
        console.log('🚀 Starting video upload to Cloud Storage...');
        result.upload = await this.uploadVideoToStorage(
          inputs.localVideoPath,
          inputs.bucketName,
          inputs.objectName
        );

        // Si l'upload échoue, on continue mais on le note
        if (result.upload.status === 'error') {
          console.error('❌ Upload failed:', result.upload.message);
        } else {
          console.log('✅ Upload completed successfully');
        }
      }

      // 2. Prédiction Vertex AI (si requis)
      if (inputs.vertexEndpoint && inputs.vertexInput) {
        console.log('🤖 Starting Vertex AI prediction...');
        result.prediction = await this.runVertexPrediction(
          inputs.vertexEndpoint,
          inputs.vertexInput
        );

        if (result.prediction.status === 'error') {
          console.error('❌ Prediction failed:', result.prediction.message);
        } else {
          console.log('✅ Prediction completed successfully');
        }
      }

      // 3. Publication Pub/Sub (si requis)
      if (inputs.pubsubTopic && inputs.pubsubMessage) {
        console.log('📤 Starting Pub/Sub publication...');
        result.pubsub = await this.publishToPubSub(
          inputs.pubsubTopic,
          inputs.pubsubMessage
        );

        if (result.pubsub.status === 'error') {
          console.error('❌ Pub/Sub publication failed:', result.pubsub.message);
        } else {
          console.log('✅ Pub/Sub publication completed successfully');
        }
      }

      return result;
    } catch (error: any) {
      const errorResponse: WinstoryResponse = {
        status: 'error',
        message: `Workflow execution failed: ${error.message}`,
      };
      return { upload: errorResponse, prediction: errorResponse, pubsub: errorResponse };
    }
  }

  /**
   * Fonction utilitaire pour déterminer le type de contenu
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.wmv': 'video/x-ms-wmv',
      '.flv': 'video/x-flv',
      '.webm': 'video/webm',
      '.mkv': 'video/x-matroska',
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Fonction de test de connectivité GCP
   */
  async testGCPConnectivity(): Promise<WinstoryResponse> {
    try {
      // Test de l'authentification
      const authClient = await this.auth.getClient();
      const credentials = await authClient.getAccessToken();

      if (!credentials.token) {
        throw new Error('Failed to obtain access token');
      }

      // Test de connectivité Storage
      const buckets = await this.storage.getBuckets({ maxResults: 1 });

      // Test de connectivité Pub/Sub
      const topics = await this.pubsub.getTopics({ pageSize: 1 });

      return {
        status: 'success',
        message: 'GCP connectivity test passed',
        data: {
          projectId: this.projectId,
          serviceAccount: this.serviceAccountEmail,
          authenticationStatus: 'success',
          storageAccess: 'success',
          pubsubAccess: 'success',
          bucketsCount: buckets[0]?.length || 0,
          topicsCount: topics[0]?.length || 0,
        },
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `GCP connectivity test failed: ${error.message}`,
      };
    }
  }
}

// Export de la classe et des types
export { WinstoryGCPAgent, WinstoryInputs, WinstoryResponse, WinstoryCompleteResponse };

// Instance singleton pour utilisation directe
export const winstoryAgent = new WinstoryGCPAgent();

// Fonctions de commodité pour utilisation simplifiée
export async function uploadVideo(
  localPath: string,
  bucket: string,
  objectName: string
): Promise<WinstoryResponse> {
  return winstoryAgent.uploadVideoToStorage(localPath, bucket, objectName);
}

export async function runPrediction(
  endpoint: string,
  input: any
): Promise<WinstoryResponse> {
  return winstoryAgent.runVertexPrediction(endpoint, input);
}

export async function publishMessage(
  topic: string,
  message: any
): Promise<WinstoryResponse> {
  return winstoryAgent.publishToPubSub(topic, message);
}

export async function executeComplete(inputs: WinstoryInputs): Promise<WinstoryCompleteResponse> {
  return winstoryAgent.executeWinstoryWorkflow(inputs);
}

export async function testConnection(): Promise<WinstoryResponse> {
  return winstoryAgent.testGCPConnectivity();
}
