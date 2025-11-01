import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration du client S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'winstory-videos';

/**
 * GET /api/s3/presigned-url
 * Génère une URL signée pour accéder à une vidéo S3 (pour les vidéos dans /pending)
 * 
 * Query params:
 * - fileKey: La clé S3 du fichier (ex: pending/campaign_123_video.mp4)
 * - expiresIn: Durée de validité en secondes (défaut: 3600 = 1 heure)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('fileKey');
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600');

    if (!fileKey) {
      return NextResponse.json(
        { success: false, error: 'fileKey is required' },
        { status: 400 }
      );
    }

    // Vérifier les credentials AWS
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('❌ AWS credentials not configured');
      return NextResponse.json(
        { success: false, error: 'AWS credentials not configured' },
        { status: 500 }
      );
    }

    console.log('🔑 [S3 PRESIGNED URL] Generating presigned URL for:', fileKey);

    // Générer l'URL signée
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expiresIn, // 1 heure par défaut
    });

    console.log('✅ [S3 PRESIGNED URL] Presigned URL generated, expires in', expiresIn, 'seconds');

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn,
      fileKey,
    });

  } catch (error) {
    console.error('❌ [S3 PRESIGNED URL] Error generating presigned URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate presigned URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

