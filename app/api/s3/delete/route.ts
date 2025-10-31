import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configuration du client S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'winstory-videos';

export async function POST(request: NextRequest) {
  try {
    const { fileKey, reason } = await request.json();

    if (!fileKey) {
      return NextResponse.json(
        { success: false, error: 'Missing fileKey' },
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

    console.log('🔥 [S3 Delete] Starting delete operation...');
    console.log('  - File key:', fileKey);
    console.log('  - Reason:', reason || 'Not specified');

    // Supprimer le fichier
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);

    console.log('✅ [S3 Delete] File deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully from S3',
      fileKey,
      reason,
    });

  } catch (error) {
    console.error('❌ [S3 Delete] Error deleting video:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete video from S3',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

