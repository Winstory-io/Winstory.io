import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type UpdateAddressRequest = {
  physicalDeliveryId: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
    notes?: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdateAddressRequest;
    const { physicalDeliveryId, shippingAddress } = body;

    if (!physicalDeliveryId || !shippingAddress) {
      return NextResponse.json({ success: false, error: 'physicalDeliveryId and shippingAddress are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('physical_access_deliveries')
      .update({ shipping_address: shippingAddress })
      .eq('id', physicalDeliveryId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error updating shipping address:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}


