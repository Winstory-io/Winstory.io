import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { checkAdminAccess } from '@/lib/adminAuth';
import { createClient } from '@supabase/supabase-js';

// Cette route est pour migrer les campagnes existantes avec video_url = indexeddb:... vers S3
// Note: Cela nécessite que la vidéo soit encore dans IndexedDB du navigateur de l'utilisateur
// Pour une migration complète, il faudrait un script serveur qui télécharge depuis IndexedDB

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'accès admin
    const hasAccess = await checkAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    if (!supabaseServer) {
      return NextResponse.json(
        { success: false, error: 'Supabase server client not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { campaignId, videoFile } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'campaignId is required' },
        { status: 400 }
      );
    }

    // Récupérer la campagne actuelle
    const { data: campaign, error: campaignError } = await supabaseServer
      .from('campaigns')
      .select('id, type, creator_type, original_creator_wallet')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Récupérer le contenu actuel
    const { data: content, error: contentError } = await supabaseServer
      .from('campaign_contents')
      .select('video_url')
      .eq('campaign_id', campaignId)
      .single();

    if (contentError || !content) {
      return NextResponse.json(
        { success: false, error: 'Campaign content not found' },
        { status: 404 }
      );
    }

    const currentVideoUrl = content.video_url;

    // Vérifier si c'est déjà une URL S3 valide
    if (currentVideoUrl && currentVideoUrl.startsWith('http')) {
      return NextResponse.json({
        success: true,
        message: 'Campaign already has S3 URL',
        videoUrl: currentVideoUrl
      });
    }

    // Si pas de fichier vidéo fourni, retourner une erreur
    if (!videoFile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'videoFile is required. Please upload the video file from IndexedDB.' 
        },
        { status: 400 }
      );
    }

    // Uploader vers S3
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('folder', 'pending');
    formData.append('campaignId', campaignId);

    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/s3/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to upload video to S3',
          details: errorData.error || errorData.details 
        },
        { status: 500 }
      );
    }

    const uploadResult = await uploadResponse.json();
    const s3VideoUrl = uploadResult.videoUrl;

    // Mettre à jour la base de données
    const { error: updateError } = await supabaseServer
      .from('campaign_contents')
      .update({ 
        video_url: s3VideoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('campaign_id', campaignId);

    if (updateError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update database',
          details: updateError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video migrated from IndexedDB to S3 successfully',
      videoUrl: s3VideoUrl,
      oldVideoUrl: currentVideoUrl
    });

  } catch (error) {
    console.error('❌ [MIGRATE] Error migrating video:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to migrate video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET pour lister les campagnes avec video_url = indexeddb:...
export async function GET(request: NextRequest) {
  try {
    const hasAccess = await checkAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    if (!supabaseServer) {
      return NextResponse.json(
        { success: false, error: 'Supabase server client not configured' },
        { status: 500 }
      );
    }

    // Récupérer toutes les campagnes avec video_url commençant par indexeddb:
    const { data: contents, error } = await supabaseServer
      .from('campaign_contents')
      .select(`
        campaign_id,
        video_url,
        campaigns!inner (
          id,
          title,
          type,
          creator_type,
          status,
          original_creator_wallet,
          created_at
        )
      `)
      .like('video_url', 'indexeddb:%')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: contents?.length || 0,
      campaigns: contents || []
    });

  } catch (error) {
    console.error('❌ [MIGRATE] Error listing campaigns:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to list campaigns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

