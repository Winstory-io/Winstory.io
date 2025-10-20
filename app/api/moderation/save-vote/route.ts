import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Interface pour les données de vote à sauvegarder
interface VoteToSave {
  campaignId: string;
  moderatorWallet: string;
  completionId?: string;
  voteDecision: 'VALID' | 'REFUSE';
  score?: number;
  stakedAmount: number;
  stakeAgeDays: number;
  moderatorXP: number;
  voteTimestamp: number;
  transactionHash?: string;
}

// Interface pour la réponse
interface SaveVoteResponse {
  success: boolean;
  voteId?: string;
  consoleLogs: string[];
  error?: string;
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
      voteTimestamp,
      transactionHash
    } = body;

    consoleLogs.push(`🔍 [SAVE VOTE] Sauvegarde du vote pour la campagne ${campaignId}`);
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

    // Prépare les données à sauvegarder
    const voteData: VoteToSave = {
      campaignId,
      moderatorWallet,
      completionId,
      voteDecision,
      score,
      stakedAmount: stakedAmount || 0,
      stakeAgeDays: stakeAgeDays || 0,
      moderatorXP: moderatorXP || 0,
      voteTimestamp: voteTimestamp || Date.now(),
      transactionHash
    };

    // Compute vote weight using V1 factors (per-voter approximation)
    const threshold_stake_k = 50; // democracy threshold
    const XP_scale = 100;
    const age_max_days = 365;
    const alpha = 0.5;
    const beta = 0.5;
    const stake = Number(stakedAmount || 0);
    const ageDays = Number(stakeAgeDays || 0);
    const xpVal = Number(moderatorXP || 0);

    const stake_factor = stake > 0 ? stake / (stake + threshold_stake_k) : 0;
    const xp_factor = 1 + Math.log1p(Math.max(0, xpVal)) / Math.log1p(XP_scale);
    const age_factor = Math.min(1, Math.max(0, ageDays) / age_max_days);
    const demo_raw = stake_factor * xp_factor * age_factor; // not normalized (single voter context)
    const pluto_raw = stake; // raw stake
    // Normalize in a single-voter context → share = 1 if voter present
    const pluto_share = pluto_raw > 0 ? 1 : 0;
    const demo_share = demo_raw > 0 ? 1 : 0; 
    const vote_weight = Number((alpha * pluto_share + beta * demo_share).toFixed(3));

    // Sauvegarde réelle avec Supabase
    if (!supabaseServer) {
      consoleLogs.push('⚠️ Supabase server client is not configured. Skipping DB insert.');
    }

    let voteId: string | undefined = undefined;
    if (supabaseServer) {
      const insertPayload: Record<string, any> = {
        campaign_id: voteData.campaignId,
        moderator_wallet: voteData.moderatorWallet,
        completion_id: voteData.completionId ?? null,
        vote_decision: voteData.voteDecision,
        staked_amount: voteData.stakedAmount,
        vote_weight: vote_weight,
        transaction_hash: voteData.transactionHash ?? null,
        vote_timestamp: new Date(voteData.voteTimestamp).toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseServer
        .from('moderation_votes')
        .insert([insertPayload])
        .select('id')
        .single();

      if (error) {
        consoleLogs.push(`❌ Supabase insert error: ${error.message}`);
      } else {
        voteId = data?.id as string | undefined;
        consoleLogs.push(`✅ Vote inserted into moderation_votes with id: ${voteId}`);
      }

      // If this is a completion vote with a score or a refusal, persist granular score metrics
      if (completionId && (typeof score === 'number' || voteDecision === 'REFUSE')) {
        const scoreValue = voteDecision === 'REFUSE' ? 0 : Math.max(0, Math.min(100, Number(score ?? 0)));
        const isRefused = voteDecision === 'REFUSE' || scoreValue === 0;
        const scoreInsert = {
          completion_id: completionId,
          completion_history_id: null, // optional if you track history; can be updated later
          staker_wallet: moderatorWallet,
          staker_name: moderatorWallet.slice(0, 6),
          score: scoreValue,
          staked_amount: stake,
          vote_timestamp: new Date(voteData.voteTimestamp).toISOString(),
          is_refused: isRefused,
          created_at: new Date().toISOString(),
        };
        const { error: scoreErr } = await supabaseServer
          .from('user_completion_moderator_scores')
          .insert([scoreInsert]);
        if (scoreErr) {
          consoleLogs.push(`⚠️ Insert user_completion_moderator_scores failed: ${scoreErr.message}`);
        } else {
          consoleLogs.push('✅ Stored completion score metrics');
        }
      }
    }

    // Logs détaillés pour le debugging
    consoleLogs.push(`📋 Données complètes du vote:`);
    consoleLogs.push(`   - ✅ Valid = ${voteDecision === 'VALID' ? '✅' : '❌'}`);
    consoleLogs.push(`   - ❌ Refuse = ${voteDecision === 'REFUSE' ? '❌' : '✅'}`);
    consoleLogs.push(`   - Score: ${score || 'N/A'}`);
    consoleLogs.push(`   - Stake: ${stakedAmount} WINC`);
    consoleLogs.push(`   - Âge du stake: ${stakeAgeDays} jours`);
    consoleLogs.push(`   - XP modérateur: ${moderatorXP}`);

    // Logs pour le backend
    console.log('🔍 [SAVE VOTE API] Vote sauvegardé:', {
      voteId,
      voteData,
      timestamp: new Date().toISOString()
    });

    // TODO: Implémenter la vraie logique de sauvegarde avec Prisma/Supabase
    // Exemple de requête SQL qui devrait être exécutée :
    /*
    INSERT INTO moderation_votes (
      id,
      campaign_id,
      moderator_wallet,
      completion_id,
      vote_decision,
      staked_amount,
      vote_weight,
      vote_timestamp,
      created_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, NOW()
    );
    */

    const response: SaveVoteResponse = {
      success: true,
      voteId: voteId ?? undefined,
      consoleLogs
    };

    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    
    console.error('❌ [SAVE VOTE API] Erreur:', error);
    
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
    message: 'API pour sauvegarder les votes de modération en base de données',
    usage: {
      method: 'POST',
      endpoint: '/api/moderation/save-vote',
      description: 'Sauvegarde un vote de modération dans la table moderation_votes'
    },
    requiredFields: {
      campaignId: 'string - ID de la campagne',
      moderatorWallet: 'string - Adresse wallet du modérateur',
      voteDecision: 'VALID | REFUSE - Décision du modérateur'
    },
    optionalFields: {
      completionId: 'string - ID de la complétion (pour les votes sur complétions)',
      score: 'number (1-100) - Score pour les votes VALID sur complétions',
      stakedAmount: 'number - Montant staké en WINC',
      stakeAgeDays: 'number - Âge du stake en jours',
      moderatorXP: 'number - XP actuel du modérateur',
      voteTimestamp: 'number - Timestamp du vote',
      transactionHash: 'string - Hash de transaction blockchain'
    },
    databaseTable: 'moderation_votes',
    example: {
      campaignId: 'campaign_123',
      moderatorWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      voteDecision: 'VALID',
      score: 85,
      completionId: 'completion_456',
      stakedAmount: 1000,
      stakeAgeDays: 30,
      moderatorXP: 200,
      voteTimestamp: Date.now(),
      transactionHash: '0x123...'
    }
  });
}
