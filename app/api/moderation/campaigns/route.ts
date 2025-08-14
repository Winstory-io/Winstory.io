import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'INITIAL' | 'COMPLETION' | null;
    const creatorType = searchParams.get('creatorType') as string | null;

    // Construire les filtres
    const where: any = {
      status: 'PENDING_MODERATION'
    };

    if (type) {
      where.type = type;
    }

    if (creatorType) {
      where.creatorType = creatorType;
    }

    // Récupérer les campagnes avec toutes les relations
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        creatorInfo: true,
        content: true,
        rewards: true,
        metadata: true,
        progress: true,
        moderations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filtrer les campagnes qui ont un progrès et sont en attente de modération
    const eligibleCampaigns = campaigns.filter(campaign => {
      // Vérifier que la campagne a un progrès et est en attente de modération
      return campaign.progress !== null && 
             campaign.progress !== undefined && 
             campaign.status === 'PENDING_MODERATION';
    });

    return NextResponse.json({
      success: true,
      data: eligibleCampaigns,
      count: eligibleCampaigns.length,
      totalCampaigns: campaigns.length,
      eligibleCampaigns: eligibleCampaigns.length
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch campaigns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, moderatorWallet } = body;

    // Créer une nouvelle session de modération
    const moderationSession = await prisma.moderationSession.create({
      data: {
        campaignId,
        moderatorWallet,
        isEligible: true
      }
    });

    return NextResponse.json({
      success: true,
      data: moderationSession
    });

  } catch (error) {
    console.error('Error creating moderation session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create moderation session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 