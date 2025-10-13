/**
 * API Route pour exécuter le workflow GCP complet de Winstory
 * POST /api/winstory/gcp-workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeComplete, testConnection, WinstoryInputs } from '@/lib/gcp-winstory-agent';
import { GCP_CONFIG } from '@/lib/config/gcp-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des inputs
    if (!body) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Request body is required',
          data: null,
        },
        { status: 400 }
      );
    }

    // Construction des inputs pour le workflow
    const inputs: WinstoryInputs = {
      localVideoPath: body.localVideoPath,
      bucketName: body.bucketName || GCP_CONFIG.STORAGE.VIDEO_BUCKET,
      objectName: body.objectName,
      vertexEndpoint: body.vertexEndpoint,
      vertexInput: body.vertexInput,
      pubsubTopic: body.pubsubTopic,
      pubsubMessage: body.pubsubMessage,
    };

    console.log('🚀 Starting Winstory GCP Workflow:', {
      hasVideo: !!inputs.localVideoPath,
      hasVertex: !!inputs.vertexEndpoint,
      hasPubSub: !!inputs.pubsubTopic,
    });

    // Exécution du workflow complet
    const result = await executeComplete(inputs);

    // Détermination du statut global
    const hasErrors = Object.values(result).some(
      (res) => res && res.status === 'error'
    );

    const globalStatus = hasErrors ? 'partial_success' : 'success';
    const httpStatus = hasErrors ? 207 : 200; // 207 Multi-Status pour succès partiel

    return NextResponse.json(
      {
        status: globalStatus,
        message: hasErrors 
          ? 'Workflow completed with some errors' 
          : 'Workflow completed successfully',
        data: result,
        timestamp: new Date().toISOString(),
        projectId: GCP_CONFIG.PROJECT_ID,
      },
      { status: httpStatus }
    );

  } catch (error: any) {
    console.error('❌ Workflow execution error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: `Workflow execution failed: ${error.message}`,
        data: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET pour tester la connectivité
export async function GET() {
  try {
    const result = await testConnection();
    
    return NextResponse.json(
      {
        ...result,
        timestamp: new Date().toISOString(),
        endpoint: '/api/winstory/gcp-workflow',
      },
      { status: result.status === 'success' ? 200 : 503 }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: `Connectivity test failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
