import { NextRequest, NextResponse } from 'next/server';
import { 
  evaluateModeration, 
  computePayoutsAndXP, 
  ContentType, 
  ModerationStatus,
  validateModerationInputs,
  handleVoteWindowClosure,
  AutoResolvePolicy
} from '@/lib/moderation-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      votesYes,
      votesNo,
      stakeYes,
      stakeNo,
      mintPriceUSDC,
      contentType,
      priceUSDC,
      participantsActive = [],
      participantsPassive = [],
      wincPerUSDC,
      currentTimestamp,
      voteWindowEnd,
      autoResolvePolicy = 'escalate'
    } = body;

    // Validation des entrées
    const validation = validateModerationInputs(
      votesYes,
      votesNo,
      BigInt(stakeYes || 0),
      BigInt(stakeNo || 0),
      mintPriceUSDC
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Évaluation de la modération
    const moderationResult = evaluateModeration(
      votesYes,
      votesNo,
      BigInt(stakeYes || 0),
      BigInt(stakeNo || 0),
      mintPriceUSDC,
      currentTimestamp || Date.now(),
      voteWindowEnd || (Date.now() + 7 * 24 * 3600 * 1000),
      BigInt(wincPerUSDC || 1e18)
    );

    // Si la fenêtre de vote est fermée et toujours EN_COURS, appliquer la politique
    if (currentTimestamp && voteWindowEnd && currentTimestamp >= voteWindowEnd) {
      const finalResult = handleVoteWindowClosure(
        moderationResult,
        autoResolvePolicy as AutoResolvePolicy
      );
      
      return NextResponse.json({
        success: true,
        moderationResult: finalResult,
        timestamp: new Date().toISOString()
      });
    }

    // Si décision finale, calculer les paiements
    let payoutResult = null;
    if (moderationResult.status === ModerationStatus.VALIDATED || 
        moderationResult.status === ModerationStatus.REJECTED) {
      
      payoutResult = computePayoutsAndXP(
        contentType as ContentType,
        priceUSDC || 0,
        votesYes,
        votesNo,
        BigInt(stakeYes || 0),
        BigInt(stakeNo || 0),
        participantsActive,
        participantsPassive,
        BigInt(wincPerUSDC || 1e18)
      );
    }

    return NextResponse.json({
      success: true,
      moderationResult,
      payoutResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in hybrid evaluation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');

  if (!campaignId) {
    return NextResponse.json(
      { error: 'Campaign ID is required' },
      { status: 400 }
    );
  }

  try {
    // TODO: Récupérer les données de la campagne depuis la base de données
    // Pour l'instant, retourner un exemple de structure
    return NextResponse.json({
      success: true,
      campaignId,
      message: 'Hybrid evaluation endpoint - use POST for evaluation',
      example: {
        votesYes: 15,
        votesNo: 7,
        stakeYes: '48392111750000000000000000', // 48,392,111.75 WINC
        stakeNo: '210000000000000000', // 0.21 WINC
        mintPriceUSDC: 1000,
        contentType: 'INITIAL_B2C',
        priceUSDC: 1000
      }
    });

  } catch (error) {
    console.error('Error fetching campaign data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign data' },
      { status: 500 }
    );
  }
}
