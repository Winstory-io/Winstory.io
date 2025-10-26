import { NextRequest, NextResponse } from 'next/server';
import { awardCampaignCreationXP } from '@/lib/xp-engine';
import type { UserType } from '@/lib/xp-config';

/**
 * POST /api/xp/award-campaign-creation
 * 
 * Award XP for campaign creation (called internally after MINT)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userWallet,
      campaignType,
      campaignId,
      mintValueUSD,
      options
    } = body;

    console.log('🎯 [XP] Awarding campaign creation XP:', {
      userWallet,
      campaignType,
      campaignId,
      mintValueUSD,
      options
    });

    if (!userWallet || !campaignType || !campaignId || !mintValueUSD) {
      return NextResponse.json(
        {
          success: false,
          error: 'userWallet, campaignType, campaignId, and mintValueUSD are required'
        },
        { status: 400 }
      );
    }

    // Validate campaignType
    const validCampaignTypes: UserType[] = ['B2C', 'AGENCY_B2C', 'INDIVIDUAL'];
    if (!validCampaignTypes.includes(campaignType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid campaignType. Must be one of: ${validCampaignTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    const results = await awardCampaignCreationXP(
      userWallet,
      campaignType,
      campaignId,
      mintValueUSD,
      options || {}
    );

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    console.log(`✅ [XP] Awarded ${successfulResults.length} XP transactions`);
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
    console.error('Error in POST /api/xp/award-campaign-creation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

