import { NextRequest, NextResponse } from 'next/server';
import { getXPTransactionHistory, awardXP } from '@/lib/xp-engine';
import type { UserType } from '@/lib/xp-config';

/**
 * GET /api/xp/transactions?wallet=<wallet_address>&limit=50&offset=0
 * 
 * Get XP transaction history for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const transactions = await getXPTransactionHistory(wallet, limit, offset);

    if (!transactions) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        count: transactions.length
      }
    });

  } catch (error) {
    console.error('Error in GET /api/xp/transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/xp/transactions
 * 
 * Manually add an XP transaction (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userWallet,
      userType,
      action,
      campaignId,
      completionId,
      mintValueUSD,
      mintValueWINC,
      description,
      metadata,
      agencyWallet,
      clientEmail,
      createdBy
    } = body;

    if (!userWallet || !userType || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'userWallet, userType, and action are required'
        },
        { status: 400 }
      );
    }

    // Validate userType
    const validUserTypes: UserType[] = ['B2C', 'AGENCY_B2C', 'INDIVIDUAL'];
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid userType. Must be one of: ${validUserTypes.join(', ')}`
        },
        { status: 400 }
      );
    }

    const result = await awardXP({
      userWallet,
      userType,
      action,
      campaignId,
      completionId,
      mintValueUSD,
      mintValueWINC,
      description,
      metadata,
      agencyWallet,
      clientEmail,
      createdBy: createdBy || 'api_manual'
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in POST /api/xp/transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

