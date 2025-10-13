/**
 * API Route pour exécuter une prédiction Vertex AI
 * POST /api/winstory/vertex-predict
 */

import { NextRequest, NextResponse } from 'next/server';
import { runPrediction } from '@/lib/gcp-winstory-agent';
import { GCP_CONFIG } from '@/lib/config/gcp-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des paramètres requis
    if (!body.vertexEndpoint) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'vertexEndpoint is required',
        },
        { status: 400 }
      );
    }

    if (!body.vertexInput) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'vertexInput is required',
        },
        { status: 400 }
      );
    }

    console.log('🤖 Starting Vertex AI prediction:', {
      endpoint: body.vertexEndpoint,
      inputType: typeof body.vertexInput,
    });

    // Exécution de la prédiction
    const result = await runPrediction(
      body.vertexEndpoint,
      body.vertexInput
    );

    return NextResponse.json(
      {
        ...result,
        timestamp: new Date().toISOString(),
      },
      { status: result.status === 'success' ? 200 : 400 }
    );

  } catch (error: any) {
    console.error('❌ Prediction error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: `Prediction failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
