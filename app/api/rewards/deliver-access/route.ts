import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Minimal helper: generate short unique code
function generateAccessCode(length = 10): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type DeliverAccessRequest = {
  completionId: string;
  campaignId: string;
  completerWallet: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DeliverAccessRequest;
    const { completionId, campaignId } = body;

    if (!completionId || !campaignId) {
      return NextResponse.json(
        { success: false, error: 'completionId and campaignId are required' },
        { status: 400 }
      );
    }

    // Fetch digital and physical access rewards for this campaign
    const [digitalRewardsRes, physicalRewardsRes] = await Promise.all([
      supabase
        .from('digital_access_rewards')
        .select('*')
        .eq('campaign_id', campaignId),
      supabase
        .from('physical_access_rewards')
        .select('*')
        .eq('campaign_id', campaignId)
    ]);

    if (digitalRewardsRes.error) {
      throw new Error(`Failed to fetch digital rewards: ${digitalRewardsRes.error.message}`);
    }
    if (physicalRewardsRes.error) {
      throw new Error(`Failed to fetch physical rewards: ${physicalRewardsRes.error.message}`);
    }

    const digitalRewards = digitalRewardsRes.data || [];
    const physicalRewards = physicalRewardsRes.data || [];

    const deliveryInserts: Array<Promise<any>> = [];

    // Create deliveries for each digital reward
    for (const reward of digitalRewards) {
      const accessCode = generateAccessCode(10);
      // For now, reuse access_url; later we can generate per-user links with tokens
      const accessLink = reward.access_url as string;

      deliveryInserts.push(
        supabase.from('digital_access_deliveries').insert({
          completion_id: completionId,
          digital_reward_id: reward.id,
          access_code: accessCode,
          access_link: accessLink,
          file_url: null,
          file_hash: null,
          expires_at: null,
          is_redeemed: false,
          // Store useful metadata for the front/back (extensible)
          metadata: {
            access_type: reward.access_type || null,
            source_url: reward.access_url || null,
            reward_tier: reward.reward_tier || null,
            blockchain: reward.blockchain || null,
            token_standard: reward.token_standard || null,
            contract_address: reward.contract_address || null,
            token_id: reward.token_id || null,
            campaign_id: campaignId,
            content_type: reward.metadata?.content_type || null,
            code_type: reward.metadata?.code_type || null,
            delivery_strategy: 'code_link',
            custodial_auto_mint_planned: true,
            claim_on_chain_enabled: true,
            mint_timing: 'immediate_on_validation', // Mint immediately on validation, no planned_at
            generated_at: new Date().toISOString()
          }
        })
      );
    }

    // Create deliveries for each physical reward
    for (const reward of physicalRewards) {
      deliveryInserts.push(
        supabase.from('physical_access_deliveries').insert({
          completion_id: completionId,
          physical_reward_id: reward.id,
          shipping_address: null,
          fulfillment_status: 'pending'
        })
      );
    }

    // Execute all inserts
    const deliveryResults = await Promise.all(deliveryInserts);
    const failed = deliveryResults.filter(r => (r as any).error);
    if (failed.length > 0) {
      const firstErr = (failed[0] as any).error;
      throw new Error(`Failed to insert some deliveries: ${firstErr.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        digitalCreated: digitalRewards.length,
        physicalCreated: physicalRewards.length
      }
    });
  } catch (err: any) {
    console.error('Error delivering access rewards:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}



