import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CompletionSubmissionData {
  campaignId: string;
  completerWallet: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

/**
 * POST /api/completions/submit
 * 
 * Submit a completion for a campaign and award XP
 */
export async function POST(request: NextRequest) {
  try {
    const data: CompletionSubmissionData = await request.json();

    console.log('=== SUBMITTING COMPLETION ===');
    console.log('Campaign ID:', data.campaignId);
    console.log('Completer Wallet:', data.completerWallet);
    console.log('Title:', data.title);

    // Validation
    if (!data.campaignId || !data.completerWallet || !data.title || !data.videoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'campaignId, completerWallet, title, and videoUrl are required'
        },
        { status: 400 }
      );
    }

    // ===================================
    // CHECK IF WALLET ALREADY COMPLETED THIS CAMPAIGN
    // ===================================
    console.log('🔍 Checking if wallet already completed this campaign...');
    const { data: existingCompletions, error: checkError } = await supabase
      .from('completions')
      .select('id, status')
      .eq('original_campaign_id', data.campaignId)
      .eq('completer_wallet', data.completerWallet.toLowerCase())
      .in('status', ['in_progress', 'completed', 'validated']);

    if (checkError) {
      console.error('Error checking existing completions:', checkError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to check existing completions',
          details: checkError.message
        },
        { status: 500 }
      );
    }

    if (existingCompletions && existingCompletions.length > 0) {
      console.warn('⚠️ Wallet already completed this campaign');
      return NextResponse.json(
        {
          success: false,
          error: 'You have already completed this campaign',
          existingCompletionId: existingCompletions[0].id
        },
        { status: 400 }
      );
    }

    console.log('✅ Wallet has not completed this campaign yet');

    // Generate completion ID
    const completionId = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create completion record
    const { error: completionError } = await supabase
      .from('completions')
      .insert({
        id: completionId,
        original_campaign_id: data.campaignId,
        completer_wallet: data.completerWallet,
        title: data.title,
        video_url: data.videoUrl,
        thumbnail_url: data.thumbnailUrl || null,
        status: 'in_progress',
        validation_status: 'pending',
        validation_conditions_met: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (completionError) {
      console.error('Error creating completion:', completionError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create completion',
          details: completionError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Completion created:', completionId);

    // ===================================
    // AWARD XP FOR COMPLETION SUBMISSION
    // ===================================
    console.log('🎯 [XP] Awarding completion submission XP...');
    try {
      const xpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/xp/award-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completerWallet: data.completerWallet,
          campaignId: data.campaignId,
          completionId,
          isValidated: false // Not yet validated
        })
      });

      if (xpResponse.ok) {
        const xpResult = await xpResponse.json();
        console.log('✅ [XP] Completion submission XP awarded:', xpResult.data?.summary);
      } else {
        console.warn('⚠️ [XP] Failed to award completion XP');
      }
    } catch (xpError) {
      console.error('❌ [XP] Error awarding completion XP:', xpError);
    }

    return NextResponse.json({
      success: true,
      completionId,
      message: 'Completion submitted successfully',
      data: {
        campaignId: data.campaignId,
        completionId,
        status: 'in_progress'
      }
    });

  } catch (error) {
    console.error('Completion submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit completion',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

