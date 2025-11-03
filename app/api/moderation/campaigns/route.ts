import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const DEBUG = process.env.DEBUG_MODERATION_API === 'true' && process.env.NODE_ENV !== 'production';
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'INITIAL' | 'COMPLETION' | null;
    const creatorType = searchParams.get('creatorType') as string | null;
    const moderatorWallet = searchParams.get('moderatorWallet') as string | null;

    if (DEBUG) console.log('🔍 [MODERATION API] Fetching campaigns for moderation...', { type, creatorType, moderatorWallet });

    // Construire la requête Supabase
    let query = supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        status,
        type,
        creator_type,
        original_creator_wallet,
        original_campaign_company_name,
        completer_wallet,
        created_at,
        updated_at,
        creator_infos (
          company_name,
          agency_name,
          wallet_address,
          email
        ),
        campaign_contents (
          video_url,
          video_orientation,
          starting_story,
          guidelines
        ),
        campaign_rewards_configs (
          reward_tier,
          reward_type,
          is_configured
        ),
        campaign_metadata (
          total_completions,
          tags
        ),
        campaign_pricing_configs (
          unit_value,
          net_profit,
          max_completions,
          base_mint,
          is_free_reward,
          no_reward,
          ai_option,
          no_reward_option
        ),
        moderation_progress (
          total_stakers,
          active_stakers,
          total_votes,
          valid_votes,
          refuse_votes,
          abstain_votes,
          current_score,
          required_score,
          staking_pool_total,
          moderation_level,
          blockchain_validation_type,
          super_moderator_override,
          winstory_intervention,
          intervention_reason,
          last_vote_at,
          moderation_deadline
        )
      `)
      .eq('status', 'PENDING_MODERATION')
      .order('created_at', { ascending: false });

    // Ajouter les filtres optionnels
    if (type) {
      query = query.eq('type', type);
    }

    if (creatorType) {
      // Mapper le creatorType de l'UI vers la base de données
      const creatorTypeMap: Record<string, string> = {
        'individual-creators': 'INDIVIDUAL_CREATORS',
        'b2c-agencies': 'B2C_AGENCIES',
        'for-b2c': 'FOR_B2C'
      };
      const dbCreatorType = creatorTypeMap[creatorType] || creatorType;
      query = query.eq('creator_type', dbCreatorType);
    }

    // Filtrer les campagnes où le modérateur est le créateur ou le compléteur
    if (moderatorWallet) {
      // Pour les campagnes INITIAL : exclure celles créées par le modérateur
      // Pour les campagnes COMPLETION : exclure celles complétées par le modérateur
      if (type === 'INITIAL') {
        // Exclure les campagnes où original_creator_wallet = moderatorWallet
        query = query.neq('original_creator_wallet', moderatorWallet);
        if (DEBUG) console.log('🚫 [MODERATION API] Filtering out INITIAL campaigns created by moderator:', moderatorWallet);
      } else if (type === 'COMPLETION') {
        // Exclure les campagnes où completer_wallet = moderatorWallet
        query = query.neq('completer_wallet', moderatorWallet);
        if (DEBUG) console.log('🚫 [MODERATION API] Filtering out COMPLETION campaigns completed by moderator:', moderatorWallet);
      } else {
        // Si pas de type spécifié, exclure les deux cas avec une condition OR
        // Utiliser .or() pour exclure si original_creator_wallet OU completer_wallet correspond
        // La syntaxe Supabase : .not('original_creator_wallet', 'eq', moderatorWallet).not('completer_wallet', 'eq', moderatorWallet)
        // Mais cela ne fonctionne pas directement, donc on filtre après récupération
        if (DEBUG) console.log('🚫 [MODERATION API] Will filter out campaigns created or completed by moderator:', moderatorWallet);
      }
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('❌ [MODERATION API] Error fetching campaigns:', error);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }

    // Filtrer les campagnes si le modérateur est spécifié et le type n'est pas défini
    // (pour exclure celles où le modérateur est le créateur OU le compléteur)
    let filteredCampaigns = campaigns || [];
    if (moderatorWallet && !type) {
      filteredCampaigns = filteredCampaigns.filter((campaign: any) => {
        const isCreator = campaign.original_creator_wallet?.toLowerCase() === moderatorWallet.toLowerCase();
        const isCompleter = campaign.completer_wallet?.toLowerCase() === moderatorWallet.toLowerCase();
        // Exclure si le modérateur est le créateur OU le compléteur
        return !isCreator && !isCompleter;
      });
      if (DEBUG) console.log(`🚫 [MODERATION API] Filtered ${(campaigns || []).length - filteredCampaigns.length} campaigns where moderator is creator or completer`);
    }

    // Transformer les données Supabase (tableaux) vers le format attendu (objets)
    // et mapper les noms snake_case vers camelCase pour compatibilité avec transformCampaignFromAPI
    const transformedCampaigns = filteredCampaigns.map((campaign: any) => {
      // Supabase retourne les relations comme des tableaux, on prend le premier élément
      const creatorInfo = Array.isArray(campaign.creator_infos) ? campaign.creator_infos[0] : campaign.creator_infos;
      const content = Array.isArray(campaign.campaign_contents) ? campaign.campaign_contents[0] : campaign.campaign_contents;
      const metadata = Array.isArray(campaign.campaign_metadata) ? campaign.campaign_metadata[0] : campaign.campaign_metadata;
      const pricingConfig = Array.isArray(campaign.campaign_pricing_configs) ? campaign.campaign_pricing_configs[0] : campaign.campaign_pricing_configs;
      const progress = Array.isArray(campaign.moderation_progress) ? campaign.moderation_progress[0] : campaign.moderation_progress;
      const rewards = campaign.campaign_rewards_configs || [];

      return {
        ...campaign,
        // Garder les noms originaux pour la transformation
        creator_infos: creatorInfo,
        creatorInfo: creatorInfo, // Alias pour transformCampaignFromAPI
        campaign_contents: content,
        content: content, // Alias pour transformCampaignFromAPI
        campaign_metadata: metadata,
        metadata: metadata, // Alias pour transformCampaignFromAPI
        campaign_pricing_configs: pricingConfig,
        pricingConfig: pricingConfig, // Alias pour accès direct
        moderation_progress: progress,
        progress: progress, // Alias pour transformCampaignFromAPI
        campaign_rewards_configs: rewards,
        rewards: rewards, // Alias pour transformCampaignFromAPI
      };
    });

    // Filtrer les campagnes qui ont un progrès de modération (doit exister)
    // ET qui ont une vidéo réelle (pas winstory_delegated) si ai_option est activé
    let excludedMissingVideo = 0;
    let excludedIndexedDb = 0;
    let excludedDelegated = 0;

    const eligibleCampaigns = transformedCampaigns.filter((campaign: any) => {
      // Vérifier que le progrès de modération existe
      if (!campaign.moderation_progress || campaign.moderation_progress === null || campaign.moderation_progress === undefined) {
        return false;
      }
      
      // Récupérer le contenu et la configuration de pricing
      const content = campaign.content || campaign.campaign_contents;
      const pricingConfig = campaign.pricingConfig || campaign.campaign_pricing_configs;
      const videoUrl = content?.video_url;
      const aiOption = pricingConfig?.ai_option;
      
      // Si ai_option est true (Winstory crée le film), s'assurer que la vidéo existe vraiment
      if (aiOption === true) {
        // Exclure si la vidéo est encore déléguée à Winstory (pas encore créée)
        if (!videoUrl || videoUrl === 'winstory_delegated' || videoUrl === 'null' || videoUrl === null) {
          excludedDelegated++;
          return false;
        }
        // Vérifier que ce n'est pas un placeholder
        if (typeof videoUrl === 'string' && (videoUrl.startsWith('indexeddb:') || !videoUrl.startsWith('http'))) {
          excludedIndexedDb++;
          return false;
        }
      }
      
      // Pour toutes les campagnes, exclure celles avec video_url = 'winstory_delegated' sans vérifier ai_option
      // (au cas où ai_option n'est pas correctement défini)
      if (videoUrl === 'winstory_delegated' || videoUrl === null || videoUrl === 'null' || !videoUrl) {
        // Si c'est une campagne INITIAL sans vidéo valide, l'exclure
        if (campaign.type === 'INITIAL') {
          excludedMissingVideo++;
          return false;
        }
      }
      
      return true;
    });

    if (DEBUG) {
      console.log(`✅ [MODERATION API] Found ${eligibleCampaigns.length} eligible campaigns out of ${filteredCampaigns.length} filtered (${campaigns?.length || 0} total before filtering)`);
      console.log(`   Excluded: delegated=${excludedDelegated}, indexeddb=${excludedIndexedDb}, missingVideo=${excludedMissingVideo}`);
    }

    return NextResponse.json({
      success: true,
      data: eligibleCampaigns,
      count: eligibleCampaigns.length,
      totalCampaigns: campaigns?.length || 0,
      eligibleCampaigns: eligibleCampaigns.length
    });

  } catch (error) {
    console.error('❌ [MODERATION API] Error fetching campaigns:', error);
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

    if (!campaignId || !moderatorWallet) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'campaignId and moderatorWallet are required' 
        },
        { status: 400 }
      );
    }

    console.log('🔍 [MODERATION API] Creating moderation session...', { campaignId, moderatorWallet });

    // Créer une nouvelle session de modération dans Supabase
    const { data: moderationSession, error } = await supabase
      .from('moderation_sessions')
      .insert({
        campaign_id: campaignId,
        moderator_wallet: moderatorWallet,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [MODERATION API] Error creating moderation session:', error);
      // Si c'est une erreur de contrainte unique (session déjà existe), c'est OK
      if (error.code === '23505') {
        // Récupérer la session existante
        const { data: existingSession } = await supabase
          .from('moderation_sessions')
          .select()
          .eq('campaign_id', campaignId)
          .eq('moderator_wallet', moderatorWallet)
          .single();
        
        return NextResponse.json({
          success: true,
          data: existingSession,
          message: 'Moderation session already exists'
        });
      }
      throw new Error(`Failed to create moderation session: ${error.message}`);
    }

    console.log('✅ [MODERATION API] Moderation session created');

    return NextResponse.json({
      success: true,
      data: moderationSession
    });

  } catch (error) {
    console.error('❌ [MODERATION API] Error creating moderation session:', error);
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