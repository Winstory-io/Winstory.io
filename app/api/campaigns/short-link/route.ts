import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { evaluateModeration, ModerationStatus } from '@/lib/moderation-engine';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const MIN_REQUIRED_VOTES = 22;
const SCALE = 1000000000000000000; // 1e18 for WINC precision

// Fonction pour générer un code court unique (7 caractères alphanumériques)
function generateShortCode(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Fonction pour vérifier si une campagne est totalement validée
async function isCampaignFullyValidated(campaignId: string): Promise<boolean> {
  // 1. Vérifier que la campagne existe et est de type B2C/Agence B2C
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, status, creator_type, type')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    console.error('❌ Campaign not found:', campaignError);
    return false;
  }

  // Vérifier que c'est une campagne B2C ou Agence B2C
  if (campaign.creator_type !== 'FOR_B2C' && campaign.creator_type !== 'B2C_AGENCIES') {
    console.log('❌ Campaign is not B2C or Agency B2C:', campaign.creator_type);
    return false;
  }

  // Vérifier que c'est une campagne INITIAL (pas une completion)
  if (campaign.type !== 'INITIAL') {
    console.log('❌ Campaign is not INITIAL type:', campaign.type);
    return false;
  }

  // 2. Vérifier que le statut est APPROVED
  if (campaign.status !== 'APPROVED') {
    console.log('❌ Campaign status is not APPROVED:', campaign.status);
    return false;
  }

  // 3. Vérifier la validation par les modérateurs humains via le système hybride
  const { data: moderationProgress, error: progressError } = await supabase
    .from('moderation_progress')
    .select('*')
    .eq('campaign_id', campaignId)
    .single();

  if (progressError || !moderationProgress) {
    console.error('❌ Moderation progress not found:', progressError);
    return false;
  }

  // Utiliser le moteur de modération hybride pour vérifier la validation
  const validVotes = moderationProgress.valid_votes || 0;
  const refuseVotes = moderationProgress.refuse_votes || 0;
  const totalVotes = moderationProgress.total_votes || 0;
  const stakedAmount = moderationProgress.staking_pool_total || 0;
  const mintPrice = moderationProgress.unit_value || 100; // Valeur par défaut 100 USDC
  const stakeYes = moderationProgress.stake_yes || 0;
  const stakeNo = moderationProgress.stake_no || 0;

  // Évaluer avec le moteur de modération
  const moderationResult = evaluateModeration(
    validVotes,
    refuseVotes,
    BigInt(Math.floor(stakeYes * SCALE)),
    BigInt(Math.floor(stakeNo * SCALE)),
    mintPrice,
    Date.now(),
    Date.now() + 7 * 24 * 3600 * 1000,
    BigInt(SCALE)
  );

  // Vérifier que toutes les conditions sont remplies
  const votesOk = totalVotes >= MIN_REQUIRED_VOTES;
  const stakingOk = stakedAmount > mintPrice;
  const hybridScoreYes = Number(moderationResult.scoreYes) / SCALE;
  const hybridScoreNo = Number(moderationResult.scoreNo) / SCALE;
  const ratioOk = totalVotes >= MIN_REQUIRED_VOTES && 
                  ((hybridScoreYes >= (hybridScoreNo * 2.0)) || (hybridScoreNo >= (hybridScoreYes * 2.0)));

  const allConditionsMet = votesOk && stakingOk && ratioOk;
  const isValidated = allConditionsMet && moderationResult.status === ModerationStatus.VALIDATED;

  if (!isValidated) {
    console.log('❌ Campaign moderation not fully validated:', {
      votesOk,
      stakingOk,
      ratioOk,
      allConditionsMet,
      moderationStatus: moderationResult.status
    });
    return false;
  }

  // TODO: Vérifier aussi l'évaluation IA si nécessaire
  // Pour l'instant, on considère qu'une campagne est validée si :
  // - status = 'APPROVED'
  // - creator_type IN ('FOR_B2C', 'B2C_AGENCIES')
  // - Le système de modération hybride indique VALIDATED

  return true;
}

/**
 * GET /api/campaigns/short-link?campaignId=xxx
 * Récupère le lien court d'une campagne si elle est validée
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'campaignId is required' },
        { status: 400 }
      );
    }

    // Vérifier si un lien existe déjà
    const { data: existingLink, error: linkError } = await supabase
      .from('campaign_short_links')
      .select('*')
      .eq('campaign_id', campaignId)
      .single();

    if (linkError && linkError.code !== 'PGRST116') {
      console.error('Error fetching short link:', linkError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch short link' },
        { status: 500 }
      );
    }

    if (existingLink) {
      // Retourner le lien existant
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.winstory.io';
      const shortUrl = `${baseUrl}/c/${existingLink.short_code}`;
      
      return NextResponse.json({
        success: true,
        shortCode: existingLink.short_code,
        shortUrl,
        fullUrl: existingLink.full_url,
        clicksCount: existingLink.clicks_count,
        createdAt: existingLink.created_at
      });
    }

    // Vérifier si la campagne est totalement validée
    const isValidated = await isCampaignFullyValidated(campaignId);
    
    if (!isValidated) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign is not fully validated yet. It must be approved by both human moderators and AI agent.',
          validated: false
        },
        { status: 403 }
      );
    }

    // Récupérer les informations du créateur
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        id,
        creator_type,
        creator_infos!inner(wallet_address)
      `)
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const creatorWallet = campaign.creator_infos?.wallet_address;
    if (!creatorWallet) {
      return NextResponse.json(
        { success: false, error: 'Creator wallet not found' },
        { status: 404 }
      );
    }

    // Générer un code court unique
    let shortCode = generateShortCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Vérifier l'unicité du code
    while (attempts < maxAttempts) {
      const { data: existingCode } = await supabase
        .from('campaign_short_links')
        .select('id')
        .eq('short_code', shortCode)
        .single();

      if (!existingCode) {
        break; // Code unique trouvé
      }

      shortCode = generateShortCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate unique short code' },
        { status: 500 }
      );
    }

    // Construire l'URL complète de redirection vers la page de completion
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.winstory.io';
    const fullUrl = `${baseUrl}/completion?campaignId=${campaignId}`;

    // Créer le lien court
    const { data: newLink, error: insertError } = await supabase
      .from('campaign_short_links')
      .insert({
        campaign_id: campaignId,
        short_code: shortCode,
        full_url: fullUrl,
        creator_wallet: creatorWallet,
        creator_type: campaign.creator_type
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating short link:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create short link' },
        { status: 500 }
      );
    }

    const shortUrl = `${baseUrl}/c/${shortCode}`;

    return NextResponse.json({
      success: true,
      shortCode: newLink.short_code,
      shortUrl,
      fullUrl: newLink.full_url,
      clicksCount: newLink.clicks_count,
      createdAt: newLink.created_at
    });

  } catch (error: any) {
    console.error('Error in short-link API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns/short-link
 * Crée ou met à jour un lien court (pour usage interne)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'campaignId is required' },
        { status: 400 }
      );
    }

    // Vérifier si la campagne est totalement validée
    const isValidated = await isCampaignFullyValidated(campaignId);
    
    if (!isValidated) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign is not fully validated yet',
          validated: false
        },
        { status: 403 }
      );
    }

    // Utiliser la même logique que GET pour créer/récupérer le lien
    const getResponse = await GET(new NextRequest(`${request.url}?campaignId=${campaignId}`));
    return getResponse;

  } catch (error: any) {
    console.error('Error in short-link POST API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

