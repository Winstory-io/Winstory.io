import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkTokenBalance } from '@/lib/reward-distribution-helpers';
import {
  lockERC20Tokens,
  lockERC1155Items,
  lockERC721NFT,
  checkApprovalStatus,
  getWinstoryCustodialAddress
} from '@/lib/reward-lock-helpers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LockRewardsRequest {
  campaignId: string;
  creatorWallet: string;
  maxCompletions: number;
}

/**
 * POST /api/rewards/lock
 * 
 * Vérifie et enregistre le lock des récompenses au MINT initial
 * 
 * NOTE: Pour l'instant, cette API vérifie les soldes et enregistre dans reward_locks.
 * L'intégration du Smart Contract pour réellement lock les tokens sera faite ultérieurement.
 */
export async function POST(request: NextRequest) {
  try {
    const data: LockRewardsRequest = await request.json();

    console.log('=== LOCKING REWARDS AT MINT ===');
    console.log('Campaign ID:', data.campaignId);
    console.log('Creator Wallet:', data.creatorWallet);
    console.log('Max Completions:', data.maxCompletions);

    if (!data.campaignId || !data.creatorWallet || !data.maxCompletions) {
      return NextResponse.json(
        { success: false, error: 'campaignId, creatorWallet, and maxCompletions are required' },
        { status: 400 }
      );
    }

    // 1. Vérifier que la campagne existe
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', data.campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // 2. Vérifier qu'aucun lock n'existe déjà
    const { data: existingLock } = await supabase
      .from('reward_locks')
      .select('id')
      .eq('campaign_id', data.campaignId)
      .single();

    if (existingLock) {
      console.warn('⚠️ Rewards already locked for this campaign');
      return NextResponse.json({
        success: true,
        message: 'Rewards already locked',
        data: { lockId: existingLock.id }
      });
    }

    // 3. Récupérer les récompenses configurées
    const { data: tokenRewards } = await supabase
      .from('token_rewards')
      .select('*')
      .eq('campaign_id', data.campaignId);

    const { data: itemRewards } = await supabase
      .from('item_rewards')
      .select('*')
      .eq('campaign_id', data.campaignId);

    // 4. Calculer les totaux nécessaires et LOCK RÉEL des tokens
    let standardTotalLocked = 0;
    let premiumTotalLocked = 0;
    const validationErrors: string[] = [];
    const lockResults: any[] = [];
    const winstoryAddress = getWinstoryCustodialAddress();

    // Standard rewards - LOCK RÉEL
    const standardTokenRewards = tokenRewards?.filter(r => r.reward_tier === 'standard') || [];
    const standardItemRewards = itemRewards?.filter(r => r.reward_tier === 'standard') || [];

    for (const reward of standardTokenRewards) {
      const totalNeeded = reward.amount_per_user * data.maxCompletions;
      standardTotalLocked += totalNeeded;

      // Vérifier solde
      try {
        const balance = await checkTokenBalance(
          reward.contract_address,
          reward.blockchain,
          data.creatorWallet,
          reward.token_standard || 'ERC20'
        );

        if (parseFloat(balance) < totalNeeded) {
          validationErrors.push(
            `Insufficient balance for ${reward.token_name}: Required ${totalNeeded}, Available ${balance}`
          );
          continue; // Skip lock si solde insuffisant
        }

        // Vérifier approbation
        const approvalStatus = await checkApprovalStatus(
          reward.contract_address,
          reward.blockchain,
          reward.token_standard || 'ERC20',
          data.creatorWallet,
          totalNeeded.toString()
        );

        if (approvalStatus.needsApproval) {
          validationErrors.push(
            `Approval required for ${reward.token_name}. Creator must approve Winstory wallet (${winstoryAddress}) to transfer ${totalNeeded} tokens.`
          );
          continue; // Skip lock si pas approuvé
        }

        // LOCK RÉEL des tokens
        console.log(`🔒 Locking ${totalNeeded} ${reward.token_name} (Standard)...`);
        const lockResult = await lockERC20Tokens(
          reward.contract_address,
          reward.blockchain,
          data.creatorWallet,
          totalNeeded.toString(),
          reward.decimals
        );

        if (lockResult.success && lockResult.txHash) {
          lockResults.push({
            type: 'standard_token',
            tokenName: reward.token_name,
            amount: totalNeeded,
            txHash: lockResult.txHash,
            success: true
          });
          console.log(`✅ Standard tokens locked: ${lockResult.txHash}`);
        } else {
          validationErrors.push(
            `Failed to lock ${reward.token_name}: ${lockResult.error}`
          );
          lockResults.push({
            type: 'standard_token',
            tokenName: reward.token_name,
            success: false,
            error: lockResult.error
          });
        }
      } catch (error) {
        console.error(`Error locking ${reward.token_name}:`, error);
        validationErrors.push(
          `Error locking ${reward.token_name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Premium rewards (Top 3) - LOCK RÉEL
    const premiumTokenRewards = tokenRewards?.filter(r => r.reward_tier === 'premium') || [];
    const premiumItemRewards = itemRewards?.filter(r => r.reward_tier === 'premium') || [];

    for (const reward of premiumTokenRewards) {
      const totalNeeded = reward.amount_per_user * 3; // Top 3
      premiumTotalLocked += totalNeeded;

      // Vérifier solde
      try {
        const balance = await checkTokenBalance(
          reward.contract_address,
          reward.blockchain,
          data.creatorWallet,
          reward.token_standard || 'ERC20'
        );

        if (parseFloat(balance) < totalNeeded) {
          validationErrors.push(
            `Insufficient balance for premium ${reward.token_name}: Required ${totalNeeded}, Available ${balance}`
          );
          continue;
        }

        // Vérifier approbation
        const approvalStatus = await checkApprovalStatus(
          reward.contract_address,
          reward.blockchain,
          reward.token_standard || 'ERC20',
          data.creatorWallet,
          totalNeeded.toString()
        );

        if (approvalStatus.needsApproval) {
          validationErrors.push(
            `Approval required for premium ${reward.token_name}. Creator must approve Winstory wallet (${winstoryAddress}) to transfer ${totalNeeded} tokens.`
          );
          continue;
        }

        // LOCK RÉEL des tokens Premium
        console.log(`🔒 Locking ${totalNeeded} ${reward.token_name} (Premium)...`);
        const lockResult = await lockERC20Tokens(
          reward.contract_address,
          reward.blockchain,
          data.creatorWallet,
          totalNeeded.toString(),
          reward.decimals
        );

        if (lockResult.success && lockResult.txHash) {
          lockResults.push({
            type: 'premium_token',
            tokenName: reward.token_name,
            amount: totalNeeded,
            txHash: lockResult.txHash,
            success: true
          });
          console.log(`✅ Premium tokens locked: ${lockResult.txHash}`);
        } else {
          validationErrors.push(
            `Failed to lock premium ${reward.token_name}: ${lockResult.error}`
          );
        }
      } catch (error) {
        console.error(`Error locking premium ${reward.token_name}:`, error);
        validationErrors.push(
          `Error locking premium ${reward.token_name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Items ERC1155/ERC721 (si configurés)
    // TODO: Implémenter lock pour items si nécessaire

    // 5. Enregistrer le lock dans la base avec les tx_hash
    const successfulLocks = lockResults.filter(r => r.success);
    const failedLocks = lockResults.filter(r => !r.success);
    
    // Prendre le premier tx_hash comme référence principale (ou créer un hash combiné)
    const primaryLockTxHash = successfulLocks.length > 0 ? successfulLocks[0].txHash : null;
    
    const { data: lockRecord, error: lockError } = await supabase
      .from('reward_locks')
      .insert({
        campaign_id: data.campaignId,
        creator_wallet: data.creatorWallet,
        standard_total_locked: standardTotalLocked,
        premium_total_locked: premiumTotalLocked,
        status: successfulLocks.length > 0 && failedLocks.length === 0 ? 'locked' : 
                successfulLocks.length > 0 ? 'locked' : 'failed',
        lock_tx_hash: primaryLockTxHash,
        error_message: validationErrors.length > 0 ? validationErrors.join('; ') : null,
        locked_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (lockError) {
      console.error('Error creating reward lock:', lockError);
      return NextResponse.json(
        { success: false, error: 'Failed to create reward lock', details: lockError.message },
        { status: 500 }
      );
    }

    console.log('✅ Reward lock record created:', lockRecord.id);
    console.log(`   Standard locked: ${standardTotalLocked}`);
    console.log(`   Premium locked: ${premiumTotalLocked}`);
    console.log(`   Successful locks: ${successfulLocks.length}`);
    console.log(`   Failed locks: ${failedLocks.length}`);

    if (validationErrors.length > 0) {
      console.warn('⚠️ Validation warnings/errors:', validationErrors);
    }

    // Si au moins un lock a réussi, considérer comme succès partiel
    const overallSuccess = successfulLocks.length > 0;

    return NextResponse.json({
      success: overallSuccess,
      message: overallSuccess 
        ? `Rewards locked successfully (${successfulLocks.length} successful, ${failedLocks.length} failed)`
        : 'Failed to lock rewards',
      data: {
        lockId: lockRecord.id,
        standardTotalLocked,
        premiumTotalLocked,
        winstoryCustodialAddress: winstoryAddress,
        lockResults,
        successfulLocks: successfulLocks.length,
        failedLocks: failedLocks.length,
        validationWarnings: validationErrors.length > 0 ? validationErrors : undefined
      }
    });

  } catch (error) {
    console.error('Error locking rewards:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to lock rewards',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

