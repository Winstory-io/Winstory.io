import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Wallet address is required' 
        },
        { status: 400 }
      );
    }

    console.log('=== FETCHING USER STATS ===');
    console.log('Wallet Address:', walletAddress);

    // 1. Compter les campagnes créées
    const { count: createdCount, error: createdError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('original_creator_wallet', walletAddress);

    if (createdError) {
      console.error('Error counting created campaigns:', createdError);
      throw new Error(`Failed to count created campaigns: ${createdError.message}`);
    }

    // 2. Compter les campagnes complétées
    const { count: completedCount, error: completedError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('completer_wallet', walletAddress);

    if (completedError) {
      console.error('Error counting completed campaigns:', completedError);
      throw new Error(`Failed to count completed campaigns: ${completedError.message}`);
    }

    // 3. Compter les modérations
    const { count: moderatedCount, error: moderatedError } = await supabase
      .from('moderation_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('moderator_wallet', walletAddress);

    if (moderatedError) {
      console.error('Error counting moderated campaigns:', moderatedError);
      throw new Error(`Failed to count moderated campaigns: ${moderatedError.message}`);
    }

    // 4. Calculer le total WINC gagné
    const { data: wincRewards, error: wincError } = await supabase
      .from('winc_rewards')
      .select('winc_amount')
      .eq('user_wallet', walletAddress);

    if (wincError) {
      console.error('Error fetching WINC rewards:', wincError);
      throw new Error(`Failed to fetch WINC rewards: ${wincError.message}`);
    }

    const totalWinc = wincRewards?.reduce((sum, reward) => sum + parseFloat(reward.winc_amount || '0'), 0) || 0;

    // 5. Calculer le total XP
    const { data: xpData, error: xpError } = await supabase
      .from('user_xp_progression')
      .select('total_xp')
      .eq('user_wallet', walletAddress)
      .single();

    if (xpError && xpError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching XP data:', xpError);
      throw new Error(`Failed to fetch XP data: ${xpError.message}`);
    }

    const totalXp = xpData?.total_xp || 0;

    // 6. Récupérer les récompenses gagnées
    const { data: earnedRewards, error: rewardsError } = await supabase
      .from('user_earned_rewards')
      .select('*')
      .eq('user_wallet', walletAddress)
      .order('earned_at', { ascending: false });

    if (rewardsError) {
      console.error('Error fetching earned rewards:', rewardsError);
      throw new Error(`Failed to fetch earned rewards: ${rewardsError.message}`);
    }

    // 7. Calculer les statistiques des récompenses
    const rewardsStats = {
      totalRewards: earnedRewards?.length || 0,
      claimedRewards: earnedRewards?.filter(r => r.claim_status === 'claimed').length || 0,
      pendingRewards: earnedRewards?.filter(r => r.claim_status === 'pending').length || 0,
      totalValue: earnedRewards?.reduce((sum, reward) => sum + parseFloat(reward.amount || '0'), 0) || 0
    };

    // 8. Récupérer les achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_wallet', walletAddress)
      .order('earned_at', { ascending: false });

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      throw new Error(`Failed to fetch achievements: ${achievementsError.message}`);
    }

    const stats = {
      creations: createdCount || 0,
      completions: completedCount || 0,
      moderations: moderatedCount || 0,
      totalWinc: Math.round(totalWinc * 100) / 100, // Arrondir à 2 décimales
      totalXp: totalXp,
      rewards: rewardsStats,
      achievements: achievements?.length || 0,
      lastActivity: earnedRewards?.[0]?.earned_at || null
    };

    console.log('=== USER STATS FETCHED ===');
    console.log('Creations:', stats.creations);
    console.log('Completions:', stats.completions);
    console.log('Moderations:', stats.moderations);
    console.log('Total WINC:', stats.totalWinc);
    console.log('Total XP:', stats.totalXp);
    console.log('Achievements:', stats.achievements);

    return NextResponse.json({
      success: true,
      stats,
      walletAddress
    });

  } catch (error) {
    console.error('User stats fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
