import { NextRequest, NextResponse } from 'next/server';
import { getWinstoryCustodialAddress } from '@/lib/reward-lock-helpers';

/**
 * GET /api/rewards/winstory-address
 * 
 * Retourne l'adresse du wallet Winstory custodial
 * Utilisé côté frontend pour afficher l'adresse à approuver
 */
export async function GET(request: NextRequest) {
  try {
    const address = getWinstoryCustodialAddress();
    
    return NextResponse.json({
      success: true,
      address
    });
  } catch (error) {
    console.error('Error getting Winstory address:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get Winstory address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

