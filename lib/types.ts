// Types pour la modération des campagnes (correspondant au schéma Prisma)

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  status: CampaignStatus;
  type: CampaignType;
  creatorType: CreatorType;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  creatorInfo?: CreatorInfo;
  content?: CampaignContent;
  rewards?: CampaignRewards;
  metadata?: CampaignMetadata;
  progress?: ModerationProgress;
  moderations?: ModerationSession[];
}

export interface CreatorInfo {
  id: string;
  campaignId: string;
  companyName?: string;
  agencyName?: string;
  walletAddress: string;
  email?: string;
}

export interface CampaignContent {
  id: string;
  campaignId: string;
  videoUrl: string;
  startingStory: string;
  guidelines?: string;
}

export interface CampaignRewards {
  id: string;
  campaignId: string;
  standardReward?: string;
  premiumReward?: string;
  completionPrice?: string;
}

export interface CampaignMetadata {
  id: string;
  campaignId: string;
  totalCompletions: number;
  tags: string[];
}

export interface ModerationProgress {
  id: string;
  campaignId: string;
  stakersRequired: number;
  stakers: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
  averageScore: number;
  completionScores: number[];
}

export interface ModerationSession {
  id: string;
  campaignId: string;
  moderatorWallet: string;
  isEligible: boolean;
  startedAt: Date;
  completedAt?: Date;
  
  // Propriétés ajoutées pour l'interface de modération
  campaign: ModerationCampaign;
  progress: ModerationProgress;
}

// Enums Prisma
export type CampaignStatus = 'PENDING_MODERATION' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type CampaignType = 'INITIAL' | 'COMPLETION';
export type CreatorType = 'B2C_AGENCIES' | 'INDIVIDUAL_CREATORS' | 'FOR_B2C' | 'FOR_INDIVIDUALS';

// Types familiers pour l'interface utilisateur
export type UIFriendlyCreatorType = 'b2c' | 'agency' | 'individual';
export type UIFriendlyCampaignType = 'initial' | 'completion';

// Fonctions de mapping entre types Prisma et types familiers
export const mapPrismaToUI = {
  creatorType: (prismaType: CreatorType): UIFriendlyCreatorType => {
    switch (prismaType) {
      case 'B2C_AGENCIES':
      case 'FOR_B2C':
        return 'b2c';
      case 'INDIVIDUAL_CREATORS':
      case 'FOR_INDIVIDUALS':
        return 'individual';
      default:
        return 'individual';
    }
  },
  
  campaignType: (prismaType: CampaignType): UIFriendlyCampaignType => {
    switch (prismaType) {
      case 'INITIAL':
        return 'initial';
      case 'COMPLETION':
        return 'completion';
      default:
        return 'initial';
    }
  }
};

export const mapUIToPrisma = {
  creatorType: (uiType: UIFriendlyCreatorType, campaignType: UIFriendlyCampaignType): CreatorType => {
    if (uiType === 'b2c') {
      return campaignType === 'initial' ? 'B2C_AGENCIES' : 'FOR_B2C';
    } else {
      return campaignType === 'initial' ? 'INDIVIDUAL_CREATORS' : 'FOR_INDIVIDUALS';
    }
  },
  
  campaignType: (uiType: UIFriendlyCampaignType): CampaignType => {
    return uiType === 'initial' ? 'INITIAL' : 'COMPLETION';
  }
};

// Types pour l'interface de modération (avec mapping automatique)
export interface ModerationCampaign {
  id: string;
  title: string;
  description?: string;
  status: CampaignStatus;
  type: CampaignType;
  creatorType: CreatorType;
  createdAt: Date;
  updatedAt: Date;
  creatorInfo: CreatorInfo;
  content: CampaignContent;
  rewards?: CampaignRewards;
  metadata: CampaignMetadata;
  progress: ModerationProgress;
  // Propriétés supplémentaires pour les complétions
  originalCampaign?: {
    companyName?: string;
    walletAddress: string;
  };
  originalCreator?: {
    walletAddress: string;
  };
  completerWallet?: string;
}

// Fonctions utilitaires pour le mapping
export const getUICreatorType = (campaign: ModerationCampaign): UIFriendlyCreatorType => {
  return mapPrismaToUI.creatorType(campaign.creatorType);
};

export const getUICampaignType = (campaign: ModerationCampaign): UIFriendlyCampaignType => {
  return mapPrismaToUI.campaignType(campaign.type);
};

export interface ModerationProgress {
  stakersRequired: number;
  stakers: number;
  stakedAmount: number;
  mintPrice: number;
  validVotes: number;
  refuseVotes: number;
  totalVotes: number;
  averageScore: number;
  completionScores: number[];
}

export interface ModerationSession {
  campaign: ModerationCampaign;
  progress: ModerationProgress;
  isEligible: boolean;
}
