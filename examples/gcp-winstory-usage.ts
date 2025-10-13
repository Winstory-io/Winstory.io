/**
 * Exemples d'utilisation du service GCP Winstory
 * 
 * Ce fichier contient des exemples pratiques pour utiliser
 * le backend GCP automatisé de Winstory
 */

import { 
  winstoryAgent, 
  executeComplete, 
  uploadVideo,
  runPrediction,
  publishMessage,
  testConnection,
  WinstoryInputs 
} from '@/lib/gcp-winstory-agent';
import { GCP_CONFIG } from '@/lib/config/gcp-config';

// ==========================================
// EXEMPLE 1: Workflow complet automatisé
// ==========================================

async function exempleWorkflowComplet() {
  console.log('🚀 Exemple: Workflow GCP complet');

  const inputs: WinstoryInputs = {
    // Upload vidéo
    localVideoPath: '/path/to/local/video.mp4',
    bucketName: 'winstory-videos',
    objectName: 'campaigns/campaign-123/video-456.mp4',

    // Prédiction Vertex AI
    vertexEndpoint: 'video-analysis-endpoint',
    vertexInput: {
      videoUrl: 'gs://winstory-videos/campaigns/campaign-123/video-456.mp4',
      analysisType: 'content_moderation',
      parameters: {
        sensitivity: 'high',
        categories: ['violence', 'adult_content', 'spam']
      }
    },

    // Publication Pub/Sub
    pubsubTopic: 'winstory-video-processed',
    pubsubMessage: {
      videoId: 'video-456',
      campaignId: 'campaign-123',
      userId: 'user-789',
      status: 'processed',
      processedAt: new Date().toISOString(),
      metadata: {
        originalSize: '125MB',
        duration: 120,
        resolution: '1920x1080'
      }
    }
  };

  try {
    const result = await executeComplete(inputs);
    console.log('✅ Workflow terminé:', result);

    // Exemple de réponse attendue:
    /*
    {
      "upload": {
        "status": "success",
        "message": "Upload completed",
        "data": {
          "bucket": "winstory-videos",
          "object": "campaigns/campaign-123/video-456.mp4",
          "size": 131072000,
          "contentType": "video/mp4"
        }
      },
      "prediction": {
        "status": "success",
        "message": "Prediction completed",
        "data": {
          "prediction": {
            "contentScore": 0.95,
            "categories": {
              "safe": 0.98,
              "violence": 0.01,
              "adult": 0.01
            }
          }
        }
      },
      "pubsub": {
        "status": "success",
        "message": "Message published",
        "data": {
          "topic": "winstory-video-processed",
          "messageId": "1234567890123456789",
          "messageSize": 456
        }
      }
    }
    */
  } catch (error) {
    console.error('❌ Erreur workflow:', error);
  }
}

// ==========================================
// EXEMPLE 2: Upload simple de vidéo
// ==========================================

async function exempleUploadSimple() {
  console.log('📤 Exemple: Upload vidéo simple');

  try {
    const result = await uploadVideo(
      '/Users/winstory/videos/nouvelle-campagne.mp4',
      'winstory-video-uploads',
      'uploads/2024/janvier/nouvelle-campagne-v1.mp4'
    );

    console.log('Upload result:', result);
    
    if (result.status === 'success') {
      console.log(`✅ Vidéo uploadée: ${result.data?.bucket}/${result.data?.object}`);
      console.log(`📊 Taille: ${result.data?.size} bytes`);
    }
  } catch (error) {
    console.error('❌ Erreur upload:', error);
  }
}

// ==========================================
// EXEMPLE 3: Prédiction Vertex AI seule
// ==========================================

async function exempleVertexAI() {
  console.log('🤖 Exemple: Prédiction Vertex AI');

  const inputData = {
    instances: [{
      videoUri: 'gs://winstory-videos/test-video.mp4',
      features: ['OBJECT_DETECTION', 'LABEL_DETECTION'],
      config: {
        labelDetectionConfig: {
          mode: 'SHOT_AND_FRAME_MODE'
        }
      }
    }]
  };

  try {
    const result = await runPrediction('video-intelligence-endpoint', inputData);
    
    if (result.status === 'success') {
      console.log('🎯 Prédiction réussie:', result.data?.prediction);
    }
  } catch (error) {
    console.error('❌ Erreur prédiction:', error);
  }
}

// ==========================================
// EXEMPLE 4: Publication Pub/Sub
// ==========================================

