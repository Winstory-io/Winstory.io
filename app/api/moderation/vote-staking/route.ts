import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  computeStakingDecisionV1,
  StakerInputV1,
  StakingFrameworkParamsV1,
  StakingFrameworkOutputV1
} from '@/lib/moderation-engine';

// Interface pour les données de vote de modération
interface ModerationVoteData {
  campaignId: string;
  moderatorWallet: string;
  completionId?: string;
  voteDecision: 'VALID' | 'REFUSE';
  score?: number; // Pour les complétions avec notation
  stakedAmount: number;
  stakeAgeDays: number;
  moderatorXP: number;
  voteTimestamp: number;
  transactionHash?: string;
}

// Interface pour la réponse complète
interface ModerationVoteResponse {
  success: boolean;
  voteId: string;
  moderationData: ModerationVoteData;
  stakingResult?: StakingFrameworkOutputV1;
  consoleLogs: string[];
}

export async function POST(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const body = await request.json();
    const {
      campaignId,
      moderatorWallet,
      completionId,
      voteDecision,
      score,
      stakedAmount,
      stakeAgeDays,
      moderatorXP,
      transactionHash,
      // Paramètres optionnels pour le framework de staking
      stakingParams
    } = body;

    consoleLogs.push(`🔍 [MODERATION VOTE] Début du traitement pour la campagne ${campaignId}`);
    consoleLogs.push(`👤 Modérateur: ${moderatorWallet}`);
    consoleLogs.push(`🗳️ Vote: ${voteDecision}${score ? ` avec score ${score}` : ''}`);

    // Validation des données requises
    if (!campaignId || !moderatorWallet || !voteDecision) {
      const error = 'Données manquantes: campaignId, moderatorWallet et voteDecision sont requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Validation du vote
    if (!['VALID', 'REFUSE'].includes(voteDecision)) {
      const error = 'voteDecision doit être VALID ou REFUSE';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Validation du score pour les complétions
    if (completionId && voteDecision === 'VALID' && (score === undefined || score < 1 || score > 100)) {
      const error = 'Pour les votes VALID sur les complétions, un score entre 1 et 100 est requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Créer l'objet de données de vote
    const moderationData: ModerationVoteData = {
      campaignId,
      moderatorWallet,
      completionId,
      voteDecision,
      score,
      stakedAmount: stakedAmount || 0,
      stakeAgeDays: stakeAgeDays || 0,
      moderatorXP: moderatorXP || 0,
      voteTimestamp: Date.now(),
      transactionHash
    };

    consoleLogs.push(`📊 Données du staker: ${stakedAmount} WINC, âge: ${stakeAgeDays} jours, XP: ${moderatorXP}`);

    // Générer un ID unique pour ce vote
    const voteId = `vote_${campaignId}_${moderatorWallet}_${Date.now()}`;

    // Si on a des données de staking, calculer le résultat selon le framework V1
    let stakingResult: StakingFrameworkOutputV1 | undefined;
    
    if (stakedAmount > 0 && stakingParams) {
      consoleLogs.push(`🔄 Calcul du framework de staking V1...`);
      
      try {
        // Créer les données du staker pour le calcul
        const stakerData: StakerInputV1 = {
          wallet: moderatorWallet,
          stake: stakedAmount,
          stakeAgeDays: stakeAgeDays || 0,
          xp: moderatorXP || 0,
          vote: voteDecision === 'VALID' ? 'YES' : 'NO'
        };

        // Paramètres par défaut du framework V1
        const defaultParams: StakingFrameworkParamsV1 = {
          minStakeToVote: 50,
          stakeAgeMinDays: 7,
          threshold_stake_k: 50,
          age_max_days: 365,
          XP_scale: 100,
          alpha: 0.5,
          beta: 0.5,
          fraction_small_threshold: 0.30,
          stake_fraction_threshold: 0.5,
          enableAdaptiveDemocracy: true,
          totalPoolEur: 510,
          majorityPoolRatio: 0.9
        };

        const finalParams = { ...defaultParams, ...stakingParams };
        
        // Calculer le résultat du staking
        stakingResult = computeStakingDecisionV1([stakerData], finalParams);
        
        consoleLogs.push(`✅ Résultat du staking calculé:`);
        consoleLogs.push(`   - Décision: ${stakingResult.decision}`);
        consoleLogs.push(`   - Pool majoritaire: ${stakingResult.majority_pool_eur}€`);
        consoleLogs.push(`   - Pool minoritaire: ${stakingResult.minority_pool_eur}€`);
        consoleLogs.push(`   - Gain du modérateur: ${stakingResult.distribution[0]?.reward_eur || 0}€`);
        consoleLogs.push(`   - XP gagné: ${stakingResult.distribution[0]?.xp || 0}`);
        
      } catch (stakingError) {
        consoleLogs.push(`⚠️ Erreur dans le calcul du staking: ${stakingError}`);
        // Ne pas faire échouer le vote pour une erreur de staking
      }
    }

    // TODO: Sauvegarder en base de données
    // Ici, vous devriez implémenter la sauvegarde dans la table moderation_votes
    consoleLogs.push(`💾 TODO: Sauvegarde en base de données`);
    consoleLogs.push(`   - Table: moderation_votes`);
    consoleLogs.push(`   - Vote ID: ${voteId}`);
    consoleLogs.push(`   - Décision: ${voteDecision}`);
    consoleLogs.push(`   - Score: ${score || 'N/A'}`);

          // Call the save API
    try {
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/moderation/save-vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moderationData),
      });

      if (saveResponse.ok) {
        const saveResult = await saveResponse.json();
        consoleLogs.push(`✅ Vote saved successfully: ${saveResult.voteId}`);
        
        // Display save logs
        if (saveResult.consoleLogs) {
          saveResult.consoleLogs.forEach((log: string) => {
            consoleLogs.push(log);
          });
        }

        // ===================================
        // AWARD XP FOR MODERATION VOTE
        // ===================================
        consoleLogs.push(`🎯 [XP] Awarding moderation vote XP...`);
        try {
          // Get campaign info to determine campaign type
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('creator_type')
            .eq('id', campaignId)
            .single();
          
          // Map creator_type to campaign type
          let campaignType = 'B2C';
          if (campaign) {
            if (campaign.creator_type === 'B2C_AGENCIES') {
              campaignType = 'AGENCY_B2C';
            } else if (campaign.creator_type === 'INDIVIDUAL_CREATORS') {
              campaignType = 'INDIVIDUAL';
            }
          }
          
          const xpResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/xp/award-moderation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'vote',
              moderatorWallet,
              campaignId,
              campaignType,
              voteDecision,
              completionId
            })
          });

          if (xpResponse.ok) {
            const xpResult = await xpResponse.json();
            consoleLogs.push(`✅ [XP] Moderation vote XP awarded: ${xpResult.data?.xpAmount || 0} XP`);
          } else {
            consoleLogs.push(`⚠️ [XP] Failed to award moderation XP`);
          }
        } catch (xpError) {
          consoleLogs.push(`⚠️ [XP] Error awarding moderation XP: ${xpError}`);
        }

      } else {
        consoleLogs.push(`⚠️ Error during save: ${saveResponse.status}`);
      }
    } catch (saveError) {
      consoleLogs.push(`⚠️ Error calling save API: ${saveError}`);
    }

    // Detailed logs for debugging
    consoleLogs.push(`📋 Vote summary:`);
    consoleLogs.push(`   - ✅ Valid = ${voteDecision === 'VALID' ? '✅' : '❌'}`);
    consoleLogs.push(`   - ❌ Refuse = ${voteDecision === 'REFUSE' ? '❌' : '✅'}`);
    consoleLogs.push(`   - Score: ${score || 'N/A'}`);
    consoleLogs.push(`   - Stake: ${stakedAmount} WINC`);
    consoleLogs.push(`   - Stake age: ${stakeAgeDays} days`);
    consoleLogs.push(`   - Moderator XP: ${moderatorXP}`);

    // Logs pour le backend
    console.log('🔍 [MODERATION VOTE API] Vote traité:', {
      voteId,
      campaignId,
      moderatorWallet,
      voteDecision,
      score,
      stakedAmount,
      stakeAgeDays,
      moderatorXP,
      stakingResult: stakingResult ? {
        decision: stakingResult.decision,
        majorityPool: stakingResult.majority_pool_eur,
        minorityPool: stakingResult.minority_pool_eur,
        moderatorReward: stakingResult.distribution[0]?.reward_eur || 0,
        moderatorXP: stakingResult.distribution[0]?.xp || 0
      } : null
    });

    const response: ModerationVoteResponse = {
      success: true,
      voteId,
      moderationData,
      stakingResult,
      consoleLogs
    };

    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    
    console.error('❌ [MODERATION VOTE API] Erreur:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage, 
        consoleLogs 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API pour les votes de modération avec intégration du framework de staking V1',
    usage: {
      method: 'POST',
      endpoint: '/api/moderation/vote-staking',
      description: 'Enregistre un vote de modération et calcule les gains selon le framework de staking V1'
    },
    requiredFields: {
      campaignId: 'string - ID de la campagne',
      moderatorWallet: 'string - Adresse wallet du modérateur',
      voteDecision: 'VALID | REFUSE - Décision du modérateur',
      score: 'number (1-100) - Score pour les complétions VALID (optionnel)',
      stakedAmount: 'number - Montant staké en WINC',
      stakeAgeDays: 'number - Âge du stake en jours',
      moderatorXP: 'number - XP actuel du modérateur'
    },
    optionalFields: {
      completionId: 'string - ID de la complétion (pour les votes sur complétions)',
      transactionHash: 'string - Hash de transaction blockchain',
      stakingParams: 'object - Paramètres personnalisés pour le framework de staking'
    },
    example: {
      campaignId: 'campaign_123',
      moderatorWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      voteDecision: 'VALID',
      score: 85,
      stakedAmount: 1000,
      stakeAgeDays: 30,
      moderatorXP: 200,
      completionId: 'completion_456',
      stakingParams: {
        totalPoolEur: 510,
        majorityPoolRatio: 0.9
      }
    }
  });
}
