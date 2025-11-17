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

interface DistributeStandardRequest {
  completionId: string;
  campaignId: string;
  completerWallet: string;
}

/**
 * POST /api/rewards/distribute-standard
 * 
 * Distribue les récompenses Standard immédiatement après validation d'une completion
 */
export async function POST(request: NextRequest) {
  try {
    const data: DistributeStandardRequest = await request.json();

    console.log('=== DISTRIBUTING STANDARD REWARDS ===');
    console.log('Completion ID:', data.completionId);
    console.log('Campaign ID:', data.campaignId);
    console.log('Completer Wallet:', data.completerWallet);

    // 1. Vérifier que completion appartient bien à la campagne
    const { data: completion, error: compError } = await supabase
      .from('completions')
      .select('*, original_campaign_id, validation_status, validation_conditions_met, title')
      .eq('id', data.completionId)
      .single();

    if (compError || !completion) {
      return NextResponse.json(
        { success: false, error: 'Completion not found' },
        { status: 404 }
      );
    }

    if (completion.original_campaign_id !== data.campaignId) {
      return NextResponse.json(
        { success: false, error: 'Completion does not belong to this campaign' },
        { status: 400 }
      );
    }

    if (completion.validation_status !== 'approved' || !completion.validation_conditions_met) {
      return NextResponse.json(
        { success: false, error: 'Completion not validated yet' },
        { status: 400 }
      );
    }

    // 2. Vérifier qu'aucune distribution Standard n'existe déjà (anti-double)
    const { data: existingDistribution } = await supabase
      .from('reward_distributions')
      .select('id')
      .eq('completion_id', data.completionId)
      .eq('reward_tier', 'standard')
      .eq('status', 'completed')
      .single();

    if (existingDistribution) {
      console.warn('⚠️ Standard reward already distributed for this completion');
      return NextResponse.json({
        success: true,
        message: 'Reward already distributed',
        data: { distributionId: existingDistribution.id }
      });
    }

    // 3. Récupérer wallet créateur pour vérifier les récompenses locked
    const { data: creatorInfo } = await supabase
      .from('creator_infos')
      .select('wallet_address')
      .eq('campaign_id', data.campaignId)
      .single();

    if (!creatorInfo) {
      return NextResponse.json(
        { success: false, error: 'Creator info not found' },
        { status: 404 }
      );
    }

    const distributionResults: any[] = [];

    // 4. Distribuer récompenses Token Standard
    const { data: tokenRewards, error: tokenError } = await supabase
      .from('token_rewards')
      .select('*')
      .eq('campaign_id', data.campaignId)
      .eq('reward_tier', 'standard')
      .limit(1);

    if (!tokenError && tokenRewards && tokenRewards.length > 0) {
      const tokenReward = tokenRewards[0];

      console.log('🎁 Distributing standard token reward:', tokenReward.token_name);

      const distributionResult = await distributeERC20Token(
        data.campaignId,
        data.completionId,
        data.completerWallet,
        {
          contractAddress: tokenReward.contract_address,
          blockchain: tokenReward.blockchain,
          amountPerUser: tokenReward.amount_per_user,
          decimals: tokenReward.decimals,
          creatorWallet: creatorInfo.wallet_address
        }
      );

      if (distributionResult.success && distributionResult.txHash) {
        // Enregistrer dans reward_distributions
        const { error: insertError } = await supabase.from('reward_distributions').insert({
          campaign_id: data.campaignId,
          completion_id: data.completionId,
          reward_tier: 'standard',
          reward_category: 'token',
          blockchain: tokenReward.blockchain,
          token_symbol: tokenReward.token_name,
          amount: tokenReward.amount_per_user,
          recipient_wallet: data.completerWallet,
          tx_hash: distributionResult.txHash,
          status: 'completed',
          distributed_at: new Date().toISOString()
        });

        if (insertError) {
          console.error('Error inserting reward distribution:', insertError);
        } else {
          // Vérifier on-chain immédiatement
          const verificationResult = await verifyOnChainDistribution(
            distributionResult.txHash,
            tokenReward.blockchain
          );

          if (!verificationResult.success) {
            console.error('❌ On-chain verification failed:', verificationResult.error);
          } else {
            console.log('✅ On-chain verification successful, block:', verificationResult.blockNumber);
          }

          // Créer notification
          await notifyRewardDistributed(
            data.completerWallet,
            data.campaignId,
            data.completionId,
            'standard',
            {
              tokenName: tokenReward.token_name,
              amount: tokenReward.amount_per_user
            }
          );

          distributionResults.push({
            type: 'token',
            success: true,
            txHash: distributionResult.txHash
          });
        }
      } else {
        console.error('❌ Token distribution failed:', distributionResult.error);
        distributionResults.push({
          type: 'token',
          success: false,
          error: distributionResult.error
        });
      }
    }

    // 5. Distribuer récompenses Item Standard (ERC1155/ERC721)
    const { data: itemRewards, error: itemError } = await supabase
      .from('item_rewards')
      .select('*')
      .eq('campaign_id', data.campaignId)
      .eq('reward_tier', 'standard')
      .limit(1);

    if (!itemError && itemRewards && itemRewards.length > 0) {
      const itemReward = itemRewards[0];

      console.log('🎁 Distributing standard item reward:', itemReward.item_name);

      let distributionResult;
      if (itemReward.item_standard === 'ERC1155') {
        distributionResult = await distributeERC1155Item(
          data.campaignId,
          data.completionId,
          data.completerWallet,
          {
            contractAddress: itemReward.contract_address,
            blockchain: itemReward.blockchain,
            tokenId: '0', // TODO: Récupérer depuis metadata si disponible
            amountPerUser: itemReward.amount_per_user,
            creatorWallet: creatorInfo.wallet_address
          }
        );
      } else if (itemReward.item_standard === 'ERC721') {
        distributionResult = await distributeERC721NFT(
          data.campaignId,
          data.completionId,
          data.completerWallet,
          {
            contractAddress: itemReward.contract_address,
            blockchain: itemReward.blockchain,
            tokenId: '0', // TODO: Récupérer depuis metadata si disponible
            creatorWallet: creatorInfo.wallet_address
          }
        );
      }

      if (distributionResult?.success && distributionResult.txHash) {
        await supabase.from('reward_distributions').insert({
          campaign_id: data.campaignId,
          completion_id: data.completionId,
          reward_tier: 'standard',
          reward_category: 'item',
          blockchain: itemReward.blockchain,
          token_symbol: itemReward.item_name,
          amount: itemReward.amount_per_user,
          recipient_wallet: data.completerWallet,
          tx_hash: distributionResult.txHash,
          status: 'completed',
          distributed_at: new Date().toISOString()
        });

        distributionResults.push({
          type: 'item',
          success: true,
          txHash: distributionResult.txHash
        });
      }
    }

    const successfulDistributions = distributionResults.filter(r => r.success);
    const failedDistributions = distributionResults.filter(r => !r.success);

    console.log(`✅ Distributed ${successfulDistributions.length} standard rewards`);
    if (failedDistributions.length > 0) {
      console.warn(`⚠️ ${failedDistributions.length} distributions failed`);
    }

    return NextResponse.json({
      success: true,
      message: 'Standard rewards distribution completed',
      data: {
        successful: successfulDistributions.length,
        failed: failedDistributions.length,
        results: distributionResults
      }
    });

  } catch (error) {
    console.error('Error distributing standard rewards:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to distribute rewards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

