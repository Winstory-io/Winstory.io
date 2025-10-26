import { NextRequest, NextResponse } from 'next/server';
import { awardCompletionXP } from '@/lib/xp-engine';

/**
 * POST /api/xp/award-completion
 * 
 * Award XP for completion submission and validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      completerWallet,
      campaignId,
      completionId,
      isValidated
    } = body;

    console.log('🎬 [XP] Awarding completion XP:', {
      completerWallet,
      campaignId,
      completionId,
      isValidated
    });

    if (!completerWallet || !campaignId || !completionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'completerWallet, campaignId, and completionId are required'
        },
        { status: 400 }
      );
    }

    const results = await awardCompletionXP(
      completerWallet,
      campaignId,
      completionId,
      isValidated
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

