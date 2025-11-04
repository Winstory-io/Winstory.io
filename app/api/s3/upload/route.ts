import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuration du client S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1', // Région par défaut (Stockholm)
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'winstory-videos';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'pending'; // Par défaut: /pending
    const campaignId = formData.get('campaignId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validation des clés AWS
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error('❌ AWS credentials not configured');
      return NextResponse.json(
        { success: false, error: 'AWS credentials not configured' },
        { status: 500 }
      );
    }

    console.log('📤 [S3 Upload] Starting upload...');
    console.log('  - File name:', file.name);
    console.log('  - File size:', file.size, 'bytes');
    console.log('  - Folder:', folder);
    console.log('  - Campaign ID:', campaignId);

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `${folder}/${campaignId}_${timestamp}_${sanitizedFileName}`;

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Uploader vers S3 (bucket privé, utilisera des URLs signées)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type || 'video/mp4',
      Metadata: {
        'campaign-id': campaignId,
        'upload-timestamp': timestamp.toString(),
        'original-filename': file.name,
      },
    });

    await s3Client.send(command);

    // Construire l'URL de la vidéo (stockée mais nécessitera une URL signée pour l'accès)
    const videoUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileKey}`;

    console.log('✅ [S3 Upload] Video uploaded successfully');
    console.log('  - S3 URL:', videoUrl);
    console.log('  - File Key:', fileKey);
    console.log('  - Note: Bucket is private, use presigned URLs for access');

    return NextResponse.json({
      success: true,
      videoUrl,
      fileKey,
      message: 'Video uploaded successfully to S3',
    });

  } catch (error) {
    console.error('❌ [S3 Upload] Error uploading video:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload video to S3',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

