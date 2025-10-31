import { NextRequest, NextResponse } from 'next/server';
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
    const { sourceKey, destinationFolder } = await request.json();

    if (!sourceKey || !destinationFolder) {
      return NextResponse.json(
        { success: false, error: 'Missing sourceKey or destinationFolder' },
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

    console.log('🔄 [S3 Move] Starting move operation...');
    console.log('  - Source:', sourceKey);
    console.log('  - Destination folder:', destinationFolder);

    // Extraire le nom du fichier
    const fileName = sourceKey.split('/').pop();
    const destinationKey = `${destinationFolder}/${fileName}`;

    // 1. Copier vers la nouvelle destination
    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });

    await s3Client.send(copyCommand);
    console.log('✅ [S3 Move] File copied to destination');

    // 2. Supprimer l'original
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: sourceKey,
    });

    await s3Client.send(deleteCommand);
    console.log('✅ [S3 Move] Original file deleted');

    // Construire la nouvelle URL
    const newUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${destinationKey}`;

    console.log('✅ [S3 Move] Move operation completed successfully');
    console.log('  - New URL:', newUrl);

    return NextResponse.json({
      success: true,
      newUrl,
      destinationKey,
      message: 'Video moved successfully',
    });

  } catch (error) {
    console.error('❌ [S3 Move] Error moving video:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to move video in S3',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

