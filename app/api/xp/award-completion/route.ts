import { NextRequest, NextResponse } from 'next/server';
import { awardCompletionXP } from '@/lib/xp-engine';
import { UserType } from '@/lib/xp-config';

/**
 * POST /api/xp/award-completion
 * 
 * Award XP for completion submission, validation, or refusal
 * 
 * Body parameters:
 * - completerWallet: string (required) - Wallet address of the completer
 * - campaignId: string (required) - Campaign ID
 * - completionId: string (required) - Completion ID
 * - campaignType: 'B2C' | 'AGENCY_B2C' | 'INDIVIDUAL' (required) - Type of campaign
 * - isValidated: boolean (optional) - If completion is validated
 * - isRefused: boolean (optional) - If completion is refused
 * - isPaid: boolean (optional) - If completion is paid (for B2C/Agency)
 * - priceCompletion: number (optional) - Price of the completion in USD/WINC
 * - mintValueWINC: number (optional) - MINT value in WINC (for Individual)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      completerWallet,
      campaignId,
      completionId,
      campaignType,
      isValidated = false,
      isRefused = false,
      isPaid = false,
      priceCompletion = 0,
      mintValueWINC = 0
    } = body;

    console.log('🎬 [XP] Awarding completion XP:', {
      completerWallet,
      campaignId,
      completionId,
      campaignType,
      isValidated,
      isRefused,
      isPaid,
      priceCompletion,
      mintValueWINC
    });

    // Validation
    if (!completerWallet || !campaignId || !completionId || !campaignType) {
      return NextResponse.json(
        {
          success: false,
          error: 'completerWallet, campaignId, completionId, and campaignType are required'
        },
        { status: 400 }
      );
    }

    // Validate campaignType
    if (!['B2C', 'AGENCY_B2C', 'INDIVIDUAL'].includes(campaignType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'campaignType must be B2C, AGENCY_B2C, or INDIVIDUAL'
        },
        { status: 400 }
      );
    }

    const results = await awardCompletionXP(
      completerWallet,
      campaignId,
      completionId,
      campaignType as UserType,
      {
        isValidated,
        isRefused,
        isPaid,
        priceCompletion,
        mintValueWINC
      }
    );

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    console.log(`✅ [XP] Awarded ${successfulResults.length} completion XP transactions`);
    if (failedResults.length > 0) {
      console.warn(`⚠️ [XP] ${failedResults.length} transactions failed`);
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successfulResults.length,
          failed: failedResults.length,
          totalXP: successfulResults.reduce((sum, r) => sum + r.xpAmount, 0)
        }
      }
    });

  } catch (error) {
    console.error('Error in POST /api/xp/award-completion:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

