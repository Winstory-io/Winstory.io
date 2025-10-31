import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour s'assurer que l'utilisateur existe dans toutes les tables nécessaires
async function ensureUserExists(walletAddress: string, email?: string) {
  console.log('🔍 Ensuring user exists for wallet:', walletAddress);
  
  try {
    // 1. Vérifier si l'utilisateur existe dans user_profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('wallet_address')
      .eq('wallet_address', walletAddress)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking user profile:', profileError);
      throw new Error(`Failed to check user profile: ${profileError.message}`);
    }

    // Créer le profil utilisateur s'il n'existe pas
    if (!existingProfile) {
      console.log('📝 Creating user profile for:', walletAddress);
      const { error: createProfileError } = await supabase
        .from('user_profiles')
        .insert({
          wallet_address: walletAddress,
          email: email || null,
          display_name: email ? email.split('@')[0] : `User_${walletAddress.slice(-6)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createProfileError) {
        // Tolérer clé dupliquée (course condition) et continuer
        if ((createProfileError as any).code === '23505') {
          console.warn('⚠️ User profile already exists (race), continuing...');
        } else {
          console.error('Error creating user profile:', createProfileError);
          throw new Error(`Failed to create user profile: ${createProfileError.message}`);
        }
      } else {
        console.log('✅ User profile created');
      }
    } else {
      console.log('✅ User profile already exists');
    }

    // 2. Vérifier si l'utilisateur existe dans user_dashboard_stats
    const { data: existingStats, error: statsError } = await supabase
      .from('user_dashboard_stats')
      .select('user_wallet')
      .eq('user_wallet', walletAddress)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error checking user stats:', statsError);
      throw new Error(`Failed to check user stats: ${statsError.message}`);
    }

    // Créer les statistiques utilisateur s'il n'existe pas
    if (!existingStats) {
      console.log('📊 Creating user dashboard stats for:', walletAddress);
      const { error: createStatsError } = await supabase
        .from('user_dashboard_stats')
        .insert({
          user_wallet: walletAddress,
          total_creations: 0,
          total_completions: 0,
          total_moderations: 0,
          total_winc_earned: 0,
          total_winc_lost: 0,
          total_xp_earned: 0,
          current_level: 1,
          last_updated: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createStatsError) {
        // Tolérer clé dupliquée (course condition) et continuer
        if ((createStatsError as any).code === '23505') {
          console.warn('⚠️ User stats already exist (race), continuing...');
        } else {
          console.error('Error creating user stats:', createStatsError);
          throw new Error(`Failed to create user stats: ${createStatsError.message}`);
        }
      } else {
        console.log('✅ User dashboard stats created');
      }
    } else {
      console.log('✅ User dashboard stats already exist');
    }

    // 3. Vérifier si l'utilisateur existe dans user_xp_progression
    const { data: existingXp, error: xpError } = await supabase
      .from('user_xp_progression')
      .select('user_wallet')
      .eq('user_wallet', walletAddress)
      .single();

    if (xpError && xpError.code !== 'PGRST116') {
      console.error('Error checking user XP:', xpError);
      throw new Error(`Failed to check user XP: ${xpError.message}`);
    }

    // Créer la progression XP s'il n'existe pas
    if (!existingXp) {
      console.log('🎮 Creating user XP progression for:', walletAddress);
      const { error: createXpError } = await supabase
        .from('user_xp_progression')
        .insert({
          user_wallet: walletAddress,
          total_xp: 0,
          current_level: 1,
          xp_to_next_level: 100,
          achievements: [],
          last_activity: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createXpError) {
        // Tolérer clé dupliquée (course condition) et continuer
        if ((createXpError as any).code === '23505') {
          console.warn('⚠️ User XP already exists (race), continuing...');
        } else {
          console.error('Error creating user XP:', createXpError);
          throw new Error(`Failed to create user XP: ${createXpError.message}`);
        }
      } else {
        console.log('✅ User XP progression created');
      }
    } else {
      console.log('✅ User XP progression already exists');
    }

    console.log('✅ User setup completed for:', walletAddress);
    
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    throw error;
  }
}

interface CampaignData {
  user: {
    email: string;
  };
  company: {
    name: string;
  };
  story: {
    title: string;
    startingStory: string;
    guideline: string;
  };
  film: {
    videoId?: string;
    fileName?: string;
    fileSize?: number;
    format?: string;
    aiRequested?: boolean;
    s3VideoUrl?: string; // URL de la vidéo uploadée sur S3
    delegatedToWinstory?: boolean;
  };
  completions?: {
    wincValue: number;
    maxCompletions: number;
  };
  roiData?: {
    unitValue: number;
    netProfit: number;
    maxCompletions: number;
    isFreeReward?: boolean;
    noReward?: boolean;
  };
  standardToken?: any;
  standardItem?: any;
  premiumToken?: any;
  premiumItem?: any;
  campaignType: 'B2C' | 'AGENCY_B2C' | 'INDIVIDUAL';
  walletAddress: string;
  walletSource: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: CampaignData = await request.json();
    
    console.log('=== CREATING CAMPAIGN IN DATABASE ===');
    console.log('Campaign Type:', data.campaignType);
    console.log('Wallet Address:', data.walletAddress);
    console.log('Company Name:', data.company?.name);
    console.log('Story Title:', data.story?.title);
    console.log('=== PREMIUM OPTIONS CHOSEN ===');
    console.log('Video ID (custom video):', data.film?.videoId ? 'YES' : 'NO - Winstory creates film');
    console.log('Has Custom Rewards:', (data.standardToken || data.standardItem || data.premiumToken || data.premiumItem) ? 'YES' : 'NO - Winstory manages rewards');
    console.log('Video File Name:', data.film?.fileName || 'N/A');
    console.log('AI Requested:', data.film?.aiRequested || false);
    
    const hasRewards = data.standardToken || data.standardItem || data.premiumToken || data.premiumItem;
    const maxCompletions = !hasRewards ? 100 : (data.roiData?.maxCompletions || data.completions?.maxCompletions || 0);
    console.log('Max Completions:', maxCompletions, !hasRewards ? '(Limited to 100 for complete ranking)' : '(Custom)');

    // TODO: En production, vérifier le statut de paiement avant de créer la campagne
    // const paymentStatus = await checkPaymentStatus(data.paymentId);
    // if (!paymentStatus.confirmed) {
    //   return NextResponse.json(
    //     { success: false, error: 'Payment not confirmed' },
    //     { status: 402 }
    //   );
    // }

    // Vérifier et créer les enregistrements utilisateur nécessaires
    await ensureUserExists(data.walletAddress, data.user?.email);

    // Ensure user_dashboard_stats is properly initialized to prevent trigger conflicts
    console.log('🔧 Ensuring user dashboard stats is properly initialized...');
    const { error: initStatsError } = await supabase
      .from('user_dashboard_stats')
      .upsert({
        user_wallet: data.walletAddress,
        total_creations: 0,
        total_completions: 0,
        total_moderations: 0,
        total_winc_earned: 0,
        total_winc_lost: 0,
        total_xp_earned: 0,
        current_level: 1,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_wallet'
      });

    if (initStatsError) {
      console.error('Error initializing user stats:', initStatsError);
      throw new Error(`Failed to initialize user stats: ${initStatsError.message}`);
    }
    console.log('✅ User dashboard stats initialized');

    // Générer un ID unique pour la campagne
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Déterminer le type de créateur et le statut
    let creatorType: string;
    let campaignStatus = 'PENDING_MODERATION';
    
    switch (data.campaignType) {
      case 'B2C':
        creatorType = 'FOR_B2C';
        break;
      case 'AGENCY_B2C':
        creatorType = 'B2C_AGENCIES';
        break;
      case 'INDIVIDUAL':
        creatorType = 'INDIVIDUAL_CREATORS';
        break;
      default:
        creatorType = 'INDIVIDUAL_CREATORS';
    }

    // IMPORTANT: Keep the original wallet address to track campaigns by the same user
    // Previous workaround added timestamp which prevented tracking multiple campaigns from same wallet
    const originalWalletAddress = data.walletAddress;
    
    console.log('💰 Wallet address for campaign:', originalWalletAddress);

    // 1. Créer la campagne principale avec gestion d'erreur pour le trigger
    console.log('🎯 Creating campaign with trigger error handling...');
    let campaign;
    let campaignError;
    
    try {
      const result = await supabase
        .from('campaigns')
        .insert({
          id: campaignId,
          title: data.story?.title || 'Untitled Campaign',
          description: data.story?.startingStory || '',
          status: campaignStatus,
          type: 'INITIAL',
          creator_type: creatorType,
          original_campaign_company_name: data.company?.name || null,
          original_creator_wallet: originalWalletAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      campaign = result.data;
      campaignError = result.error;
    } catch (triggerError) {
      console.warn('⚠️ Trigger error caught, but campaign might still be created:', triggerError);
      // Check if campaign was actually created despite the trigger error
      const { data: existingCampaign } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (existingCampaign) {
        console.log('✅ Campaign was created despite trigger error');
        campaign = existingCampaign;
        campaignError = null;
      } else {
        campaignError = triggerError;
      }
    }

    if (campaignError) {
      console.error('Error creating campaign:', campaignError);
      throw new Error(`Failed to create campaign: ${campaignError.message}`);
    }

    console.log('✅ Campaign created:', campaign.id);

    // 2. Créer les informations du créateur
    const { error: creatorError } = await supabase
      .from('creator_infos')
      .insert({
        campaign_id: campaignId,
        company_name: data.company?.name || null,
        agency_name: data.campaignType === 'AGENCY_B2C' ? data.company?.name : null,
        wallet_address: originalWalletAddress,
        email: data.user?.email || null
      });

    if (creatorError) {
      console.error('Error creating creator info:', creatorError);
      throw new Error(`Failed to create creator info: ${creatorError.message}`);
    }

    console.log('✅ Creator info created');

    // 3. Créer le contenu de la campagne
    // Priorité : S3 URL > IndexedDB > Délégation Winstory
    let videoUrl: string;
    
    if (data.film?.s3VideoUrl) {
      // Si une URL S3 est fournie (vidéo uploadée vers S3), l'utiliser en priorité
      videoUrl = data.film.s3VideoUrl;
      console.log('✅ Using S3 video URL:', videoUrl);
    } else if (data.film?.videoId) {
      // Sinon, utiliser l'ID IndexedDB (ancien système)
      videoUrl = `indexeddb:${data.film.videoId}`;
      console.log('⚠️ Using IndexedDB video ID (legacy):', videoUrl);
    } else if (data.film?.delegatedToWinstory) {
      // Ou marquer comme délégué à Winstory
      videoUrl = 'winstory_delegated';
      console.log('📝 Video delegated to Winstory');
    } else {
      // Valeur par défaut si aucune vidéo
      videoUrl = 'winstory_delegated';
      console.log('⚠️ No video provided, defaulting to winstory_delegated');
    }
    
    const { error: contentError } = await supabase
      .from('campaign_contents')
      .insert({
        campaign_id: campaignId,
        video_url: videoUrl,
        video_orientation: data.film?.format === '9:16' ? 'vertical' : 'horizontal',
        starting_story: data.story?.startingStory || '',
        guidelines: data.story?.guideline || ''
      });

    if (contentError) {
      console.error('Error creating campaign content:', contentError);
      throw new Error(`Failed to create campaign content: ${contentError.message}`);
    }

    console.log('✅ Campaign content created');

    // 4. Créer les récompenses selon la structure de campaign_rewards_configs
    
    if (hasRewards) {
      // Créer les configurations de récompenses standard et premium
      const rewardsToInsert = [];
      
      // Prioriser les tokens sur les items pour éviter les conflits de contrainte unique
      if (data.standardToken || data.standardItem) {
        rewardsToInsert.push({
          campaign_id: campaignId,
          reward_tier: 'standard',
          reward_type: data.standardToken ? 'token' : 'item',
          is_configured: true
        });
      }
      
      if (data.premiumToken || data.premiumItem) {
        rewardsToInsert.push({
          campaign_id: campaignId,
          reward_tier: 'premium',
          reward_type: data.premiumToken ? 'token' : 'item',
          is_configured: true
        });
      }
      
      if (rewardsToInsert.length > 0) {
        const { error: rewardsError } = await supabase
          .from('campaign_rewards_configs')
          .insert(rewardsToInsert);

        if (rewardsError) {
          console.error('Error creating campaign rewards:', rewardsError);
          throw new Error(`Failed to create campaign rewards: ${rewardsError.message}`);
        }
        
        console.log('✅ Campaign rewards created');
      }
    } else {
      // Créer une configuration standard pour indiquer que Winstory gère les récompenses
      const { error: rewardsError } = await supabase
        .from('campaign_rewards_configs')
        .insert({
          campaign_id: campaignId,
          reward_tier: 'standard',
          reward_type: 'token', // Type par défaut pour les récompenses gérées par Winstory
          is_configured: false
        });

      if (rewardsError) {
        console.error('Error creating campaign rewards:', rewardsError);
        throw new Error(`Failed to create campaign rewards: ${rewardsError.message}`);
      }
      
      console.log('✅ Campaign rewards created (Winstory managed)');
    }

    // 5. Créer les métadonnées de la campagne
    // Si Winstory gère les récompenses, limiter à 100 complétions pour le classement complet
    
    const { error: metadataError } = await supabase
      .from('campaign_metadata')
      .insert({
        campaign_id: campaignId,
        total_completions: maxCompletions,
        tags: [
          data.campaignType,
          data.film?.aiRequested ? 'ai_generated' : 'manual',
          !data.film?.videoId ? 'winstory_video' : 'custom_video',
          !hasRewards ? 'winstory_rewards' : 'custom_rewards',
          !hasRewards ? 'limited_100_completions' : 'custom_completions',
          // Métadonnées des options payantes
          `wallet_source:${data.walletSource || 'unknown'}`,
          data.film?.fileName ? `video_file:${data.film.fileName}` : null,
          data.film?.fileSize ? `video_size:${data.film.fileSize}` : null
        ].filter(Boolean)
      });

    if (metadataError) {
      console.error('Error creating campaign metadata:', metadataError);
      throw new Error(`Failed to create campaign metadata: ${metadataError.message}`);
    }

    console.log('✅ Campaign metadata created');

    // 6. Créer la configuration des prix et ROI
    const { error: pricingError } = await supabase
      .from('campaign_pricing_configs')
      .insert({
        campaign_id: campaignId,
        unit_value: data.roiData?.unitValue || data.completions?.wincValue || null,
        net_profit: data.roiData?.netProfit || null,
        max_completions: maxCompletions, // Utiliser la même logique que campaign_metadata
        is_free_reward: data.roiData?.isFreeReward || false,
        no_reward: data.roiData?.noReward || false,
        base_mint: data.roiData?.unitValue || data.completions?.wincValue || null,
        ai_option: data.film?.aiRequested || false,
        no_reward_option: !hasRewards // Si Winstory gère les récompenses
      });

    if (pricingError) {
      console.error('Error creating campaign pricing config:', pricingError);
      throw new Error(`Failed to create campaign pricing config: ${pricingError.message}`);
    }

    console.log('✅ Campaign pricing config created');

    // 7. Créer le progrès de modération initial
    const { error: progressError } = await supabase
      .from('moderation_progress')
      .insert({
        campaign_id: campaignId,
        total_stakers: 0,
        active_stakers: 0,
        total_votes: 0,
        valid_votes: 0,
        refuse_votes: 0,
        abstain_votes: 0,
        current_score: 0,
        required_score: 7.0,
        staking_pool_total: 0,
        moderation_level: 'standard',
        blockchain_validation_type: 'free_transaction',
        super_moderator_override: false,
        winstory_intervention: false,
        intervention_reason: null,
        last_vote_at: null,
        moderation_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 jours
      });

    if (progressError) {
      console.error('Error creating moderation progress:', progressError);
      throw new Error(`Failed to create moderation progress: ${progressError.message}`);
    }

    console.log('✅ Moderation progress created');

    // 8. Insérer dans les logs de création (structure correcte)
    const logData = {
      submission_timestamp_iso: new Date().toISOString(),
      submission_timestamp_local: new Date().toLocaleString(),
      campaign_type: data.campaignType,
      wallet_address: originalWalletAddress,
      wallet_source: data.walletSource,
      user_email: data.user?.email || null,
      company_name: data.company?.name || null,
      story_title: data.story?.title || null,
      story_guideline: data.story?.guideline || null,
      film_video_id: data.film?.videoId || null,
      film_file_name: data.film?.fileName || null,
      film_format: data.film?.format || null,
      raw_payload: JSON.stringify(data) // Payload complet pour audit/debug
    };

    // Ajouter les colonnes spécifiques selon le type de campagne
    if (data.campaignType === 'B2C' || data.campaignType === 'AGENCY_B2C') {
      logData.b2c_currency = 'USD';
      logData.b2c_unit_value_usd = data.roiData?.unitValue || null;
      logData.b2c_net_profit_usd = data.roiData?.netProfit || null;
      logData.b2c_max_completions = maxCompletions;
      logData.b2c_is_free_reward = data.roiData?.isFreeReward || false;
      logData.b2c_is_no_reward = data.roiData?.noReward || false;
    } else if (data.campaignType === 'INDIVIDUAL') {
      logData.individual_currency = 'WINC';
      logData.individual_winc_value = data.completions?.wincValue || null;
      logData.individual_max_completions = data.completions?.maxCompletions || null;
      logData.individual_duration_days = data.economicData?.durationDays || null;
    }

    const { error: logError } = await supabase
      .from('campaign_creation_logs')
      .insert(logData);

    if (logError) {
      console.error('Error creating campaign log:', logError);
      // Ne pas faire échouer la création si les logs échouent
      console.warn('⚠️ Campaign created but log failed');
    } else {
      console.log('✅ Campaign creation log created');
    }

    console.log('=== CAMPAIGN CREATION COMPLETED ===');
    console.log('Campaign ID:', campaignId);
    console.log('Status:', campaignStatus);
    console.log('Creator Type:', creatorType);

    // ===================================
    // 9. AWARD XP FOR CAMPAIGN CREATION
    // ===================================
    console.log('🎯 [XP] Starting XP award for campaign creation...');
    try {
      // Determine mint value
      const mintValueUSD = data.roiData?.unitValue || 1000; // Default to 1000 USD for B2C/Agency
      const mintValueWINC = data.completions?.wincValue || data.economicData?.totalCost || mintValueUSD;
      
      // Determine options
      const winstoryCreatesVideo = !data.film?.videoId; // No videoId means Winstory creates
      const noRewards = !hasRewards; // No custom rewards means Winstory manages
      
      console.log('💰 [XP] Mint Value:', { mintValueUSD, mintValueWINC });
      console.log('⚙️ [XP] Options:', { winstoryCreatesVideo, noRewards });
      
      // Call XP award API
      const xpResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/xp/award-campaign-creation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userWallet: originalWalletAddress,
          campaignType: data.campaignType,
          campaignId: campaignId,
          mintValueUSD,
          options: {
            winstoryCreatesVideo,
            noRewards,
            mintValueWINC
          }
        })
      });

      if (xpResponse.ok) {
        const xpResult = await xpResponse.json();
        console.log('✅ [XP] Campaign creation XP awarded:', xpResult.data?.summary);
      } else {
        console.warn('⚠️ [XP] Failed to award XP, but campaign was created successfully');
      }
    } catch (xpError) {
      console.error('❌ [XP] Error awarding campaign creation XP:', xpError);
      // Don't fail the campaign creation if XP award fails
      console.warn('⚠️ [XP] Campaign created but XP award failed');
    }

    // ===================================
    // 10. REGISTER AGENCY B2C CLIENT (if applicable)
    // ===================================
    if (data.campaignType === 'AGENCY_B2C' && data.clientInfo?.contactEmail) {
      console.log('🏢 [XP] Registering Agency B2C client for future XP...');
      try {
        const clientResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/xp/agency-client`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'register',
            agencyWallet: originalWalletAddress,
            agencyEmail: data.agencyInfo?.email || data.user?.email || '',
            clientEmail: data.clientInfo.contactEmail,
            clientName: data.clientInfo.companyName || 'Client',
            campaignId: campaignId
          })
        });

        if (clientResponse.ok) {
          console.log('✅ [XP] Agency client registered for future XP award');
        } else {
          console.warn('⚠️ [XP] Failed to register agency client');
        }
      } catch (clientError) {
        console.error('❌ [XP] Error registering agency client:', clientError);
      }
    }

    return NextResponse.json({
      success: true,
      campaignId: campaignId,
      message: 'Campaign created successfully in database',
      data: {
        campaign,
        creatorType,
        status: campaignStatus
      }
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
