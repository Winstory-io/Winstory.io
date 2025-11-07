import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { evaluateModeration, ModerationStatus } from '@/lib/moderation-engine';

const SCALE = 1e18; // Fixed-point arithmetic scale
const MIN_REQUIRED_VOTES = 22;

/**
 * POST /api/moderation/check-final-decision
 * 
 * Vérifie si une campagne a atteint une décision finale (VALIDATED ou REFUSED)
 * et appelle l'API final-decision pour déplacer/supprimer les vidéos S3 si nécessaire.
 * 
 * Cette fonction doit être appelée :
 * - Après chaque vote de modération
 * - Par un cron job périodique
 * - Après calcul du TOP 3 pour les complétions
 */
export async function POST(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const body = await request.json();
    const { campaignId, completionId, campaignType } = body;

    consoleLogs.push(`🔍 [CHECK FINAL DECISION] Vérification pour la campagne ${campaignId}`);
    consoleLogs.push(`📋 Type: ${campaignType}`);
    consoleLogs.push(`📋 Completion ID: ${completionId || 'N/A'}`);

    if (!campaignId || !campaignType) {
      const error = 'campaignId et campaignType sont requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    if (!['INITIAL', 'COMPLETION'].includes(campaignType)) {
      const error = 'campaignType doit être INITIAL ou COMPLETION';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    if (!supabaseServer) {
      const error = 'Supabase n\'est pas configuré';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 500 }
      );
    }

    // Récupérer les données de modération
    let moderationData: any = null;
    
    if (campaignType === 'INITIAL') {
      // Récupérer les votes pour la campagne initiale
      const { data: votesData, error: votesError } = await supabaseServer
        .from('moderation_votes')
        .select('vote_decision, staked_amount, vote_weight')
        .eq('campaign_id', campaignId)
        .is('completion_id', null);

      if (votesError) {
        consoleLogs.push(`⚠️ Erreur lors de la récupération des votes: ${votesError.message}`);
      } else {
        // Convertir approve/reject de la DB vers VALID/REFUSE pour la compatibilité
        const validVotes = votesData?.filter(v => v.vote_decision === 'approve').length || 0;
        const refuseVotes = votesData?.filter(v => v.vote_decision === 'reject').length || 0;
        const stakeYes = votesData?.filter(v => v.vote_decision === 'approve')
          .reduce((sum, v) => sum + (Number(v.staked_amount) || 0), 0) || 0;
        const stakeNo = votesData?.filter(v => v.vote_decision === 'reject')
          .reduce((sum, v) => sum + (Number(v.staked_amount) || 0), 0) || 0;

        moderationData = {
          validVotes,
          refuseVotes,
          totalVotes: validVotes + refuseVotes,
          stakeYes,
          stakeNo,
          totalStaked: stakeYes + stakeNo,
        };

        // Récupérer le mintPrice depuis la campagne
        const { data: campaignData, error: campaignError } = await supabaseServer
          .from('campaigns')
          .select('mint_price_usdc')
          .eq('id', campaignId)
          .single();

        moderationData.mintPrice = campaignData?.mint_price_usdc || 100;
      }
    } 
    else if (campaignType === 'COMPLETION' && completionId) {
      // Récupérer les votes pour la complétion
      const { data: votesData, error: votesError } = await supabaseServer
        .from('moderation_votes')
        .select('vote_decision, staked_amount, vote_weight')
        .eq('completion_id', completionId);

      if (votesError) {
        consoleLogs.push(`⚠️ Erreur lors de la récupération des votes: ${votesError.message}`);
      } else {
        // Convertir approve/reject de la DB vers VALID/REFUSE pour la compatibilité
        const validVotes = votesData?.filter(v => v.vote_decision === 'approve').length || 0;
        const refuseVotes = votesData?.filter(v => v.vote_decision === 'reject').length || 0;
        const stakeYes = votesData?.filter(v => v.vote_decision === 'approve')
          .reduce((sum, v) => sum + (Number(v.staked_amount) || 0), 0) || 0;
        const stakeNo = votesData?.filter(v => v.vote_decision === 'reject')
          .reduce((sum, v) => sum + (Number(v.staked_amount) || 0), 0) || 0;

        moderationData = {
          validVotes,
          refuseVotes,
          totalVotes: validVotes + refuseVotes,
          stakeYes,
          stakeNo,
          totalStaked: stakeYes + stakeNo,
        };

        // Pour les complétions, le mintPrice vient de la campagne originale
        const { data: completionData, error: completionError } = await supabaseServer
          .from('completions')
          .select('original_campaign_id')
          .eq('id', completionId)
          .single();

        if (!completionError && completionData?.original_campaign_id) {
          const { data: campaignData } = await supabaseServer
            .from('campaigns')
            .select('mint_price_usdc')
            .eq('id', completionData.original_campaign_id)
            .single();

          moderationData.mintPrice = campaignData?.mint_price_usdc || 0;
        } else {
          moderationData.mintPrice = 0;
        }
      }
    }

    if (!moderationData) {
      const error = 'Impossible de récupérer les données de modération';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 404 }
      );
    }

    consoleLogs.push(`📊 Données de modération:`, {
      validVotes: moderationData.validVotes,
      refuseVotes: moderationData.refuseVotes,
      totalVotes: moderationData.totalVotes,
      stakeYes: moderationData.stakeYes,
      stakeNo: moderationData.stakeNo,
      mintPrice: moderationData.mintPrice,
    });

    // Vérifier les conditions de validation
    const votesOk = moderationData.totalVotes >= MIN_REQUIRED_VOTES;
    const stakingOk = moderationData.totalStaked > moderationData.mintPrice;

    // Évaluer avec le moteur de modération
    const moderationResult = evaluateModeration(
      moderationData.validVotes,
      moderationData.refuseVotes,
      BigInt(Math.floor(moderationData.stakeYes * SCALE)),
      BigInt(Math.floor(moderationData.stakeNo * SCALE)),
      moderationData.mintPrice,
      Date.now(),
      Date.now() + 7 * 24 * 3600 * 1000,
      BigInt(SCALE)
    );

    const hybridScoreYes = Number(moderationResult.scoreYes) / SCALE;
    const hybridScoreNo = Number(moderationResult.scoreNo) / SCALE;
    const ratioOk = (hybridScoreYes >= (hybridScoreNo * 2.0)) || (hybridScoreNo >= (hybridScoreYes * 2.0));

    // Vérifier si toutes les conditions sont remplies
    const allConditionsMet = votesOk && stakingOk && ratioOk;
    const isValidated = allConditionsMet && moderationResult.status === ModerationStatus.VALIDATED;
    const isRefused = allConditionsMet && moderationResult.status === ModerationStatus.REJECTED;

    consoleLogs.push(`📊 État de validation:`, {
      votesOk,
      stakingOk,
      ratioOk,
      allConditionsMet,
      moderationStatus: moderationResult.status,
      isValidated,
      isRefused,
    });

    // Si aucune décision finale n'est atteinte, retourner
    if (!isValidated && !isRefused) {
      consoleLogs.push(`ℹ️ Aucune décision finale atteinte`);
      return NextResponse.json({
        success: true,
        decision: null,
        message: 'Aucune décision finale atteinte',
        consoleLogs,
      });
    }

    // Décision finale atteinte → Appeler l'API final-decision
    const finalDecision = isValidated ? 'VALIDATED' : 'REFUSED';
    consoleLogs.push(`✅ Décision finale: ${finalDecision}`);

    // Pour les complétions, vérifier si c'est dans le TOP 3
    let isTop3 = false;
    if (campaignType === 'COMPLETION' && isValidated && completionId) {
      // TODO: Implémenter la vérification du TOP 3
      // Pour l'instant, on suppose que toutes les complétions validées sont dans le TOP 3
      // Il faudra implémenter la logique de classement après modération complète
      isTop3 = true; // À ajuster selon la logique de TOP 3
      consoleLogs.push(`ℹ️ TOP 3: ${isTop3 ? 'OUI' : 'NON'} (à déterminer)`);
    }

    // Appeler l'API final-decision pour gérer les vidéos S3
    try {
      const finalDecisionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/s3/final-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          completionId,
          decision: finalDecision,
          campaignType,
          isTop3,
        }),
      });

      if (finalDecisionResponse.ok) {
        const finalDecisionResult = await finalDecisionResponse.json();
        consoleLogs.push(`✅ Vidéo S3 traitée avec succès`);
        if (finalDecisionResult.consoleLogs) {
          consoleLogs.push(...finalDecisionResult.consoleLogs);
        }
      } else {
        const errorData = await finalDecisionResponse.json();
        consoleLogs.push(`⚠️ Erreur lors du traitement de la vidéo S3: ${errorData.error}`);
      }
    } catch (error) {
      consoleLogs.push(`⚠️ Erreur lors de l'appel à final-decision: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }

    return NextResponse.json({
      success: true,
      decision: finalDecision,
      isTop3: campaignType === 'COMPLETION' ? isTop3 : undefined,
      consoleLogs,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    
    console.error('❌ [CHECK FINAL DECISION API] Erreur:', error);
    
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

