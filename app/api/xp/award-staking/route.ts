import { NextRequest, NextResponse } from 'next/server';
import { awardStakingXP } from '@/lib/xp-engine';
import { UserType } from '@/lib/xp-config';

/**
 * POST /api/xp/award-staking
 * 
 * Award XP for staking rewards
 * 
 * Body parameters:
 * - stakerWallet: string (required) - Wallet address of the staker
 * - campaignId: string (required) - Campaign ID
 * - campaignType: 'B2C' | 'AGENCY_B2C' | 'INDIVIDUAL' (required) - Type of campaign
 * - stakerCategory: 'MAJOR' | 'MINOR' | 'INELIGIBLE' (required) - Staker category
 * - stakeAmount: number (required) - Amount staked in WINC
 * - stakeAgeDays: number (required) - Age of stake in days
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stakerWallet,
      campaignId,
      campaignType,
      stakerCategory,
      stakeAmount,
      stakeAgeDays
    } = body;

    console.log('💰 [XP] Awarding staking XP:', {
      stakerWallet,
      campaignId,
      campaignType,
      stakerCategory,
      stakeAmount,
      stakeAgeDays
    });

    // Validation
    if (!stakerWallet || !campaignId || !campaignType || !stakerCategory || stakeAmount === undefined || stakeAgeDays === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'stakerWallet, campaignId, campaignType, stakerCategory, stakeAmount, and stakeAgeDays are required'
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

    // Validate stakerCategory
    if (!['MAJOR', 'MINOR', 'INELIGIBLE'].includes(stakerCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: 'stakerCategory must be MAJOR, MINOR, or INELIGIBLE'
        },
        { status: 400 }
      );
    }

    // Validate amounts
    if (stakeAmount < 0 || stakeAgeDays < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'stakeAmount and stakeAgeDays must be positive numbers'
        },
        { status: 400 }
      );
    }

    const result = await awardStakingXP(
      stakerWallet,
      campaignId,
      campaignType as UserType,
      stakerCategory as 'MAJOR' | 'MINOR' | 'INELIGIBLE',
      stakeAmount,
      stakeAgeDays
    );

    if (result.success) {
      console.log(`✅ [XP] Awarded ${result.xpAmount} staking XP to ${stakerWallet}`);
    } else {
      console.warn(`⚠️ [XP] Failed to award staking XP:`, result.error);
    }

    return NextResponse.json({
      success: result.success,
      data: {
        xpAmount: result.xpAmount,
        xpBefore: result.xpBefore,
        xpAfter: result.xpAfter,
        level: result.level,
        levelUp: result.levelUp,
        previousLevel: result.previousLevel
      },
      error: result.error
    });

  } catch (error) {
    console.error('Error in POST /api/xp/award-staking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

