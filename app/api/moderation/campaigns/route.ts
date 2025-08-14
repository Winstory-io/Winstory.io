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

    // Filtrer les campagnes qui ont au minimum 22 modérateurs différents
    const eligibleCampaigns = campaigns.filter(campaign => {
      if (!campaign.progress) return false;
      
      // Vérifier le nombre de modérateurs uniques
      const uniqueModerators = new Set();
      
      // Ajouter les modérateurs existants (si des sessions existent)
      if (campaign.moderations) {
        campaign.moderations.forEach(session => {
          if (session.moderatorWallet) {
            uniqueModerators.add(session.moderatorWallet);
          }
        });
      }
      
      // Vérifier si on a au moins 22 modérateurs
      return uniqueModerators.size >= 22;
    });

    return NextResponse.json({
      success: true,
      data: eligibleCampaigns,
      count: eligibleCampaigns.length,
      totalCampaigns: campaigns.length,
      eligibleCampaigns: eligibleCampaigns.length,
      minimumModeratorsRequired: 22
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