async function exemplePubSub() {
  console.log('📢 Exemple: Publication Pub/Sub');

  const message = {
    eventType: 'VIDEO_ANALYSIS_COMPLETE',
    videoId: 'vid_987654321',
    analysisResults: {
      duration: 125.5,
      resolution: '1920x1080',
      frameRate: 30,
      qualityScore: 0.87,
      contentFlags: []
    },
    timestamp: new Date().toISOString(),
    userId: 'user_123456789'
  };

  try {
    const result = await publishMessage('winstory-events', message);
    
    if (result.status === 'success') {
      console.log(`📨 Message publié avec ID: ${result.data?.messageId}`);
    }
  } catch (error) {
    console.error('❌ Erreur publication:', error);
  }
}

// ==========================================
// EXEMPLE 5: Test de connectivité
// ==========================================

async function exempleTestConnectivite() {
  console.log('🔍 Test de connectivité GCP');

  try {
    const result = await testConnection();
    
    if (result.status === 'success') {
      console.log('✅ Connectivité GCP OK');
      console.log('📊 Données de connectivité:', result.data);
    } else {
      console.log('❌ Problème de connectivité:', result.message);
    }
  } catch (error) {
    console.error('❌ Erreur test connectivité:', error);
  }
}

// ==========================================
// EXEMPLE 6: Utilisation via API HTTP
// ==========================================

async function exempleUtilisationAPI() {
  console.log('🌐 Exemple: Utilisation via API HTTP');

  // Test de connectivité
  const connectivityTest = await fetch('/api/winstory/gcp-workflow', {
    method: 'GET'
  });
  console.log('Connectivité:', await connectivityTest.json());

  // Workflow complet
  const workflowData = {
    localVideoPath: '/tmp/video-test.mp4',
    bucketName: 'winstory-videos',
    objectName: 'test/video-api-test.mp4',
    vertexEndpoint: 'content-analysis',
    vertexInput: { 
      videoUrl: 'gs://winstory-videos/test/video-api-test.mp4',
      analysisType: 'quality_check' 
    },
    pubsubTopic: 'winstory-workflow-complete',
    pubsubMessage: { 
      workflowId: 'wf_api_test_001',
      status: 'completed',
      timestamp: new Date().toISOString()
    }
  };

  const workflowResponse = await fetch('/api/winstory/gcp-workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflowData)
  });

  const workflowResult = await workflowResponse.json();
  console.log('Résultat workflow API:', workflowResult);
}

// ==========================================
// EXEMPLE 7: Gestion d'erreurs avancée
// ==========================================

async function exempleGestionErreurs() {
  console.log('⚠️ Exemple: Gestion d\'erreurs');

  const inputs: WinstoryInputs = {
    localVideoPath: '/chemin/inexistant/video.mp4', // Fichier inexistant
    bucketName: 'bucket-inexistant',
    objectName: 'test.mp4'
  };

  try {
    const result = await executeComplete(inputs);

    // Vérification des erreurs par service
    if (result.upload?.status === 'error') {
      console.log('❌ Erreur upload:', result.upload.message);
      // Actions de recovery pour l'upload
    }

    if (result.prediction?.status === 'error') {
      console.log('❌ Erreur prédiction:', result.prediction.message);
      // Actions de recovery pour la prédiction
    }

    if (result.pubsub?.status === 'error') {
      console.log('❌ Erreur Pub/Sub:', result.pubsub.message);
      // Actions de recovery pour Pub/Sub
    }

    // Vérification du succès global
    const allSuccess = Object.values(result).every(
      res => res && res.status === 'success'
    );

    if (allSuccess) {
      console.log('✅ Workflow 100% réussi');
    } else {
      console.log('⚠️ Workflow partiellement réussi');
    }

  } catch (error) {
    console.error('❌ Erreur critique:', error);
  }
}

// ==========================================
// EXPORT DES EXEMPLES
// ==========================================

export {
  exempleWorkflowComplet,
  exempleUploadSimple,
  exempleVertexAI,
  exemplePubSub,
  exempleTestConnectivite,
  exempleUtilisationAPI,
  exempleGestionErreurs
};

// Fonction pour exécuter tous les exemples
export async function executerTousLesExemples() {
  console.log('🎯 Exécution de tous les exemples Winstory GCP\n');

  await exempleTestConnectivite();
  console.log('\n' + '='.repeat(50) + '\n');

  await exempleUploadSimple();
  console.log('\n' + '='.repeat(50) + '\n');

  await exempleVertexAI();
  console.log('\n' + '='.repeat(50) + '\n');

  await exemplePubSub();
  console.log('\n' + '='.repeat(50) + '\n');

  await exempleWorkflowComplet();
  console.log('\n' + '='.repeat(50) + '\n');

  await exempleGestionErreurs();
  console.log('\n' + '='.repeat(50) + '\n');

  console.log('✅ Tous les exemples terminés !');
}

// Pour exécuter directement ce fichier
if (require.main === module) {
  executerTousLesExemples().catch(console.error);
}
