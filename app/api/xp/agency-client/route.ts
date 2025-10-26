import { NextRequest, NextResponse } from 'next/server';
import { registerAgencyB2CClient, awardAgencyClientOnboardingXP } from '@/lib/xp-engine';

/**
 * POST /api/xp/agency-client
 * 
 * Register an agency B2C client or award onboarding XP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action, // 'register' or 'onboard'
      agencyWallet,
      agencyEmail,
      clientEmail,
      clientName,
      clientWallet,
      campaignId
    } = body;

    console.log('🏢 [XP] Agency B2C client action:', {
      action,
      agencyWallet,
      clientEmail,
      campaignId
    });

    if (!action || !clientEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'action and clientEmail are required'
        },
        { status: 400 }
      );
    }

    if (action === 'register') {
      // Register client for future XP award
      if (!agencyWallet || !agencyEmail || !campaignId || !clientName) {
        return NextResponse.json(
          {
            success: false,
            error: 'agencyWallet, agencyEmail, clientName, and campaignId are required for registration'
          },
          { status: 400 }
        );
      }

      const result = await registerAgencyB2CClient(
        agencyWallet,
        agencyEmail,
        clientEmail,
        clientName,
        campaignId
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error
          },
          { status: 400 }
        );
      }

      console.log('✅ [XP] Agency client registered for future XP award');

      return NextResponse.json({
        success: true,
        message: 'Client registered. XP will be awarded when they connect to Winstory.'
      });

    } else if (action === 'onboard') {
      // Award XP when client connects
      if (!clientWallet) {
        return NextResponse.json(
          {
            success: false,
            error: 'clientWallet is required for onboarding'
          },
          { status: 400 }
        );
      }

      const result = await awardAgencyClientOnboardingXP(
        clientEmail,
        clientWallet
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error
          },
          { status: 400 }
        );
      }

      console.log(`✅ [XP] Agency client onboarding XP awarded: ${result.xpAmount} XP`);

      return NextResponse.json({
        success: true,
        data: result,
        message: 'Welcome bonus XP awarded!'
      });

    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'action must be "register" or "onboard"'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in POST /api/xp/agency-client:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

