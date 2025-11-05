import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CompletionValidationData {
  completionId: string;
  finalScore: number;
  decision: 'approved' | 'rejected';
}

/**
 * POST /api/completions/validate
 * 
 * Validate a completion with final score and award XP if score is 100
 */
export async function POST(request: NextRequest) {
  try {
    const data: CompletionValidationData = await request.json();

    console.log('=== VALIDATING COMPLETION ===');
    console.log('Completion ID:', data.completionId);
    console.log('Final Score:', data.finalScore);
    console.log('Decision:', data.decision);

    // Validation
    if (!data.completionId || data.finalScore === undefined || !data.decision) {
      return NextResponse.json(
        {
          success: false,
          error: 'completionId, finalScore, and decision are required'
        },
        { status: 400 }
      );
    }

    // Get completion info
    const { data: completion, error: fetchError } = await supabase
      .from('completions')
      .select('*, original_campaign_id, completer_wallet')
      .eq('id', data.completionId)
      .single();

    if (fetchError || !completion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Completion not found'
        },
        { status: 404 }
      );
    }

    // Update completion with final score and validation status
    const { error: updateError } = await supabase
      .from('completions')
      .update({
        score_avg: data.finalScore,
        validation_status: data.decision === 'approved' ? 'approved' : 'rejected',
        validation_conditions_met: data.decision === 'approved' && data.finalScore === 100,
        validation_date: new Date().toISOString(),
        status: data.decision === 'approved' ? 'completed' : 'rejected',
        rejection_reason: data.decision === 'rejected' ? 'Did not meet validation criteria' : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.completionId);

    if (updateError) {
      console.error('Error updating completion:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update completion',
          details: updateError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Completion validated');

    // ===================================
    // AWARD XP IF 100% VALIDATED
    // ===================================
    if (data.decision === 'approved' && data.finalScore === 100) {
      console.log('🎯 [XP] Awarding 100% completion validation XP...');
      try {
        const xpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/xp/award-completion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completerWallet: completion.completer_wallet,
            campaignId: completion.original_campaign_id,
            completionId: data.completionId,
            isValidated: true // 100% validated!
          })
        });

        if (xpResponse.ok) {
          const xpResult = await xpResponse.json();
          console.log('✅ [XP] 100% completion validation XP awarded:', xpResult.data?.summary);
        } else {
          console.warn('⚠️ [XP] Failed to award 100% completion XP');
        }
      } catch (xpError) {
        console.error('❌ [XP] Error awarding 100% completion XP:', xpError);
      }

      // ===================================
      // DELIVER ACCESS REWARDS (DIGITAL/PHYSICAL)
      // ===================================
      try {
        console.log('🎟️ Delivering access rewards for completion...');
        const deliverResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/rewards/deliver-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            completionId: data.completionId,
            campaignId: completion.original_campaign_id,
            completerWallet: completion.completer_wallet
          })
        });

        if (deliverResponse.ok) {
          const deliverResult = await deliverResponse.json();
          console.log('✅ Access rewards delivered:', deliverResult?.data);
        } else {
          console.warn('⚠️ Failed to deliver access rewards');
        }
      } catch (deliverErr) {
        console.error('❌ Error delivering access rewards:', deliverErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Completion validated successfully',
      data: {
        completionId: data.completionId,
        finalScore: data.finalScore,
        decision: data.decision,
        xpAwarded: data.decision === 'approved' && data.finalScore === 100
      }
    });

  } catch (error) {
    console.error('Completion validation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate completion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

