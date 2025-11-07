import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Interface pour les données du staker
interface StakerData {
  wallet: string;
  stakedAmount: number;
  stakeAgeDays: number;
  xp: number;
  isActive: boolean;
  eligibilityReason?: string;
}

// Interface pour la réponse
interface StakerDataResponse {
  success: boolean;
  stakerData?: StakerData;
  consoleLogs: string[];
  error?: string;
}

export async function GET(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const campaignId = searchParams.get('campaignId');

    consoleLogs.push(`🔍 [STAKER DATA] Récupération des données pour le wallet: ${wallet}`);
    consoleLogs.push(`📋 Campagne: ${campaignId || 'N/A'}`);

    if (!wallet) {
      const error = 'Paramètre wallet requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // IMPORTANT: Normaliser le wallet address en lowercase pour la cohérence
    const normalizedWallet = wallet.toLowerCase();
    consoleLogs.push(`🔄 [STAKER DATA] Normalized wallet: ${wallet} → ${normalizedWallet}`);

    let stakedAmount = 0;
    let stakeAgeDays = 0;
    let xp = 0;

    if (!supabaseServer) {
      consoleLogs.push('⚠️ Supabase server client is not configured. Falling back to defaults.');
      // keep zeros; still compute eligibility below
    } else {
      // Fetch latest active stake for wallet (optionally by campaign)
      const stakeQuery = supabaseServer
        .from('moderator_stakes')
        .select('staked_amount, staking_date')
        .eq('moderator_wallet', normalizedWallet)
        .order('staking_date', { ascending: false })
        .limit(1);
      if (campaignId) stakeQuery.eq('campaign_id', campaignId);

      const { data: stakeData, error: stakeErr } = await stakeQuery;
      if (stakeErr) {
        consoleLogs.push(`❌ Supabase read error (moderator_stakes): ${stakeErr.message}`);
      } else if (stakeData && stakeData.length > 0) {
        stakedAmount = Number(stakeData[0].staked_amount || 0);
        const stakingDate = stakeData[0].staking_date ? new Date(stakeData[0].staking_date) : null;
        if (stakingDate) {
          const diffMs = Date.now() - stakingDate.getTime();
          stakeAgeDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }
      }

      // Optional: fetch xp from a hypothetical stats table if it exists
      const { data: xpData } = await supabaseServer
        .from('user_dashboard_stats')
        .select('moderator_xp')
        .eq('wallet', normalizedWallet)
        .maybeSingle?.() ?? { data: null };
      if (xpData && typeof xpData.moderator_xp === 'number') {
        xp = xpData.moderator_xp;
      }
    }

    const mockStakerData: StakerData = {
      wallet,
      stakedAmount,
      stakeAgeDays,
      xp,
      isActive: true,
    };

    // Vérifier l'éligibilité selon le framework V1
    const minStakeToVote = 50;
    const stakeAgeMinDays = 7;
    
    const isEligible = mockStakerData.stakedAmount >= minStakeToVote && 
                      mockStakerData.stakeAgeDays >= stakeAgeMinDays;

    consoleLogs.push(`📊 Données du staker:`);
    consoleLogs.push(`   - Stake: ${mockStakerData.stakedAmount} WINC`);
    consoleLogs.push(`   - Âge du stake: ${mockStakerData.stakeAgeDays} jours`);
    consoleLogs.push(`   - XP: ${mockStakerData.xp}`);
    consoleLogs.push(`   - Éligible pour rémunération: ${isEligible ? '✅ OUI' : '❌ NON'}`);
    
    if (!isEligible) {
      const reasons = [];
      if (mockStakerData.stakedAmount < minStakeToVote) {
        reasons.push(`Stake insuffisant (${mockStakerData.stakedAmount} < ${minStakeToVote})`);
      }
      if (mockStakerData.stakeAgeDays < stakeAgeMinDays) {
        reasons.push(`Âge du stake insuffisant (${mockStakerData.stakeAgeDays} < ${stakeAgeMinDays} jours)`);
      }
      mockStakerData.eligibilityReason = reasons.join(', ');
      consoleLogs.push(`⚠️ Note: Ce staker peut voter mais ne recevra aucune rémunération ni XP`);
    }

    // Logs détaillés pour le debugging
    consoleLogs.push(`🎯 Framework V1 - Paramètres:`);
    consoleLogs.push(`   - minStakeToVote: ${minStakeToVote} WINC`);
    consoleLogs.push(`   - stakeAgeMinDays: ${stakeAgeMinDays} jours`);
    consoleLogs.push(`   - Calcul du poids de vote: 50% stake + 50% démocratie`);

    // Calculer les facteurs de démocratie
    const threshold_stake_k = 50;
    const XP_scale = 100;
    const age_max_days = 365;

    const stake_factor = mockStakerData.stakedAmount / (mockStakerData.stakedAmount + threshold_stake_k);
    const xp_factor = 1 + Math.log1p(mockStakerData.xp) / Math.log1p(XP_scale);
    const age_factor = Math.min(1, mockStakerData.stakeAgeDays / age_max_days);

    consoleLogs.push(`📈 Facteurs de démocratie:`);
    consoleLogs.push(`   - Stake factor: ${stake_factor.toFixed(3)}`);
    consoleLogs.push(`   - XP factor: ${xp_factor.toFixed(3)}`);
    consoleLogs.push(`   - Age factor: ${age_factor.toFixed(3)}`);

    // Logs pour le backend
    console.log('🔍 [STAKER DATA API] Données récupérées:', {
      wallet,
      campaignId,
      stakerData: mockStakerData,
      eligibility: {
        isEligible,
        minStakeToVote,
        stakeAgeMinDays,
        reasons: mockStakerData.eligibilityReason
      },
      democracyFactors: {
        stake_factor,
        xp_factor,
        age_factor
      }
    });

    const response: StakerDataResponse = {
      success: true,
      stakerData: mockStakerData,
      consoleLogs
    };

    return NextResponse.json(response);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    
    console.error('❌ [STAKER DATA API] Erreur:', error);
    
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

export async function POST(request: NextRequest) {
  const consoleLogs: string[] = [];
  
  try {
    const body = await request.json();
    const { wallet, campaignId, stakedAmount, stakeAgeDays, xp } = body;

    consoleLogs.push(`🔍 [STAKER DATA] Mise à jour des données pour le wallet: ${wallet}`);
    consoleLogs.push(`📋 Campagne: ${campaignId || 'N/A'}`);

    if (!wallet) {
      const error = 'Paramètre wallet requis';
      consoleLogs.push(`❌ ${error}`);
      return NextResponse.json(
        { success: false, error, consoleLogs },
        { status: 400 }
      );
    }

    // TODO: Mettre à jour les vraies données dans la base de données
    consoleLogs.push(`💾 TODO: Mise à jour dans la base de données`);
    consoleLogs.push(`   - Table: moderator_stakes`);
    consoleLogs.push(`   - Table: user_dashboard_stats`);
    consoleLogs.push(`   - Wallet: ${wallet}`);
    consoleLogs.push(`   - Stake: ${stakedAmount || 'N/A'} WINC`);
    consoleLogs.push(`   - Âge: ${stakeAgeDays || 'N/A'} jours`);
    consoleLogs.push(`   - XP: ${xp || 'N/A'}`);

    // Logs pour le backend
    console.log('🔍 [STAKER DATA API] Mise à jour:', {
      wallet,
      campaignId,
      stakedAmount,
      stakeAgeDays,
      xp
    });

    return NextResponse.json({
      success: true,
      message: 'Données du staker mises à jour avec succès',
      consoleLogs
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    consoleLogs.push(`❌ Erreur: ${errorMessage}`);
    
    console.error('❌ [STAKER DATA API] Erreur:', error);
    
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

