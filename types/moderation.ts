export interface ModerationStats {
  stakers: {
    current: number;
    required: number;
  };
  staking: {
    stakedAmount: number;
    mintPrice: number;
  };
  voting: {
    validVotes: number;
    refuseVotes: number;
    requiredRatio: number;
  };
}

export interface CompletionData {
  contentType: 'b2c' | 'agency' | 'individual';
  companyName?: string;
  agencyName?: string;
  campaignTitle: string;
  startingText: string;
  guideline: string;
  standardRewards: string;
  premiumRewards: string;
  completingText: string;
  videoUrl: string;
  usedScores: number[];
}

export interface ModerationData {
  userType: 'b2c' | 'agency' | 'individual';
  companyName?: string;
  agencyName?: string;
  walletAddress?: string;
  userName?: string;
  title: string;
  info: {
    startingText: string;
    guideline: string;
    standardRewards: string;
    premiumRewards: string;
    completionPrice: string;
    totalCompletions: number;
  };
  videoUrl: string;
  videoOrientation: 'horizontal' | 'vertical';
  startingText: string;
  guideline: string;
  standardRewards: string;
  premiumRewards: string;
} 