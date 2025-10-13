/**
 * API Route pour uploader une vidéo vers Cloud Storage
 * POST /api/winstory/upload-video
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadVideo } from '@/lib/gcp-winstory-agent';
import { GCP_CONFIG } from '@/lib/config/gcp-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des paramètres requis
    if (!body.localVideoPath) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'localVideoPath is required',
        },
        { status: 400 }
      );
    }

    if (!body.objectName) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'objectName is required',
        },
        { status: 400 }
      );
    }

    const bucketName = body.bucketName || GCP_CONFIG.STORAGE.VIDEO_BUCKET;

    console.log('📤 Starting video upload:', {
      localPath: body.localVideoPath,
      bucket: bucketName,
      object: body.objectName,
    });

    // Exécution de l'upload
    const result = await uploadVideo(
      body.localVideoPath,
      bucketName,
      body.objectName
    );

    return NextResponse.json(
      {
        ...result,
        timestamp: new Date().toISOString(),
      },
      { status: result.status === 'success' ? 200 : 400 }
    );

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: `Upload failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
