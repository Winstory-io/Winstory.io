import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    const walletAddress = searchParams.get('walletAddress');

    if (!campaignId && !walletAddress) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign ID or wallet address is required' 
        },
        { status: 400 }
      );
    }

    console.log('=== FETCHING MODERATION DATA ===');
    console.log('Campaign ID:', campaignId);
    console.log('Wallet Address:', walletAddress);

    let moderationData = [];

    if (campaignId) {
      // Récupérer les données de modération pour une campagne spécifique
      const { data: progress, error: progressError } = await supabase
        .from('moderation_progress')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching moderation progress:', progressError);
        throw new Error(`Failed to fetch moderation progress: ${progressError.message}`);
      }

      // Récupérer les sessions de modération
      const { data: sessions, error: sessionsError } = await supabase
        .from('moderation_sessions')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching moderation sessions:', sessionsError);
        throw new Error(`Failed to fetch moderation sessions: ${sessionsError.message}`);
      }

      moderationData = [{
        campaignId,
        progress: progress || {
          total_stakers: 0,
          active_stakers: 0,
          total_votes: 0,
          valid_votes: 0,
          refuse_votes: 0,
          abstain_votes: 0,
          current_score: 0,
          required_score: 7.0,
          staking_pool_total: 0,
          moderation_level: 'standard',
          blockchain_validation_type: 'free_transaction',
          super_moderator_override: false,
          winstory_intervention: false,
          intervention_reason: null,
          last_vote_at: null,
          moderation_deadline: null
        },
        sessions: sessions || []
      }];

    } else if (walletAddress) {
      // Récupérer toutes les campagnes créées par cet utilisateur avec leurs données de modération
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          status,
          created_at,
          moderation_progress (
            total_stakers,
            active_stakers,
            total_votes,
            valid_votes,
            refuse_votes,
            abstain_votes,
            current_score,
            required_score,
            staking_pool_total,
            moderation_level,
            blockchain_validation_type,
            super_moderator_override,
            winstory_intervention,
            intervention_reason,
            last_vote_at,
            moderation_deadline
          )
        `)
        .eq('original_creator_wallet', walletAddress)
        .order('created_at', { ascending: false });

      if (campaignsError) {
        console.error('Error fetching user campaigns:', campaignsError);
        throw new Error(`Failed to fetch user campaigns: ${campaignsError.message}`);
      }

      // Transformer les données pour l'interface
      moderationData = campaigns?.map(campaign => ({
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        campaignStatus: campaign.status,
        createdAt: campaign.created_at,
        progress: Array.isArray(campaign.moderation_progress) 
          ? campaign.moderation_progress[0] || {
              total_stakers: 0,
              active_stakers: 0,
              total_votes: 0,
              valid_votes: 0,
              refuse_votes: 0,
              abstain_votes: 0,
              current_score: 0,
              required_score: 7.0,
              staking_pool_total: 0,
              moderation_level: 'standard',
              blockchain_validation_type: 'free_transaction',
              super_moderator_override: false,
              winstory_intervention: false,
              intervention_reason: null,
              last_vote_at: null,
              moderation_deadline: null
            }
          : campaign.moderation_progress || {
              total_stakers: 0,
              active_stakers: 0,
              total_votes: 0,
              valid_votes: 0,
              refuse_votes: 0,
              abstain_votes: 0,
              current_score: 0,
              required_score: 7.0,
              staking_pool_total: 0,
              moderation_level: 'standard',
              blockchain_validation_type: 'free_transaction',
              super_moderator_override: false,
              winstory_intervention: false,
              intervention_reason: null,
              last_vote_at: null,
              moderation_deadline: null
            },
        sessions: [] // TODO: Récupérer les sessions si nécessaire
      })) || [];

    }

    console.log('=== MODERATION DATA FETCHED ===');
    console.log('Total campaigns:', moderationData.length);

    return NextResponse.json({
      success: true,
      moderationData,
      count: moderationData.length
    });

  } catch (error) {
    console.error('Moderation data fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch moderation data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
