/**
 * Transformateurs pour convertir les données de l'API vers les types de l'interface
 */

import { ModerationCampaign, ModerationProgress, CampaignContent, CreatorInfo, CampaignRewards, CampaignMetadata } from './types';

/**
 * Transforme une campagne de l'API Prisma vers ModerationCampaign
 */
export function transformCampaignFromAPI(apiCampaign: any): ModerationCampaign {
  // Transformer le progress (gérer snake_case de Prisma)
  const progress: ModerationProgress = apiCampaign.progress ? {
    id: apiCampaign.progress.id || '',
    campaignId: apiCampaign.id,
    stakersRequired: apiCampaign.progress.stakersRequired || 22,
    stakers: apiCampaign.progress.total_stakers || apiCampaign.progress.active_stakers || apiCampaign.progress.totalStakers || apiCampaign.progress.activeStakers || 0,
    stakedAmount: Number(apiCampaign.progress.staking_pool_total || apiCampaign.progress.stakingPoolTotal || 0),
    mintPrice: Number(apiCampaign.progress.mint_price || apiCampaign.progress.mintPrice || 0),
    validVotes: apiCampaign.progress.valid_votes || apiCampaign.progress.validVotes || 0,
    refuseVotes: apiCampaign.progress.refuse_votes || apiCampaign.progress.refuseVotes || 0,
    totalVotes: apiCampaign.progress.total_votes || apiCampaign.progress.totalVotes || 0,
    averageScore: Number(apiCampaign.progress.current_score || apiCampaign.progress.currentScore || 0),
    completionScores: [], // À récupérer séparément si nécessaire
    stakeYes: Number(apiCampaign.progress.stake_yes || apiCampaign.progress.stakeYes || 0),
    stakeNo: Number(apiCampaign.progress.stake_no || apiCampaign.progress.stakeNo || 0),
  } : {
    id: '',
    campaignId: apiCampaign.id,
    stakersRequired: 22,
    stakers: 0,
    stakedAmount: 0,
    mintPrice: 0,
    validVotes: 0,
    refuseVotes: 0,
    totalVotes: 0,
    averageScore: 0,
    completionScores: [],
    stakeYes: 0,
    stakeNo: 0,
  };

  // Transformer le content (gérer snake_case de Prisma)
  const content: CampaignContent = apiCampaign.content ? {
    id: apiCampaign.content.id || '',
    campaignId: apiCampaign.id,
    videoUrl: apiCampaign.content.video_url || apiCampaign.content.videoUrl || '',
    videoOrientation: (apiCampaign.content.video_orientation || apiCampaign.content.videoOrientation || 'horizontal') as 'horizontal' | 'vertical',
    startingStory: apiCampaign.content.starting_story || apiCampaign.content.startingStory || '',
    guidelines: apiCampaign.content.guidelines || '',
  } : {
    id: '',
    campaignId: apiCampaign.id,
    videoUrl: '',
    videoOrientation: 'horizontal',
    startingStory: '',
    guidelines: '',
  };

  // Transformer creatorInfo (gérer snake_case de Prisma)
  const creatorInfo: CreatorInfo = apiCampaign.creatorInfo ? {
    id: apiCampaign.creatorInfo.id || '',
    campaignId: apiCampaign.id,
    companyName: apiCampaign.creatorInfo.company_name || apiCampaign.creatorInfo.companyName || null,
    agencyName: apiCampaign.creatorInfo.agency_name || apiCampaign.creatorInfo.agencyName || null,
    walletAddress: apiCampaign.creatorInfo.wallet_address || apiCampaign.creatorInfo.walletAddress || '',
    email: apiCampaign.creatorInfo.email || null,
  } : {
    id: '',
    campaignId: apiCampaign.id,
    walletAddress: apiCampaign.originalCreatorWallet || '',
  };

  // Transformer metadata (gérer snake_case de Prisma)
  const metadata: CampaignMetadata = apiCampaign.metadata ? {
    id: apiCampaign.metadata.id || '',
    campaignId: apiCampaign.id,
    totalCompletions: apiCampaign.metadata.total_completions || apiCampaign.metadata.totalCompletions || 0,
    tags: Array.isArray(apiCampaign.metadata.tags) ? apiCampaign.metadata.tags : [],
  } : {
    id: '',
    campaignId: apiCampaign.id,
    totalCompletions: 0,
    tags: [],
  };

  // Transformer rewards (peut être un tableau ou un objet, gérer snake_case)
  let rewards: CampaignRewards | undefined = undefined;
  if (apiCampaign.rewards) {
    if (Array.isArray(apiCampaign.rewards) && apiCampaign.rewards.length > 0) {
      const standardReward = apiCampaign.rewards.find((r: any) => 
        r.reward_tier === 'standard' || r.rewardTier === 'standard'
      );
      const premiumReward = apiCampaign.rewards.find((r: any) => 
        r.reward_tier === 'premium' || r.rewardTier === 'premium'
      );
      rewards = {
        id: standardReward?.id || premiumReward?.id || '',
        campaignId: apiCampaign.id,
        standardReward: standardReward?.reward_type || standardReward?.rewardType || undefined,
        premiumReward: premiumReward?.reward_type || premiumReward?.rewardType || undefined,
        completionPrice: undefined, // À récupérer depuis pricing config si nécessaire
      };
    }
  }

  // Construire la campagne finale
  const campaign: ModerationCampaign = {
    id: apiCampaign.id,
    title: apiCampaign.title || 'Untitled Campaign',
    description: apiCampaign.description || '',
    status: apiCampaign.status || 'PENDING_MODERATION',
    type: apiCampaign.type || 'INITIAL',
    creatorType: apiCampaign.creator_type || apiCampaign.creatorType || 'INDIVIDUAL_CREATORS',
    createdAt: apiCampaign.created_at ? new Date(apiCampaign.created_at) : (apiCampaign.createdAt ? new Date(apiCampaign.createdAt) : new Date()),
    updatedAt: apiCampaign.updated_at ? new Date(apiCampaign.updated_at) : (apiCampaign.updatedAt ? new Date(apiCampaign.updatedAt) : new Date()),
    creatorInfo,
    content,
    rewards,
    metadata,
    progress,
    // Propriétés supplémentaires pour les complétions (gérer snake_case)
    originalCampaignCompanyName: apiCampaign.original_campaign_company_name || apiCampaign.originalCampaignCompanyName || undefined,
    originalCreatorWallet: apiCampaign.original_creator_wallet || apiCampaign.originalCreatorWallet || undefined,
    completerWallet: apiCampaign.completer_wallet || apiCampaign.completerWallet || undefined,
  };

  return campaign;
}

