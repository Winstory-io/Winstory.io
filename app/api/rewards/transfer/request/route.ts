import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type TransferRequestBody = {
  deliveryType: 'digital' | 'physical';
  deliveryId: string;
  fromWallet: string;
  toWallet: string;
  reason?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TransferRequestBody;
    const { deliveryType, deliveryId, fromWallet, toWallet, reason } = body;
    if (!deliveryType || !deliveryId || !fromWallet || !toWallet) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }
    // Very light wallet check (0x prefix length)
    if (!toWallet.startsWith('0x') || toWallet.length < 10) {
      return NextResponse.json({ success: false, error: 'Invalid target wallet' }, { status: 400 });
    }

    const { error } = await supabase
      .from('reward_transfer_requests')
      .insert({
        delivery_type: deliveryType,
        delivery_id: deliveryId,
        from_wallet: fromWallet,
        to_wallet: toWallet,
        status: 'pending',
        reason: reason || null
      });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error creating transfer request:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


