import { NextRequest, NextResponse } from 'next/server';
import { getXPBalance } from '@/lib/xp-engine';

/**
 * GET /api/xp/balance?wallet=<wallet_address>
 * 
 * Get XP balance and level for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const balance = await getXPBalance(wallet);

    if (!balance) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch XP balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: balance
    });

  } catch (error) {
    console.error('Error in GET /api/xp/balance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

