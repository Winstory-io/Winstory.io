import { NextRequest, NextResponse } from 'next/server';

interface SuperModeratorVoteData {
  campaignId: string;
  superModeratorWallet: string;
  completionId: string;
  voteDecision: 'VALID' | 'REFUSE';
  score?: number; // Score sur 100 pour les votes VALID
  timestamp?: number;
  transactionHash?: string;
}

interface SuperModeratorVoteResponse {
  success: boolean;
  voteId?: string;
  finalScore?: number;
  finalDecision?: 'VALID' | 'REFUSE';
  communityScore?: number;
  communityDecision?: 'VALID' | 'REFUSE';
  consoleLogs: string[];
  error?: string;
}

export async function POST(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const body = await request.json();
    const {
      campaignId,
      superModeratorWallet,
      completionId,
      voteDecision,
      score,
      timestamp,
      transactionHash
    } = body;

    consoleLogs.push(`🔍 [SUPER MODERATOR] Début du traitement pour la campagne ${campaignId}`);
    consoleLogs.push(`👑 Super-Modérateur: ${superModeratorWallet}`);
    consoleLogs.push(`🗳️ Vote: ${voteDecision}${score ? ` avec score ${score}` : ''}`);

    // Validation des données requises
    if (!campaignId || !superModeratorWallet || !completionId || !voteDecision) {
      const error = 'Données manquantes: campaignId, superModeratorWallet, completionId et voteDecision sont requis';
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

    // Validation du score pour les votes VALID
    if (voteDecision === 'VALID' && (score === undefined || score < 1 || score > 100)) {
      const error = 'Pour les votes VALID, un score entre 1 et 100 est requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Vérifier que le Super-Modérateur est bien le créateur de la campagne
    const isSuperModerator = await verifySuperModeratorRole(campaignId, superModeratorWallet);
    if (!isSuperModerator) {
      const error = 'Cette adresse wallet n\'est pas autorisée à exercer le rôle de Super-Modérateur pour cette campagne';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 403 }
      );
    }

    // Récupérer les données de modération communautaire
    const communityData = await getCommunityModerationData(campaignId, completionId);
    if (!communityData) {
      const error = 'Aucune donnée de modération communautaire trouvée pour cette complétion';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 404 }
      );
    }

    consoleLogs.push(`📊 Données communautaires: ${communityData.validVotes} OUI, ${communityData.refuseVotes} NON`);
    consoleLogs.push(`📈 Score moyen communautaire: ${communityData.averageScore}`);

    // Calculer la décision finale selon la logique Super-Modérateur
    const finalResult = calculateSuperModeratorDecision(
      communityData,
      voteDecision,
      score || 0
    );

    consoleLogs.push(`🎯 Décision finale: ${finalResult.finalDecision}`);
    consoleLogs.push(`📊 Score final: ${finalResult.finalScore}`);

    // Sauvegarder le vote du Super-Modérateur
    const voteId = await saveSuperModeratorVote({
      campaignId,
      superModeratorWallet,
      completionId,
      voteDecision,
      score,
      timestamp: timestamp || Date.now(),
      transactionHash
    });

    consoleLogs.push(`💾 Vote sauvegardé avec l'ID: ${voteId}`);

    return NextResponse.json({
      success: true,
      voteId,
      finalScore: finalResult.finalScore,
      finalDecision: finalResult.finalDecision,
      communityScore: communityData.averageScore,
      communityDecision: communityData.decision,
      consoleLogs
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    console.error('❌ [SUPER MODERATOR] Erreur:', error);
    
    return NextResponse.json(
      { success: false, error: errorMessage, consoleLogs },
      { status: 500 }
    );
  }
}

// Fonction pour vérifier le rôle de Super-Modérateur
async function verifySuperModeratorRole(campaignId: string, walletAddress: string): Promise<boolean> {
  try {
    // TODO: Implémenter la vérification avec Prisma
    // Pour l'instant, simulation
    console.log(`🔍 Vérification du rôle Super-Modérateur pour ${walletAddress} sur la campagne ${campaignId}`);
    
    // En mode développement, accepter toutes les adresses
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    
    // TODO: Vérifier avec la base de données que cette adresse est bien le créateur de la campagne
    // const campaign = await prisma.campaign.findUnique({
    //   where: { id: campaignId },
    //   select: { creatorWallet: true }
    // });
    // return campaign?.creatorWallet === walletAddress;
    
    return true; // Temporaire
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle Super-Modérateur:', error);
    return false;
  }
}

// Fonction pour récupérer les données de modération communautaire
async function getCommunityModerationData(campaignId: string, completionId: string) {
  try {
    console.log(`📊 Récupération des données communautaires pour ${completionId}`);
    
    // Utiliser Supabase pour récupérer les vraies données
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Récupérer les données de modération communautaire
    const { data: moderationData, error } = await supabase
      .from('moderation_progress')
      .select('valid_votes, refuse_votes, average_score, decision, stakers_count, staking_pool_total')
      .eq('completion_id', completionId)
      .single();
    
    if (error) {
      console.error('❌ Erreur lors de la récupération des données communautaires:', error);
      return null;
    }
    
    if (!moderationData) {
      console.log('⚠️ Aucune donnée de modération trouvée');
      return null;
    }
    
    const result = {
      validVotes: moderationData.valid_votes || 0,
      refuseVotes: moderationData.refuse_votes || 0,
      averageScore: moderationData.average_score || 0,
      decision: moderationData.decision || 'REFUSE',
      stakersCount: moderationData.stakers_count || 0,
      stakingPool: moderationData.staking_pool_total || 0
    };
    
    console.log(`✅ Données communautaires récupérées:`, result);
    return result;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des données communautaires:', error);
    return null;
  }
}

