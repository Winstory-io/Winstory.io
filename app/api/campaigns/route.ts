import { NextRequest, NextResponse } from 'next/server';

// Types pour les campagnes
interface Campaign {
  id: string;
  creatorId: string;
  story: {
    title: string;
    startingStory: string;
    guideline: string;
  };
  film: {
    url?: string;
    videoId?: string;
    fileName?: string;
    fileSize?: number;
    format?: string;
  };
  completions: {
    wincValue: number;
    maxCompletions: number;
  };
  status: 'pending' | 'evaluating' | 'approved' | 'rejected' | 'active' | 'completed';
  evaluation?: {
    score: number;
    tier: 'S' | 'A' | 'B' | 'C' | 'F';
    collaborationProbability: number;
    securityStatus: 'CLEARED' | 'FLAGGED';
  };
  createdAt: string;
  approvedAt?: string;
  availableToCompleters: boolean;
}

// Simulation d'une base de données en mémoire
let campaigns: Campaign[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const campaign: Campaign = {
      id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creatorId: body.creatorId || 'anonymous',
      story: body.story,
      film: body.film,
      completions: body.completions,
      status: 'pending',
      createdAt: new Date().toISOString(),
      availableToCompleters: false
    };
    
    campaigns.push(campaign);
    
    return NextResponse.json({ 
      success: true, 
      campaignId: campaign.id,
      message: 'Campaign created successfully'
    });
    
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const availableToCompleters = searchParams.get('availableToCompleters');
    
    let filteredCampaigns = campaigns;
    
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status);
    }
    
    if (availableToCompleters === 'true') {
      filteredCampaigns = filteredCampaigns.filter(c => c.availableToCompleters === true);
    }
    
    return NextResponse.json({
      success: true,
      campaigns: filteredCampaigns,
      total: filteredCampaigns.length
    });
    
  } catch (error) {
    console.error('Campaign fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, updates } = body;
    
    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    
    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    // Mettre à jour la campagne
    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...updates,
      id: campaigns[campaignIndex].id, // Préserver l'ID
      createdAt: campaigns[campaignIndex].createdAt // Préserver la date de création
    };
    
    // Si la campagne est approuvée, la rendre disponible aux compléteurs
    if (updates.status === 'approved') {
      campaigns[campaignIndex].approvedAt = new Date().toISOString();
      campaigns[campaignIndex].availableToCompleters = true;
    }
    
    return NextResponse.json({
      success: true,
      campaign: campaigns[campaignIndex],
      message: 'Campaign updated successfully'
    });
    
  } catch (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
