import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/cron/check-ended-campaigns
 * 
 * Worker qui vérifie les campagnes terminées et distribue les récompenses Premium
 * 
 * À appeler périodiquement (ex: toutes les heures) via cron job ou scheduler
 * 
 * Sécurité: Vérifier le header Authorization avec CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de sécurité pour cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'change-me-in-production';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('=== CHECKING ENDED CAMPAIGNS FOR PREMIUM REWARDS ===');

    // 1. Trouver campagnes terminées (statut COMPLETED)
    const { data: endedCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('status', 'COMPLETED');

    if (campaignsError) {
      console.error('Error fetching ended campaigns:', campaignsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    if (!endedCampaigns || endedCampaigns.length === 0) {
      console.log('✅ No ended campaigns found');
      return NextResponse.json({
        success: true,
        message: 'No ended campaigns found',
        processed: 0
      });
    }

    console.log(`Found ${endedCampaigns.length} ended campaigns`);

    const results: any[] = [];

    // 2. Pour chaque campagne terminée, vérifier si Premium déjà distribué
    for (const campaign of endedCampaigns) {
      // Vérifier si Premium déjà distribué
      const { data: premiumDistributed } = await supabase
        .from('reward_distributions')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('reward_tier', 'premium')
        .limit(1);

      if (premiumDistributed && premiumDistributed.length > 0) {
        console.log(`⏭️  Campaign ${campaign.id}: Premium already distributed`);
        continue;
      }

      // Vérifier qu'il y a des récompenses Premium configurées
      const { data: premiumRewards } = await supabase
        .from('token_rewards')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('reward_tier', 'premium')
        .limit(1);

      if (!premiumRewards || premiumRewards.length === 0) {
        console.log(`⏭️  Campaign ${campaign.id}: No premium rewards configured`);
        continue;
      }

      // Distribuer Premium
      console.log(`🎁 Distributing premium rewards for campaign ${campaign.id}...`);
      
      try {
        const distributeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/rewards/distribute-premium`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: campaign.id })
          }
        );

        const distributeResult = await distributeResponse.json();

        if (distributeResult.success) {
          console.log(`✅ Premium rewards distributed for campaign ${campaign.id}`);
          results.push({
            campaignId: campaign.id,
            success: true,
            distributed: distributeResult.data?.distributed || 0
          });
        } else {
          console.error(`❌ Failed to distribute premium for campaign ${campaign.id}:`, distributeResult.error);
          results.push({
            campaignId: campaign.id,
            success: false,
            error: distributeResult.error
          });
        }
      } catch (error) {
        console.error(`❌ Error distributing premium for campaign ${campaign.id}:`, error);
        results.push({
          campaignId: campaign.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Processed ${results.length} campaigns: ${successful.length} successful, ${failed.length} failed`);

    return NextResponse.json({
      success: true,
      message: 'Ended campaigns checked',
      data: {
        totalCampaigns: endedCampaigns.length,
        processed: results.length,
        successful: successful.length,
        failed: failed.length,
        results
      }
    });

  } catch (error) {
    console.error('Error in check-ended-campaigns cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check ended campaigns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

