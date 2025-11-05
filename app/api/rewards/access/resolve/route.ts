import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) {
      return NextResponse.json({ success: false, error: 'Missing code' }, { status: 400 });
    }

    // Find delivery by code
    const { data: delivery, error } = await supabase
      .from('digital_access_deliveries')
      .select('*')
      .eq('access_code', code)
      .single();

    if (error || !delivery) {
      return NextResponse.json({ success: false, error: 'Invalid or unknown code' }, { status: 404 });
    }

    if (delivery.is_redeemed) {
      // Already redeemed – return the link but do not update again
      return NextResponse.json({ success: true, alreadyRedeemed: true, accessLink: delivery.access_link || null });
    }

    // Mark as redeemed now
    const { error: updateErr } = await supabase
      .from('digital_access_deliveries')
      .update({ is_redeemed: true, redeemed_at: new Date().toISOString() })
      .eq('id', delivery.id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, accessLink: delivery.access_link || null });
  } catch (err: any) {
    console.error('Error resolving access code:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


