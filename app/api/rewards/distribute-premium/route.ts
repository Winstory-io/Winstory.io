import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  distributeERC20Token,
  distributeERC1155Item,
  distributeERC721NFT,
  verifyOnChainDistribution
} from '@/lib/reward-distribution-helpers';
import { notifyRewardDistributed } from '@/lib/notification-helpers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/rewards/distribute-premium
 * 
 * Distribue les récompenses Premium aux Top 3 compléteurs à la fin de campagne
 */
export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json();

    console.log('=== DISTRIBUTING PREMIUM REWARDS ===');
    console.log('Campaign ID:', campaignId);

    // 1. Vérifier que campagne existe
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, campaign_metadata(*)')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // 2. Vérifier que campagne est terminée
    const isEnded = await checkCampaignEnded(campaignId);
    if (!isEnded) {
      return NextResponse.json(
        { success: false, error: 'Campaign not ended yet' },
        { status: 400 }
      );
    }

    // 3. Vérifier qu'aucune distribution Premium n'a déjà été faite
    const { data: existingPremium } = await supabase
      .from('reward_distributions')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('reward_tier', 'premium')
      .limit(1);

    if (existingPremium && existingPremium.length > 0) {
      console.warn('⚠️ Premium rewards already distributed for this campaign');
      return NextResponse.json({
        success: true,
        message: 'Premium rewards already distributed',
        data: { alreadyDistributed: true }
      });
    }

    // 4. Calculer Top 3 (quelques millisecondes)
    const top3Completions = await calculateTop3Ranking(campaignId);

    console.log('🏆 Top 3 completions:', top3Completions.map(c => ({
      id: c.id,
      wallet: c.completer_wallet,
      score: c.score_avg,
      ranking: c.ranking
    })));

    if (top3Completions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No validated completions found for Top 3',
        data: { top3Count: 0 }
      });
    }

    // 5. Récupérer wallet créateur
    const { data: creatorInfo } = await supabase
      .from('creator_infos')
      .select('wallet_address')
      .eq('campaign_id', campaignId)
      .single();

    if (!creatorInfo) {
      return NextResponse.json(
        { success: false, error: 'Creator info not found' },
        { status: 404 }
      );
    }

    // 6. Distribuer pour chaque Top 3
    const distributionResults: any[] = [];

    for (const completion of top3Completions) {
      // Vérifier qu'aucune distribution Premium n'existe déjà pour cette completion
      const { data: existing } = await supabase
        .from('reward_distributions')
        .select('id')
        .eq('completion_id', completion.id)
        .eq('reward_tier', 'premium')
        .eq('status', 'completed')
        .single();

      if (existing) {
        console.log(`⚠️ Premium reward already distributed for completion ${completion.id}`);
        continue;
      }

      // Récupérer config Premium Token
      const { data: premiumTokenRewards } = await supabase
        .from('token_rewards')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('reward_tier', 'premium')
        .limit(1);

      if (premiumTokenRewards && premiumTokenRewards.length > 0) {
        const premiumReward = premiumTokenRewards[0];

        console.log(`🎁 Distributing premium token reward to ranking #${completion.ranking}:`, premiumReward.token_name);

        const result = await distributeERC20Token(
          campaignId,
          completion.id,
          completion.completer_wallet,
          {
            contractAddress: premiumReward.contract_address,
            blockchain: premiumReward.blockchain,
            amountPerUser: premiumReward.amount_per_user,
            decimals: premiumReward.decimals,
            creatorWallet: creatorInfo.wallet_address
          }
        );

        if (result.success && result.txHash) {
          // Enregistrer
          await supabase.from('reward_distributions').insert({
            campaign_id: campaignId,
            completion_id: completion.id,
            reward_tier: 'premium',
            reward_category: 'token',
            blockchain: premiumReward.blockchain,
            token_symbol: premiumReward.token_name,
            amount: premiumReward.amount_per_user,
            recipient_wallet: completion.completer_wallet,
            tx_hash: result.txHash,
            status: 'completed',
            distributed_at: new Date().toISOString()
          });

          // Vérifier on-chain
          const verificationResult = await verifyOnChainDistribution(
            result.txHash,
            premiumReward.blockchain
          );

          if (!verificationResult.success) {
            console.error('❌ On-chain verification failed:', verificationResult.error);
          }

          // Notification
          await notifyRewardDistributed(
            completion.completer_wallet,
            campaignId,
            completion.id,
            'premium',
            {
              tokenName: premiumReward.token_name,
              amount: premiumReward.amount_per_user,
              ranking: completion.ranking || undefined
            }
          );

          distributionResults.push({
            completionId: completion.id,
            ranking: completion.ranking,
            success: true,
            txHash: result.txHash
          });
        } else {
          console.error(`❌ Premium distribution failed for completion ${completion.id}:`, result.error);
          distributionResults.push({
            completionId: completion.id,
            ranking: completion.ranking,
            success: false,
            error: result.error
          });
        }
      }

      // Même logique pour item_rewards Premium si nécessaire
      // TODO: Ajouter support pour items Premium
    }

    const successful = distributionResults.filter(r => r.success);
    const failed = distributionResults.filter(r => !r.success);

    console.log(`✅ Distributed premium rewards: ${successful.length} successful, ${failed.length} failed`);

    return NextResponse.json({
      success: true,
      message: 'Premium rewards distribution completed',
      data: {
        top3Count: top3Completions.length,
        distributed: successful.length,
        failed: failed.length,
        results: distributionResults
      }
    });

  } catch (error) {
    console.error('Error distributing premium rewards:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to distribute premium rewards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Calcule le Top 3 des complétions par moyenne de scores
 */
async function calculateTop3Ranking(campaignId: string): Promise<any[]> {
  const { data: completions, error } = await supabase
    .from('completions')
    .select('id, completer_wallet, score_avg, ranking')
    .eq('original_campaign_id', campaignId)
    .eq('validation_status', 'approved')
    .eq('validation_conditions_met', true)
    .not('score_avg', 'is', null)
    .order('score_avg', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error calculating Top 3:', error);
    return [];
  }

  // Mettre à jour le ranking dans la base
  if (completions) {
    for (let i = 0; i < completions.length; i++) {
      await supabase
        .from('completions')
        .update({ ranking: i + 1 })
        .eq('id', completions[i].id);
    }
  }

  return completions || [];
}

/**
 * Vérifie si une campagne est terminée
 */
async function checkCampaignEnded(campaignId: string): Promise<boolean> {
  // Vérifier statut
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status')
    .eq('id', campaignId)
    .single();

  if (campaign?.status === 'COMPLETED') {
    return true;
  }

  // Vérifier max complétions atteint
  const { data: pricingConfig } = await supabase
    .from('campaign_pricing_configs')
    .select('max_completions')
    .eq('campaign_id', campaignId)
    .single();

  const { data: metadata } = await supabase
    .from('campaign_metadata')
    .select('total_completions')
    .eq('campaign_id', campaignId)
    .single();

  if (pricingConfig?.max_completions && metadata?.total_completions) {
    if (metadata.total_completions >= pricingConfig.max_completions) {
      return true;
    }
  }

  // TODO: Vérifier date de fin si configurée
  // Pour l'instant, on se base sur le statut et max_completions

  return false;
}

