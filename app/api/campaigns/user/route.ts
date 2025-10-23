import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const campaignType = searchParams.get('type'); // 'created' | 'completed' | 'moderated'

    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Wallet address is required' 
        },
        { status: 400 }
      );
    }

    console.log('=== FETCHING USER CAMPAIGNS ===');
    console.log('Wallet Address:', walletAddress);
    console.log('Type:', campaignType);

    let campaigns = [];

    switch (campaignType) {
      case 'created':
        // Récupérer les campagnes créées par cet utilisateur
        const { data: createdCampaigns, error: createdError } = await supabase
          .from('campaigns')
          .select(`
            id,
            title,
            description,
            status,
            type,
            creator_type,
            created_at,
            updated_at,
            original_creator_wallet
          `)
          .eq('original_creator_wallet', walletAddress)
          .order('created_at', { ascending: false });

        if (createdError) {
          console.error('Error fetching created campaigns:', createdError);
          throw new Error(`Failed to fetch created campaigns: ${createdError.message}`);
        }

        campaigns = createdCampaigns || [];
        console.log('✅ Found', campaigns.length, 'created campaigns');
        break;

      case 'completed':
        // Récupérer les campagnes complétées par cet utilisateur
        const { data: completedCampaigns, error: completedError } = await supabase
          .from('campaigns')
          .select(`
            id,
            title,
            description,
            status,
            type,
            creator_type,
            created_at,
            updated_at,
            creator_infos (
              company_name,
              agency_name,
              wallet_address,
              email
            ),
            campaign_contents (
              video_url,
              video_orientation,
              starting_story,
              guidelines
            ),
            campaign_rewards_configs (
              reward_tier,
              reward_type,
              is_configured
            ),
            campaign_metadata (
              total_completions,
              tags
            )
          `)
          .eq('completer_wallet', walletAddress)
          .order('created_at', { ascending: false });

        if (completedError) {
          console.error('Error fetching completed campaigns:', completedError);
          throw new Error(`Failed to fetch completed campaigns: ${completedError.message}`);
        }

        campaigns = completedCampaigns || [];
        console.log('✅ Found', campaigns.length, 'completed campaigns');
        break;

      case 'moderated':
        // Récupérer les campagnes modérées par cet utilisateur
        const { data: moderatedCampaigns, error: moderatedError } = await supabase
          .from('moderation_sessions')
          .select(`
            id,
            campaign_id,
            moderator_wallet,
            status,
            created_at,
            campaigns!inner (
              id,
              title,
              description,
              status,
              type,
              creator_type,
              created_at,
              updated_at,
              creator_infos (
                company_name,
                agency_name,
                wallet_address,
                email
              ),
              campaign_contents (
                video_url,
                video_orientation,
                starting_story,
                guidelines
              ),
              campaign_rewards_configs (
                reward_tier,
                reward_type,
                is_configured
              )
            )
          `)
          .eq('moderator_wallet', walletAddress)
          .order('created_at', { ascending: false });

        if (moderatedError) {
          console.error('Error fetching moderated campaigns:', moderatedError);
          throw new Error(`Failed to fetch moderated campaigns: ${moderatedError.message}`);
        }

        campaigns = moderatedCampaigns?.map(session => session.campaigns) || [];
        console.log('✅ Found', campaigns.length, 'moderated campaigns');
        break;

      default:
        // Récupérer toutes les campagnes liées à cet utilisateur
        const { data: allCampaigns, error: allError } = await supabase
          .from('campaigns')
          .select(`
            id,
            title,
            description,
            status,
            type,
            creator_type,
            created_at,
            updated_at,
            creator_infos (
              company_name,
              agency_name,
              wallet_address,
              email
            ),
            campaign_contents (
              video_url,
              video_orientation,
              starting_story,
              guidelines
            ),
            campaign_rewards_configs (
              reward_tier,
              reward_type,
              is_configured
            ),
            campaign_metadata (
              total_completions,
              tags
            ),
            moderation_progress (
              current_score,
              required_score,
              total_votes,
              valid_votes,
              refuse_votes
            )
          `)
          .or(`original_creator_wallet.eq.${walletAddress},completer_wallet.eq.${walletAddress}`)
          .order('created_at', { ascending: false });

        if (allError) {
          console.error('Error fetching all campaigns:', allError);
          throw new Error(`Failed to fetch campaigns: ${allError.message}`);
        }

        campaigns = allCampaigns || [];
        console.log('✅ Found', campaigns.length, 'total campaigns');
        break;
    }

    // Transformer les données pour l'interface utilisateur
    const transformedCampaigns = campaigns.map(campaign => {
      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        status: campaign.status,
        type: campaign.type,
        creatorType: campaign.creator_type,
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
        
        // Informations du créateur (simplifiées pour l'instant)
        creator: {
          walletAddress: campaign.original_creator_wallet
        },
        
        // Contenu de la campagne
        content: campaign.campaign_contents || {},
        
        // Récompenses
        rewards: campaign.campaign_rewards_configs || {},
        
        // Métadonnées
        metadata: campaign.campaign_metadata || {},
        
        // Progrès de modération (vide pour l'instant)
        moderationProgress: null
      };
    });

    console.log('=== CAMPAIGNS FETCH COMPLETED ===');
    console.log('Total campaigns:', transformedCampaigns.length);

    return NextResponse.json({
      success: true,
      campaigns: transformedCampaigns,
      count: transformedCampaigns.length,
      walletAddress,
      campaignType: campaignType || 'all'
    });

  } catch (error) {
    console.error('Campaign fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch campaigns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
