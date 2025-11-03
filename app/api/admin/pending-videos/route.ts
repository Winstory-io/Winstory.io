import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabaseServer';
import { checkAdminAccess } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'accès admin
    const hasAccess = await checkAdminAccess(request);
    if (!hasAccess) {
      console.warn('🚫 [ADMIN API] Unauthorized access attempt to pending-videos');
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

    console.log('🔍 [ADMIN API] Fetching campaigns requiring video creation...');

    // Récupérer toutes les campagnes avec ai_option = true
    // On doit faire une requête avec des joins car Supabase ne permet pas de filtrer directement sur des relations
    const { data: campaigns, error: campaignsError } = await supabaseServer
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        status,
        type,
        created_at,
        updated_at,
        original_campaign_company_name,
        campaign_contents (
          id,
          video_url,
          starting_story,
          guidelines,
          video_orientation
        ),
        campaign_pricing_configs (
          id,
          ai_option
        ),
        creator_infos (
          company_name,
          agency_name,
          email
        )
      `)
      .in('status', ['PENDING_MODERATION', 'PENDING_WINSTORY_VIDEO'])
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('❌ [ADMIN API] Error fetching campaigns:', campaignsError);
      throw new Error(`Failed to fetch campaigns: ${campaignsError.message}`);
    }

    // Filtrer côté JavaScript pour trouver celles avec ai_option = true et video_url = 'winstory_delegated'
    const pendingVideos = (campaigns || []).filter((campaign: any) => {
      const content = Array.isArray(campaign.campaign_contents) 
        ? campaign.campaign_contents[0] 
        : campaign.campaign_contents;
      const pricingConfig = Array.isArray(campaign.campaign_pricing_configs)
        ? campaign.campaign_pricing_configs[0]
        : campaign.campaign_pricing_configs;

      const hasAiOption = pricingConfig?.ai_option === true;
      const isDelegated = content?.video_url === 'winstory_delegated' || 
                         !content?.video_url || 
                         content?.video_url === null;

      return hasAiOption && isDelegated;
    });

    // Formatter les données pour la réponse
    const formattedCampaigns = pendingVideos.map((campaign: any) => {
      const content = Array.isArray(campaign.campaign_contents) 
        ? campaign.campaign_contents[0] 
        : campaign.campaign_contents;
      const pricingConfig = Array.isArray(campaign.campaign_pricing_configs)
        ? campaign.campaign_pricing_configs[0]
        : campaign.campaign_pricing_configs;
      const creatorInfo = Array.isArray(campaign.creator_infos)
        ? campaign.creator_infos[0]
        : campaign.creator_infos;

      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        status: campaign.status,
        type: campaign.type,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
        startingStory: content?.starting_story || '',
        guidelines: content?.guidelines || '',
        videoOrientation: content?.video_orientation || 'horizontal',
        companyName: creatorInfo?.company_name || 
                    campaign.original_campaign_company_name || 
                    creatorInfo?.agency_name || 
                    'Unknown',
        email: creatorInfo?.email || null,
        aiOption: pricingConfig?.ai_option || false,
        videoUrl: content?.video_url || 'winstory_delegated',
      };
    });

    console.log(`✅ [ADMIN API] Found ${formattedCampaigns.length} campaigns requiring video creation`);

    return NextResponse.json({
      success: true,
      data: formattedCampaigns,
      count: formattedCampaigns.length,
    });

  } catch (error) {
    console.error('❌ [ADMIN API] Error fetching pending videos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending videos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

