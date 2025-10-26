import { NextRequest, NextResponse } from 'next/server';
import { awardModerationVoteXP, awardFinalModerationXP } from '@/lib/xp-engine';
import type { UserType } from '@/lib/xp-config';

/**
 * POST /api/xp/award-moderation
 * 
 * Award XP for moderation votes and final decisions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type, // 'vote' or 'final'
      moderatorWallet,
      creatorWallet,
      campaignId,
      campaignType,
      voteDecision, // 'VALID' or 'REFUSE'
      finalDecision, // 'VALIDATED' or 'REFUSED'
      completionId,
      mintValueWINC
    } = body;

    console.log('🗳️ [XP] Awarding moderation XP:', {
      type,
      moderatorWallet,
      creatorWallet,
      campaignId,
      campaignType,
      voteDecision,
      finalDecision
    });

    if (!campaignId || !campaignType) {
      return NextResponse.json(
        {
          success: false,
          error: 'campaignId and campaignType are required'
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

    let result;

    if (type === 'vote') {
      // Award XP for individual moderator vote
      if (!moderatorWallet || !voteDecision) {
        return NextResponse.json(
          {
            success: false,
            error: 'moderatorWallet and voteDecision are required for vote type'
          },
          { status: 400 }
        );
      }

      result = await awardModerationVoteXP(
        moderatorWallet,
        campaignId,
        campaignType,
        voteDecision,
        completionId
      );

    } else if (type === 'final') {
      // Award XP for final moderation decision (to creator)
      if (!creatorWallet || !finalDecision) {
        return NextResponse.json(
          {
            success: false,
            error: 'creatorWallet and finalDecision are required for final type'
          },
          { status: 400 }
        );
      }

      result = await awardFinalModerationXP(
        creatorWallet,
        campaignId,
        campaignType,
        finalDecision,
        mintValueWINC
      );

    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'type must be "vote" or "final"'
        },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      );
    }

    console.log(`✅ [XP] Moderation XP awarded: ${result.xpAmount} XP`);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in POST /api/xp/award-moderation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

