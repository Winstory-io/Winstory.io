import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Copie de la fonction simulateCampaign depuis CompletionRateModal.tsx
function simulateCampaign(P: number, N: number, CR: number = N) {
  const baseDuration = 7;
  const complexityFactor = Math.log10(Math.max(1, P * N / 100));
  const CAMPAIGN_DURATION_DAYS = Math.min(30, Math.max(7, Math.round(baseDuration + complexityFactor * 7)));
  
  const DURATION_DISCOUNT = CAMPAIGN_DURATION_DAYS <= 7 ? 0.88 : 
                           CAMPAIGN_DURATION_DAYS <= 14 ? 0.94 : 
                           CAMPAIGN_DURATION_DAYS <= 21 ? 0.97 : 1.0;

  const ECONOMIC_CONSTANTS = {
    BASE_FEE: 0.5,
    SCALING_FACTOR: 0.002,
    RISK_ADJUSTMENT: 2
  };

  const sqrtPN = Math.sqrt(P * N);
  const mintRaw = (ECONOMIC_CONSTANTS.BASE_FEE * DURATION_DISCOUNT) +
                  (P * N * ECONOMIC_CONSTANTS.SCALING_FACTOR * DURATION_DISCOUNT) +
                  (sqrtPN * ECONOMIC_CONSTANTS.RISK_ADJUSTMENT * DURATION_DISCOUNT);

  const tauxCompletion = Math.max(0, Math.min(1, CR / N));
  const completionPercentage = tauxCompletion * 100;

  const mint = Math.round(mintRaw * 100) / 100;
  const totalValue = (P * CR) + mint;

  const BASE_TOP3 = 0.56;
  const BASE_CREATOR = 0.203;
  const BASE_PLATFORM = 0.0525;
  const BASE_MODERATORS = 0.1845;

  const boostForWinners = 0.15 * (1 - tauxCompletion);
  let top3Share = BASE_TOP3 + boostForWinners;

  let platformShare = Math.max(0.0225, BASE_PLATFORM - 0.015 * (1 - tauxCompletion));
  let moderatorsShare = Math.max(0.16, BASE_MODERATORS - 0.015 * (1 - tauxCompletion));

  let creatorShare = 1 - (top3Share + platformShare + moderatorsShare);
  if (creatorShare < 0.12) creatorShare = 0.12;

  const shareSum = top3Share + platformShare + moderatorsShare + creatorShare;
  top3Share /= shareSum;
  platformShare /= shareSum;
  moderatorsShare /= shareSum;
  creatorShare /= shareSum;

  let multiplicateurGain = 0;
  let multiplicateurXP = 1;

  const isMinimumCompletionsReached = CR >= 5;
  
  if (isMinimumCompletionsReached) {
    if (completionPercentage >= 100) multiplicateurXP = 6;
    else if (completionPercentage >= 95) multiplicateurXP = 5;
    else if (completionPercentage >= 90) multiplicateurXP = 4;
    else if (completionPercentage >= 80) multiplicateurXP = 3;
    else if (completionPercentage >= 60) multiplicateurXP = 2;
    else multiplicateurXP = 1;

    multiplicateurGain = Math.max(0, Math.min(2, (completionPercentage / 100) * 2));
  } else {
    multiplicateurGain = 0;
    multiplicateurXP = 1;
  }

  const rawTop3Pool = totalValue * top3Share;
  const rawCreatorPool = totalValue * creatorShare;
  let platform = Math.round(totalValue * platformShare * 100) / 100;
  let moderators = Math.round(totalValue * moderatorsShare * 100) / 100;

  const creatorGainWithMultiplier = rawCreatorPool * multiplicateurGain;

  const minCap = 1.2;
  const maxCap = 2.2;
  let creatorCapFactor: number;
  if (completionPercentage <= 60) creatorCapFactor = minCap;
  else if (completionPercentage >= 100) creatorCapFactor = maxCap;
  else {
    const ratio = (completionPercentage - 60) / 40;
    creatorCapFactor = minCap + (maxCap - minCap) * ratio;
  }
  const creatorCap = mint * creatorCapFactor;

  let creatorGain = Math.min(creatorGainWithMultiplier, creatorCap);
  let creatorNetGain = creatorGain - mint;

  let top1 = rawTop3Pool * 0.5;
  let top2 = rawTop3Pool * 0.3;
  let top3 = rawTop3Pool * 0.2;

  if (isMinimumCompletionsReached) {
    const floor1 = 2.5 * P;
    const floor2 = 2.0 * P;
    const floor3 = 1.5 * P;

    const need1 = Math.max(0, floor1 - top1);
    const need2 = Math.max(0, floor2 - top2);
    const need3 = Math.max(0, floor3 - top3);
    const totalNeeds = need1 + need2 + need3;

    if (totalNeeds > 0) {
      const poolAvailable = moderators + platform;
      const creatorSurplus = Math.max(0, creatorGainWithMultiplier - creatorGain);
      const available = poolAvailable + creatorSurplus;

      if (available > 0) {
        const takeRatio = Math.min(1, totalNeeds / available);
        const takeFromModerators = Math.round(moderators * takeRatio * 100) / 100;
        const takeFromPlatform = Math.round(platform * takeRatio * 100) / 100;
        const takeFromCreatorSurplus = Math.round(creatorSurplus * takeRatio * 100) / 100;

        moderators = Math.max(0, Math.round((moderators - takeFromModerators) * 100) / 100);
        platform = Math.max(0, Math.round((platform - takeFromPlatform) * 100) / 100);

        const recovered = takeFromModerators + takeFromPlatform + takeFromCreatorSurplus;
        const ratio1 = totalNeeds > 0 ? (need1 / totalNeeds) : 0;
        const ratio2 = totalNeeds > 0 ? (need2 / totalNeeds) : 0;
        const ratio3 = totalNeeds > 0 ? (need3 / totalNeeds) : 0;

        top1 += recovered * ratio1;
        top2 += recovered * ratio2;
        top3 += recovered * ratio3;
      }
    }
  }

  let top1Final = top1;
  let top2Final = top2;
  let top3Final = top3;
  let isRefundTop1 = false;
  let isRefundTop2 = false;
  let isRefundTop3 = false;

  if (!isMinimumCompletionsReached) {
    top1Final = P;
    top2Final = P;
    top3Final = P;
    isRefundTop1 = true;
    isRefundTop2 = true;
    isRefundTop3 = true;
    
    creatorGain = 0;
    creatorNetGain = -mint;
    
    const baseModeratorGain = mint * 0.15;
    const maxModeratorGainBeforeNormal = mint * 0.35;
    const completionRatio = CR / 4;
    const growthBonus = (maxModeratorGainBeforeNormal - baseModeratorGain) * completionRatio;
    
    moderators = Math.round((baseModeratorGain + growthBonus) * 100) / 100;
    platform = Math.round((mint - moderators) * 100) / 100;
  }

  const result = {
    mint: Math.round(mint * 100) / 100,
    poolTotal: Math.round(totalValue * 100) / 100,
    creatorGain: Math.round(creatorGain * 100) / 100,
    creatorNetGain: Math.round(creatorNetGain * 100) / 100,
    isCreatorProfitable: creatorGain >= mint,
    isMinimumCompletionsReached,
    creatorXP: 200 * multiplicateurXP,
    top1: Math.round(top1Final * 100) / 100,
    top2: Math.round(top2Final * 100) / 100,
    top3: Math.round(top3Final * 100) / 100,
    platform: Math.round(platform * 100) / 100,
    moderators: Math.round(moderators * 100) / 100,
    tauxCompletion: Math.round(tauxCompletion * 100) / 100,
    multiplicateurGain,
    multiplicateurXP,
    isRefundTop1,
    isRefundTop2,
    isRefundTop3,
    unitPrice: P,
    campaignDuration: CAMPAIGN_DURATION_DAYS
  };

  const distributed = result.creatorGain + result.top1 + result.top2 + result.top3 + result.platform + result.moderators;
  if (Math.abs(distributed - result.poolTotal) > 0.01 && result.poolTotal > 0) {
    const adj = result.poolTotal / distributed;
    result.top1 = Math.round(result.top1 * adj * 100) / 100;
    result.top2 = Math.round(result.top2 * adj * 100) / 100;
    result.top3 = Math.round(result.top3 * adj * 100) / 100;
    result.platform = Math.round(result.platform * adj * 100) / 100;
    result.moderators = Math.round(result.moderators * adj * 100) / 100;
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'campaignId is required' },
        { status: 400 }
      );
    }

    console.log('🔍 [ECONOMIC DATA API] Fetching economic data for campaign:', campaignId);

    // Récupérer les données de pricing config
    const { data: pricingConfig, error: pricingError } = await supabase
      .from('campaign_pricing_configs')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (pricingError && pricingError.code !== 'PGRST116') {
      console.error('❌ [ECONOMIC DATA API] Error fetching pricing config:', pricingError);
      throw new Error(`Failed to fetch pricing config: ${pricingError.message}`);
    }

    if (!pricingConfig) {
      return NextResponse.json(
        { success: false, error: 'Pricing config not found for this campaign' },
        { status: 404 }
      );
    }

    // Pour les campagnes individuelles, on a besoin de unit_value (wincValue) et max_completions
    const P = pricingConfig.unit_value || pricingConfig.base_mint || 0;
    const N = pricingConfig.max_completions || 0;

    if (!P || !N || N < 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid pricing data: wincValue and maxCompletions (>= 5) are required',
          data: { P, N }
        },
        { status: 400 }
      );
    }

    // Calculer avec le taux de completion à 100% (scénario idéal)
    const economicData = simulateCampaign(P, N, N);

    console.log('✅ [ECONOMIC DATA API] Economic data calculated:', {
      mint: economicData.mint,
      poolTotal: economicData.poolTotal,
      top1: economicData.top1,
      top2: economicData.top2,
      top3: economicData.top3
    });

    return NextResponse.json({
      success: true,
      data: {
        ...economicData,
        wincValue: P,
        maxCompletions: N
      }
    });

  } catch (error) {
    console.error('❌ [ECONOMIC DATA API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch economic data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

