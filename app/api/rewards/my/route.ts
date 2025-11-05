import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    if (!wallet) {
      return NextResponse.json({ success: false, error: 'wallet is required' }, { status: 400 });
    }

    // Get user completions
    const { data: completions, error: compErr } = await supabase
      .from('completions')
      .select('id, original_campaign_id, created_at, status')
      .eq('completer_wallet', wallet);

    if (compErr) {
      throw new Error(`Failed to fetch completions: ${compErr.message}`);
    }

    const completionIds = (completions || []).map(c => c.id);
    if (completionIds.length === 0) {
      return NextResponse.json({ success: true, data: { digital: [], physical: [] } });
    }

    // Fetch deliveries for these completions
    const [digitalRes, physicalRes] = await Promise.all([
      supabase
        .from('digital_access_deliveries')
        .select('id, completion_id, digital_reward_id, access_code, is_redeemed, redeemed_at, expires_at, created_at, beneficiary_wallet, metadata')
        .in('completion_id', completionIds),
      supabase
        .from('physical_access_deliveries')
        .select('id, completion_id, physical_reward_id, fulfillment_status, tracking_number, shipping_address, created_at, beneficiary_wallet')
        .in('completion_id', completionIds)
    ]);

    if (digitalRes.error) {
      throw new Error(`Failed to fetch digital deliveries: ${digitalRes.error.message}`);
    }
    if (physicalRes.error) {
      throw new Error(`Failed to fetch physical deliveries: ${physicalRes.error.message}`);
    }

    const digital = digitalRes.data || [];
    const physical = physicalRes.data || [];

    return NextResponse.json({ success: true, data: { digital, physical } });
  } catch (err: any) {
    console.error('Error fetching my rewards:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


