import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type ClaimWithBeneficiaryRequest = {
  deliveryType: 'digital' | 'physical';
  deliveryId: string;
  completerWallet: string; // The wallet that earned the reward
  beneficiaryWallet?: string; // Optional: if provided, recipient is different from completer
  beneficiaryName?: string; // Optional: name/identifier of beneficiary
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClaimWithBeneficiaryRequest;
    const { deliveryType, deliveryId, completerWallet, beneficiaryWallet, beneficiaryName } = body;

    if (!deliveryType || !deliveryId || !completerWallet) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Determine final recipient (beneficiary or completer)
    const finalRecipientWallet = beneficiaryWallet || completerWallet;
    
    // Validate wallet format
    if (!finalRecipientWallet.startsWith('0x') || finalRecipientWallet.length < 10) {
      return NextResponse.json({ success: false, error: 'Invalid wallet address' }, { status: 400 });
    }

    // Update delivery with beneficiary
    const tableName = deliveryType === 'digital' ? 'digital_access_deliveries' : 'physical_access_deliveries';
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ 
        beneficiary_wallet: finalRecipientWallet,
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryId);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // Get completion info to find campaign creator
    const { data: delivery } = await supabase
      .from(tableName)
      .select('completion_id')
      .eq('id', deliveryId)
      .single();

    if (delivery) {
      // Get completion to find campaign
      const { data: completion } = await supabase
        .from('completions')
        .select('original_campaign_id')
        .eq('id', delivery.completion_id)
        .single();

      if (completion) {
        // Get campaign creator
        const { data: creatorInfo } = await supabase
          .from('creator_infos')
          .select('wallet_address, email, company_name')
          .eq('campaign_id', completion.original_campaign_id)
          .single();

        // Create notification for creator (if beneficiary is different from completer)
        if (beneficiaryWallet && beneficiaryWallet !== completerWallet && creatorInfo) {
          // Store notification in a simple way (could be expanded to notifications table)
          console.log(`📢 [NOTIFICATION] Campaign creator ${creatorInfo.wallet_address} notified: Completer ${completerWallet} designated beneficiary ${beneficiaryWallet} (${beneficiaryName || 'unnamed'}) for ${deliveryType} reward ${deliveryId}`);
          
          // TODO: Create actual notification record if notifications table exists
          // For now, log it. This can be expanded to email or in-app notification system.
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        recipientWallet: finalRecipientWallet,
        beneficiaryName: beneficiaryName || null,
        notificationSent: !!beneficiaryWallet && beneficiaryWallet !== completerWallet
      }
    });
  } catch (err: any) {
    console.error('Error claiming reward with beneficiary:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

