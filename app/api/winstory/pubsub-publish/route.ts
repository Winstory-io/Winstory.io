/**
 * API Route pour publier un message dans Pub/Sub
 * POST /api/winstory/pubsub-publish
 */

import { NextRequest, NextResponse } from 'next/server';
import { publishMessage } from '@/lib/gcp-winstory-agent';
import { GCP_CONFIG } from '@/lib/config/gcp-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des paramètres requis
    if (!body.pubsubTopic) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'pubsubTopic is required',
        },
        { status: 400 }
      );
    }

    if (!body.pubsubMessage) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'pubsubMessage is required',
        },
        { status: 400 }
      );
    }

    console.log('📤 Publishing message to Pub/Sub:', {
      topic: body.pubsubTopic,
      messageType: typeof body.pubsubMessage,
    });

    // Publication du message
    const result = await publishMessage(
      body.pubsubTopic,
      body.pubsubMessage
    );

    return NextResponse.json(
      {
        ...result,
        timestamp: new Date().toISOString(),
      },
      { status: result.status === 'success' ? 200 : 400 }
    );

  } catch (error: any) {
    console.error('❌ Pub/Sub error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: `Pub/Sub publication failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
