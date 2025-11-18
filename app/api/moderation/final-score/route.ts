import { NextRequest, NextResponse } from 'next/server';

interface FinalScoreCalculationRequest {
  campaignId: string;
  completionId: string;
  communityScore: number;
  communityDecision: 'VALID' | 'REFUSE';
  superModeratorScore?: number;
  superModeratorDecision?: 'VALID' | 'REFUSE';
}

interface FinalScoreCalculationResponse {
  success: boolean;
  finalScore: number;
  finalDecision: 'VALID' | 'REFUSE';
  calculationBreakdown: {
    communityScore: number;
    communityWeight: number;
    superModeratorScore?: number;
    superModeratorWeight?: number;
    weightedScore?: number;
  };
  consoleLogs: string[];
  error?: string;
}

export async function POST(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const body = await request.json();
    const {
      campaignId,
      completionId,
      communityScore,
      communityDecision,
      superModeratorScore,
      superModeratorDecision
    }: FinalScoreCalculationRequest = body;

    consoleLogs.push(`🔍 [FINAL SCORE] Calcul du score final pour la campagne ${campaignId}`);
    consoleLogs.push(`📊 Complétion: ${completionId}`);
    consoleLogs.push(`🏘️ Score communautaire: ${communityScore}/100`);
    consoleLogs.push(`🏘️ Décision communautaire: ${communityDecision}`);

    // Validation des données requises
    if (!campaignId || !completionId || communityScore === undefined || !communityDecision) {
      const error = 'Données manquantes: campaignId, completionId, communityScore et communityDecision sont requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Validation du score communautaire
    if (communityScore < 0 || communityScore > 100) {
      const error = 'communityScore doit être entre 0 et 100';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // Calculer le score et la décision finale
    const result = calculateFinalScoreAndDecision(
      communityScore,
      communityDecision,
      superModeratorScore,
      superModeratorDecision,
      consoleLogs
    );

    consoleLogs.push(`🎯 Score final calculé: ${result.finalScore}/100`);
    consoleLogs.push(`🎯 Décision finale: ${result.finalDecision}`);

    return NextResponse.json({
      success: true,
      finalScore: result.finalScore,
      finalDecision: result.finalDecision,
      calculationBreakdown: result.breakdown,
      consoleLogs
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    console.error('❌ [FINAL SCORE] Erreur:', error);
    
    return NextResponse.json(
      { success: false, error: errorMessage, consoleLogs },
      { status: 500 }
    );
  }
}

// Fonction pour calculer le score et la décision finale
function calculateFinalScoreAndDecision(
  communityScore: number,
  communityDecision: 'VALID' | 'REFUSE',
  superModeratorScore?: number,
  superModeratorDecision?: 'VALID' | 'REFUSE',
  consoleLogs: string[] = []
) {
  let finalScore: number;
  let finalDecision: 'VALID' | 'REFUSE';
  let breakdown: any;

  if (superModeratorScore !== undefined && superModeratorDecision) {
    // Cas avec Super-Modérateur : appliquer la pondération 51/49
    consoleLogs.push(`👑 Super-Modérateur actif: Score ${superModeratorScore}/100, Décision ${superModeratorDecision}`);
    
    // Calculer le score pondéré
    const communityWeight = 0.49;
    const superModeratorWeight = 0.51;
    const weightedScore = (communityScore * communityWeight) + (superModeratorScore * superModeratorWeight);
    
    finalScore = Math.round(weightedScore * 100) / 100; // Arrondir à 2 décimales
    
    // La décision finale est celle du Super-Modérateur (pouvoir de basculement)
    finalDecision = superModeratorDecision;
    
    if (superModeratorDecision !== communityDecision) {
      consoleLogs.push(`🔄 Super-Modérateur bascule la décision de ${communityDecision} vers ${superModeratorDecision}`);
    } else {
      consoleLogs.push(`✅ Super-Modérateur confirme la décision communautaire: ${communityDecision}`);
    }
    
    breakdown = {
      communityScore,
      communityWeight,
      superModeratorScore,
      superModeratorWeight,
      weightedScore: finalScore
    };
    
  } else {
    // Cas sans Super-Modérateur : utiliser uniquement les données communautaires
    consoleLogs.push(`🏘️ Pas de Super-Modérateur: Utilisation du score communautaire uniquement`);
    
    finalScore = communityScore;
    finalDecision = communityDecision;
    
    breakdown = {
      communityScore,
      communityWeight: 1.0,
      superModeratorScore: undefined,
      superModeratorWeight: undefined,
      weightedScore: undefined
    };
  }

  return {
    finalScore,
    finalDecision,
    breakdown
  };
}

// Fonction pour calculer le score final selon la formule Super-Modérateur
function calculateSuperModeratorFinalScore(
  communityScore: number,
  superModeratorScore: number
): number {
  // Formule: (Communauté × 49%) + (Super-Modérateur × 51%)
  const finalScore = (communityScore * 0.49) + (superModeratorScore * 0.51);
  return Math.round(finalScore * 100) / 100; // Arrondir à 2 décimales
}

// Fonction pour déterminer la décision finale avec pouvoir de basculement
function calculateSuperModeratorFinalDecision(
  communityDecision: 'VALID' | 'REFUSE',
  superModeratorDecision: 'VALID' | 'REFUSE'
): 'VALID' | 'REFUSE' {
  // Le Super-Modérateur peut basculer la décision communautaire
  return superModeratorDecision;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API pour le calcul du score final avec pondération Super-Modérateur',
    usage: {
      method: 'POST',
      endpoint: '/api/moderation/final-score',
      description: 'Calcule le score final et la décision finale selon la logique Super-Modérateur'
    },
    requiredFields: {
      campaignId: 'string - ID de la campagne',
      completionId: 'string - ID de la complétion',
      communityScore: 'number (0-100) - Score moyen de la communauté',
      communityDecision: 'VALID | REFUSE - Décision de la communauté'
    },
    optionalFields: {
      superModeratorScore: 'number (1-100) - Score du Super-Modérateur',
      superModeratorDecision: 'VALID | REFUSE - Décision du Super-Modérateur'
    },
    calculationLogic: {
      withSuperModerator: 'Score final = (Communauté × 49%) + (Super-Modérateur × 51%)',
      withoutSuperModerator: 'Score final = Score communautaire',
      decisionOverride: 'Le Super-Modérateur peut basculer la décision communautaire'
    },
    response: {
      finalScore: 'number - Score final calculé',
      finalDecision: 'VALID | REFUSE - Décision finale',
      calculationBreakdown: 'object - Détails du calcul',
      consoleLogs: 'string[] - Logs de débogage'
    },
    example: {
      request: {
        campaignId: 'campaign_123',
        completionId: 'completion_456',
        communityScore: 78.4,
        communityDecision: 'VALID',
        superModeratorScore: 91,
        superModeratorDecision: 'VALID'
      },
      response: {
        success: true,
        finalScore: 84.63,
        finalDecision: 'VALID',
        calculationBreakdown: {
          communityScore: 78.4,
          communityWeight: 0.49,
          superModeratorScore: 91,
          superModeratorWeight: 0.51,
          weightedScore: 84.63
        }
      }
    }
  });
}
