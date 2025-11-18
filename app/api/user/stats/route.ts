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

    const walletAddressLower = walletAddress.toLowerCase();

    // 1. Compter les campagnes créées (type INITIAL)
    // Vérifier à la fois original_creator_wallet ET creator_infos.wallet_address
    // pour s'assurer de capturer toutes les créations
    let createdCount = 0;
    
    try {
      // Méthode 1: Récupérer toutes les campagnes INITIAL avec leurs creator_infos
      const { data: allInitialCampaigns, error: allInitialError } = await supabase
        .from('campaigns')
        .select(`
          id,
          original_creator_wallet,
          creator_infos(wallet_address)
        `)
        .eq('type', 'INITIAL');

      if (allInitialError) {
        console.warn('⚠️ Error fetching campaigns with creator_infos, using fallback:', allInitialError.message);
        throw allInitialError; // Forcer le fallback
      }

      if (allInitialCampaigns && allInitialCampaigns.length > 0) {
        // Filtrer côté serveur pour vérifier les deux sources
        const uniqueCreatedIds = new Set<string>();
        for (const campaign of allInitialCampaigns) {
          try {
            const matchesOriginal = campaign.original_creator_wallet?.toLowerCase() === walletAddressLower;
            
            // Gérer creator_infos qui peut être un tableau ou un objet ou null
            let matchesCreatorInfo = false;
            if (campaign.creator_infos) {
              if (Array.isArray(campaign.creator_infos) && campaign.creator_infos.length > 0) {
                matchesCreatorInfo = campaign.creator_infos[0]?.wallet_address?.toLowerCase() === walletAddressLower;
              } else if (typeof campaign.creator_infos === 'object' && !Array.isArray(campaign.creator_infos)) {
                const creatorInfo = campaign.creator_infos as { wallet_address?: string };
                if (creatorInfo.wallet_address) {
                  matchesCreatorInfo = creatorInfo.wallet_address.toLowerCase() === walletAddressLower;
                }
              }
            }
            
            if (matchesOriginal || matchesCreatorInfo) {
              uniqueCreatedIds.add(campaign.id);
            }
          } catch (err) {
            console.warn('⚠️ Error processing campaign:', campaign.id, err);
            // Continuer avec les autres campagnes
          }
        }
        createdCount = uniqueCreatedIds.size;
        console.log(`📊 Creations: Found ${createdCount} campaign(s) created (checking both original_creator_wallet and creator_infos)`);
      }
    } catch (error) {
      // Fallback: utiliser seulement original_creator_wallet
      console.log('📊 Using fallback method for creations count');
      const { count: countByOriginalWallet, error: errorByOriginal } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'INITIAL')
        .ilike('original_creator_wallet', walletAddressLower);

      if (errorByOriginal) {
        console.error('❌ Error in fallback method:', errorByOriginal);
        throw new Error(`Failed to count created campaigns: ${errorByOriginal.message}`);
      }
      createdCount = countByOriginalWallet || 0;
      console.log(`📊 Creations: Found ${createdCount} campaign(s) created (fallback method)`);
    }

    // 2. Compter les campagnes complétées (type COMPLETION)
    const { count: completedCount, error: completedError } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'COMPLETION')
      .ilike('completer_wallet', walletAddressLower);

    if (completedError) {
      console.error('Error counting completed campaigns:', completedError);
      throw new Error(`Failed to count completed campaigns: ${completedError.message}`);
    }

    console.log(`📊 Completions: Found ${completedCount || 0} campaign(s) completed`);

    // 3. Compter les modérations (tous les contenus modérés)
    // Chaque vote = 1 contenu modéré (campagne INITIAL ou COMPLETION)
    // Un modérateur peut modérer une campagne INITIAL une fois, puis modérer plusieurs COMPLETIONS de cette même campagne
    // On compte tous les votes : chaque vote = 1 contenu modéré
    const { count: moderatedCount, error: moderatedError } = await supabase
      .from('moderation_votes')
      .select('*', { count: 'exact', head: true })
      .eq('moderator_wallet', walletAddress.toLowerCase());

    if (moderatedError) {
      console.error('Error counting moderated contents:', moderatedError);
      throw new Error(`Failed to count moderated contents: ${moderatedError.message}`);
    }

    console.log(`📊 Moderations: Found ${moderatedCount || 0} content(s) moderated (each vote = 1 content)`);

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

    // 5. Récupérer la progression XP depuis le nouveau système xp_balances
    const { data: xpData, error: xpError } = await supabase
      .from('xp_balances')
      .select('total_xp, current_level, xp_to_next_level, xp_in_current_level')
      .eq('user_wallet', walletAddress)
      .single();

    let xpBalanceData;
    if (xpError && xpError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.warn('⚠️ Error fetching XP data from xp_balances, trying old table:', xpError);
      // Fallback vers l'ancienne table user_xp_progression
      const { data: oldXpData } = await supabase
        .from('user_xp_progression')
        .select('total_xp')
        .eq('user_wallet', walletAddress)
        .single();
      
      xpBalanceData = {
        total_xp: oldXpData?.total_xp || 0,
        current_level: 1,
        xp_to_next_level: 100,
        xp_in_current_level: oldXpData?.total_xp || 0
      };
    } else {
      xpBalanceData = xpData || {
        total_xp: 0,
        current_level: 1,
        xp_to_next_level: 100,
        xp_in_current_level: 0
      };
    }

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
      totalXp: xpBalanceData.total_xp,
      xpBalance: xpBalanceData, // Inclure toutes les données XP
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
    console.log('XP Level:', xpBalanceData.current_level);
    console.log('XP to Next Level:', xpBalanceData.xp_to_next_level);
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
