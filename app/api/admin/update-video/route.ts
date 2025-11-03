import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { checkAdminAccess } from '@/lib/adminAuth';

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'accès admin
    const hasAccess = await checkAdminAccess(request);
    if (!hasAccess) {
      console.warn('🚫 [ADMIN API] Unauthorized access attempt to update-video');
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
    const { campaignId, videoUrl } = body;

    if (!campaignId || !videoUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'campaignId and videoUrl are required' 
        },
        { status: 400 }
      );
    }

    // Valider que l'URL est valide (HTTP/HTTPS)
    if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'videoUrl must be a valid HTTP/HTTPS URL' 
        },
        { status: 400 }
      );
    }

    console.log('📹 [ADMIN API] Updating video for campaign:', campaignId);
    console.log('  - New video URL:', videoUrl);

    // Mettre à jour la vidéo dans campaign_contents
    const { error: contentError } = await supabaseServer
      .from('campaign_contents')
      .update({ 
        video_url: videoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('campaign_id', campaignId);

    if (contentError) {
      console.error('❌ [ADMIN API] Error updating campaign_contents:', contentError);
      throw new Error(`Failed to update campaign_contents: ${contentError.message}`);
    }

    // Mettre à jour le statut de la campagne si elle était en PENDING_WINSTORY_VIDEO
    const { error: statusError } = await supabaseServer
      .from('campaigns')
      .update({ 
        status: 'PENDING_MODERATION',
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .eq('status', 'PENDING_WINSTORY_VIDEO');

    if (statusError) {
      console.warn('⚠️ [ADMIN API] Could not update campaign status (may already be PENDING_MODERATION):', statusError);
      // Ne pas faire échouer la requête si le statut n'était pas PENDING_WINSTORY_VIDEO
    }

    // Mettre à jour l'intervention Winstory si elle existe
    const { error: interventionError } = await supabaseServer
      .from('winstory_interventions')
      .update({
        intervention_status: 'completed',
        completed_at: new Date().toISOString(),
        outcome: 'Video created and uploaded successfully',
        updated_at: new Date().toISOString()
      })
      .eq('campaign_id', campaignId)
      .eq('intervention_type', 'video_creation')
      .eq('intervention_status', 'pending');

    if (interventionError) {
      console.warn('⚠️ [ADMIN API] Could not update winstory_interventions:', interventionError);
      // Ne pas faire échouer la requête si l'intervention n'existe pas
    }

    console.log('✅ [ADMIN API] Video updated successfully for campaign:', campaignId);

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      campaignId,
      videoUrl,
    });

  } catch (error) {
    console.error('❌ [ADMIN API] Error updating video:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

