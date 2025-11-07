import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  const consoleLogs: string[] = [];
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const status = searchParams.get('status'); // 'active' | 'history' | 'all'

    if (!wallet) {
      return NextResponse.json({ error: 'wallet is required', consoleLogs }, { status: 400 });
    }

    if (!supabaseServer) {
      consoleLogs.push('⚠️ Supabase server client not configured');
      return NextResponse.json({ active: [], history: [], consoleLogs });
    }

    // Récupérer tous les votes du modérateur
    const { data: votes, error: votesError } = await supabaseServer
      .from('moderation_votes')
      .select('id,campaign_id,moderator_wallet,completion_id,vote_decision,staked_amount,vote_weight,transaction_hash,vote_timestamp,created_at')
      .eq('moderator_wallet', wallet.toLowerCase())
      .order('vote_timestamp', { ascending: false });

    if (votesError) {
      consoleLogs.push(`❌ Error fetching votes: ${votesError.message}`);
      console.error('Error fetching votes:', votesError);
      return NextResponse.json({ error: votesError.message, active: [], history: [], consoleLogs }, { status: 500 });
    }

    if (!votes || votes.length === 0) {
      consoleLogs.push('✅ No votes found for this moderator');
      return NextResponse.json({ active: [], history: [], consoleLogs });
    }

    consoleLogs.push(`✅ Found ${votes.length} vote(s) for moderator ${wallet}`);

    // Récupérer les IDs de campagnes uniques
    const campaignIds = [...new Set(votes.map(v => v.campaign_id))];

    // Récupérer les campagnes avec leurs informations complètes
    const { data: campaigns, error: campaignsError } = await supabaseServer
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
          last_vote_at,
          moderation_deadline
        )
      `)
      .in('id', campaignIds);

    if (campaignsError) {
      consoleLogs.push(`❌ Error fetching campaigns: ${campaignsError.message}`);
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json({ error: campaignsError.message, active: [], history: [], consoleLogs }, { status: 500 });
    }

    if (!campaigns || campaigns.length === 0) {
      consoleLogs.push('⚠️ No campaigns found for the votes');
      return NextResponse.json({ active: [], history: [], consoleLogs });
    }

    consoleLogs.push(`✅ Found ${campaigns.length} campaign(s) for ${votes.length} vote(s)`);

    // Récupérer les scores pour les complétions
    const completionIds = votes.map(v => v.completion_id).filter(Boolean) as string[];
    let scoresMap: Record<string, any> = {};
    
    if (completionIds.length > 0) {
      // Essayer d'abord user_completion_moderator_scores
      const { data: scores } = await supabaseServer
        .from('user_completion_moderator_scores')
        .select('completion_id,staker_wallet,score,is_refused,vote_timestamp')
        .in('completion_id', completionIds)
        .eq('staker_wallet', wallet.toLowerCase());

      if (scores) {
        for (const s of scores) {
          scoresMap[s.completion_id] = {
            score: s.score,
            isRefused: s.is_refused,
            voteTimestamp: s.vote_timestamp
          };
        }
      }

      // Si pas de scores dans user_completion_moderator_scores, essayer completion_moderation_scores
      if (Object.keys(scoresMap).length === 0) {
        const { data: altScores } = await supabaseServer
          .from('completion_moderation_scores')
          .select('completion_id,moderator_wallet,score')
          .in('completion_id', completionIds)
          .eq('moderator_wallet', wallet.toLowerCase());

        if (altScores) {
          for (const s of altScores) {
            scoresMap[s.completion_id] = {
              score: s.score,
              isRefused: s.score === 0,
              voteTimestamp: null
            };
          }
        }
      }
    }

    // Récupérer les stakes individuels pour calculer le personalStaking
    const { data: stakes } = await supabaseServer
      .from('moderator_stakes')
      .select('campaign_id,staker_wallet,staked_amount')
      .in('campaign_id', campaignIds)
      .eq('staker_wallet', wallet.toLowerCase());

    const stakesMap: Record<string, number> = {};
    if (stakes) {
      for (const stake of stakes) {
        stakesMap[stake.campaign_id] = Number(stake.staked_amount) || 0;
      }
    }

    // Récupérer tous les pricing configs en une seule requête
    const { data: pricingConfigs } = await supabaseServer
      .from('campaign_pricing_configs')
      .select('campaign_id,base_mint')
      .in('campaign_id', campaignIds);

    const pricingMap: Record<string, number> = {};
    if (pricingConfigs) {
      for (const pricing of pricingConfigs) {
        pricingMap[pricing.campaign_id] = Number(pricing.base_mint) || 0;
      }
    }

    // Construire les données de modération
    const activeModerations: any[] = [];
    const historyModerations: any[] = [];

    for (const vote of votes) {
      const campaign = campaigns?.find(c => c.id === vote.campaign_id);
      if (!campaign) continue;

      const progress = Array.isArray(campaign.moderation_progress) 
        ? campaign.moderation_progress[0] 
        : campaign.moderation_progress;

      const personalStaking = stakesMap[vote.campaign_id] || Number(vote.staked_amount) || 0;
      const poolStaking = Number(progress?.staking_pool_total) || 0;
      const personalStakingPercentage = poolStaking > 0 
        ? (personalStaking / poolStaking) * 100 
        : 0;

      const validatedVotes = Number(progress?.valid_votes) || 0;
      const refusedVotes = Number(progress?.refuse_votes) || 0;
      const totalModerators = Number(progress?.total_stakers) || Number(progress?.active_stakers) || 0;

      // Déterminer le vote de l'utilisateur
      let userVote: 'valid' | 'refuse' | null = null;
      if (vote.vote_decision === 'approve' || vote.vote_decision === 'VALID') {
        userVote = 'valid';
      } else if (vote.vote_decision === 'reject' || vote.vote_decision === 'REFUSE') {
        userVote = 'refuse';
      }

      // Récupérer le mint price depuis le map
      const mintPrice = pricingMap[campaign.id] || 0;

      // Gérer creator_infos qui peut être un tableau ou un objet
      let creatorWallet = 'Unknown';
      if (campaign.creator_infos) {
        if (Array.isArray(campaign.creator_infos) && campaign.creator_infos.length > 0) {
          creatorWallet = campaign.creator_infos[0].wallet_address || 'Unknown';
        } else if (typeof campaign.creator_infos === 'object' && campaign.creator_infos.wallet_address) {
          creatorWallet = campaign.creator_infos.wallet_address;
        }
      }

      const baseData = {
        id: vote.campaign_id,
        type: campaign.type === 'INITIAL' ? 'initial' : 'completion',
        mintPrice,
        walletAddress: creatorWallet,
        personalStaking,
        poolStaking,
        personalStakingPercentage: Number(personalStakingPercentage.toFixed(1)),
        validatedVotes,
        refusedVotes,
        totalModerators,
        userVote,
        conditions: {
          poolStakingExceedsMint: poolStaking > mintPrice,
          hybridRatioMet: validatedVotes > refusedVotes, // Simplification
          moderatorThresholdMet: totalModerators >= 22, // Pour INITIAL
        },
        campaignName: campaign.title || 'Untitled Campaign',
        voteTimestamp: vote.vote_timestamp || vote.created_at,
      };

      // Pour les complétions, ajouter les scores
      if (campaign.type === 'COMPLETION') {
        const scoreData = vote.completion_id ? scoresMap[vote.completion_id] : null;
        const completionData: any = {
          ...baseData,
          userScore: scoreData?.score || (userVote === 'valid' ? null : null), // null si pas de score trouvé
          averageScore: Number(progress?.current_score) || 0,
        };

        if (campaign.status === 'PENDING_MODERATION') {
          activeModerations.push(completionData);
        } else {
          historyModerations.push({
            ...completionData,
            finalizedAt: campaign.updated_at || vote.vote_timestamp || vote.created_at,
            finalDecision: campaign.status === 'APPROVED' ? 'valid' : 'refuse',
          });
        }
      } else {
        // Pour les INITIAL
        if (campaign.status === 'PENDING_MODERATION') {
          activeModerations.push(baseData);
        } else {
          historyModerations.push({
            ...baseData,
            finalizedAt: campaign.updated_at || vote.vote_timestamp || vote.created_at,
            finalDecision: campaign.status === 'APPROVED' ? 'valid' : 'refuse',
          });
        }
      }
    }

    // Filtrer selon le paramètre status
    let result: any = { active: [], history: [], consoleLogs };
    
    if (status === 'active') {
      result.active = activeModerations;
    } else if (status === 'history') {
      result.history = historyModerations;
    } else {
      result.active = activeModerations;
      result.history = historyModerations;
    }

    consoleLogs.push(`✅ Fetched ${activeModerations.length} active and ${historyModerations.length} history moderations`);

    return NextResponse.json(result);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    consoleLogs.push(`❌ Error: ${errorMessage}`);
    console.error('Error in my-moderations API:', e);
    return NextResponse.json({ 
      error: errorMessage, 
      active: [], 
      history: [], 
      consoleLogs 
    }, { status: 500 });
  }
}

