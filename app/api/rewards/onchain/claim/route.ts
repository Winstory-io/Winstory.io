import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Placeholder endpoint for future on-chain claim integration (Base, ERC-1155)
  return NextResponse.json({
    success: false,
    error: 'On-chain claim not implemented yet',
    planned: {
      network: 'Base',
      standard: 'ERC-1155',
      modes: ['custodial_auto_mint', 'user_initiated_claim']
    }
  }, { status: 501 });
}