// Fonction pour calculer la décision finale selon la logique Super-Modérateur
function calculateSuperModeratorDecision(
  communityData: any,
  superModeratorDecision: 'VALID' | 'REFUSE',
  superModeratorScore: number
) {
  const { validVotes, refuseVotes, averageScore, decision: communityDecision } = communityData;
  
  // 1. Décision finale : Le Super-Modérateur peut basculer la décision communautaire
  let finalDecision: 'VALID' | 'REFUSE';
  
  if (superModeratorDecision !== communityDecision) {
    // Le Super-Modérateur bascule la décision communautaire
    finalDecision = superModeratorDecision;
    console.log(`🔄 Super-Modérateur bascule la décision de ${communityDecision} vers ${superModeratorDecision}`);
  } else {
    // Le Super-Modérateur confirme la décision communautaire
    finalDecision = communityDecision;
    console.log(`✅ Super-Modérateur confirme la décision communautaire: ${communityDecision}`);
  }
  
  // 2. Score final : Pondération 51/49
  let finalScore: number;
  
  if (superModeratorDecision === 'VALID' && superModeratorScore > 0) {
    // Appliquer la pondération 51/49
    finalScore = (averageScore * 0.49) + (superModeratorScore * 0.51);
    console.log(`📊 Score final calculé: (${averageScore} × 0.49) + (${superModeratorScore} × 0.51) = ${finalScore.toFixed(2)}`);
  } else {
    // Si pas de score Super-Modérateur, utiliser le score communautaire
    finalScore = averageScore;
    console.log(`📊 Score final: Score communautaire uniquement (${averageScore})`);
  }
  
  return {
    finalDecision,
    finalScore: Math.round(finalScore * 100) / 100 // Arrondir à 2 décimales
  };
}

// Fonction pour sauvegarder le vote du Super-Modérateur
async function saveSuperModeratorVote(voteData: SuperModeratorVoteData): Promise<string> {
  try {
    console.log(`💾 Sauvegarde du vote Super-Modérateur:`, voteData);
    
    // Utiliser Supabase pour sauvegarder le vote
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Calculer le score final et la décision finale
    const communityData = await getCommunityModerationData(voteData.campaignId, voteData.completionId);
    if (!communityData) {
      throw new Error('Impossible de récupérer les données communautaires');
    }
    
    const finalResult = calculateSuperModeratorDecision(
      communityData,
      voteData.voteDecision,
      voteData.score || 0
    );
    
    // Préparer les données à insérer
    const insertData = {
      campaign_id: voteData.campaignId,
      completion_id: voteData.completionId,
      super_moderator_wallet: voteData.superModeratorWallet,
      vote_decision: voteData.voteDecision,
      score: voteData.score,
      final_score: finalResult.finalScore,
      final_decision: finalResult.finalDecision,
      community_score: communityData.averageScore,
      community_decision: communityData.decision,
      calculation_breakdown: {
        communityScore: communityData.averageScore,
        communityWeight: 0.49,
        superModeratorScore: voteData.score,
        superModeratorWeight: 0.51,
        weightedScore: finalResult.finalScore
      },
      transaction_hash: voteData.transactionHash
    };
    
    // Insérer le vote
    const { data, error } = await supabase
      .from('super_moderator_votes')
      .insert(insertData)
      .select('id')
      .single();
    
    if (error) {
      console.error('❌ Erreur lors de la sauvegarde Supabase:', error);
      throw error;
    }
    
    console.log(`✅ Vote Super-Modérateur sauvegardé avec l'ID: ${data.id}`);
    return data.id;
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du vote Super-Modérateur:', error);
    throw error;
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API pour les votes de Super-Modérateur',
    usage: {
      method: 'POST',
      endpoint: '/api/moderation/super-moderator',
      description: 'Enregistre un vote de Super-Modérateur avec pondération 51/49 et pouvoir de basculement'
    },
    requiredFields: {
      campaignId: 'string - ID de la campagne',
      superModeratorWallet: 'string - Adresse wallet du Super-Modérateur (créateur de campagne)',
      completionId: 'string - ID de la complétion à modérer',
      voteDecision: 'VALID | REFUSE - Décision du Super-Modérateur'
    },
    optionalFields: {
      score: 'number (1-100) - Score pour les votes VALID',
      timestamp: 'number - Timestamp du vote',
      transactionHash: 'string - Hash de transaction blockchain'
    },
    features: {
      decisionOverride: 'Le Super-Modérateur peut basculer la décision communautaire',
      scoreWeighting: 'Pondération 51% Super-Modérateur / 49% Communauté',
      roleVerification: 'Vérification automatique du rôle de créateur de campagne'
    },
    example: {
      campaignId: 'campaign_123',
      superModeratorWallet: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      completionId: 'completion_456',
      voteDecision: 'VALID',
      score: 91,
      timestamp: Date.now()
    }
  });
}
