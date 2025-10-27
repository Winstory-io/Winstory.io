/**
 * XP Engine - Handles XP calculations and transactions for Winstory
 * 
 * This module provides functions to calculate and award XP based on
 * user actions, campaign type, and various context parameters.
 */

import { createClient } from '@supabase/supabase-js';
import {
  UserType,
  RecipientType,
  XP_SYSTEM_CONFIG,
  getXPAction,
  calculateXPAmount,
  calculateLevel
} from './xp-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * XP Transaction Input
 */
export interface XPTransactionInput {
  userWallet: string;
  userType: UserType;
  action: string;
  
  // Context for calculations
  campaignId?: string;
  completionId?: string;
  mintValueUSD?: number;
  mintValueWINC?: number;
  priceCompletion?: number;
  stakeAmount?: number;
  stakeAgeDays?: number;
  stakerType?: 'MAJOR' | 'MINOR' | 'PASSIVE' | 'INELIGIBLE';
  
  // Additional metadata
  description?: string;
  metadata?: Record<string, any>;
  
  // Agency specific
  agencyWallet?: string;
  clientEmail?: string;
  
  // Audit
  createdBy?: string;
  transactionHash?: string;
}

/**
 * XP Transaction Result
 */
export interface XPTransactionResult {
  success: boolean;
  transactionId?: string;
  xpAmount: number;
  xpBefore: number;
  xpAfter: number;
  level: number;
  levelUp: boolean;
  previousLevel?: number;
  error?: string;
}

/**
 * Map action names to database enum values
 */
const ACTION_TO_DB_TYPE: Record<string, string> = {
  'B2C_MINT_1000USD': 'B2C_MINT',
  'Agency_MINT_1000USD': 'AGENCY_MINT',
  'Individual_MINT': 'INDIVIDUAL_MINT',
  'Option_Winstory_Creates_Video': 'OPTION_WINSTORY_VIDEO',
  'Option_No_Rewards': 'OPTION_NO_REWARDS',
  'Moderation_Validated_By_1_Moderator': 'MODERATION_VALIDATED_BY_MODERATOR',
  'Moderation_Refused_By_1_Moderator': 'MODERATION_REFUSED_BY_MODERATOR',
  'Creation_Validated_Final': 'CREATION_VALIDATED_FINAL',
  'Creation_Refused_Final': 'CREATION_REFUSED_FINAL',
  'Completion_By_1_Completer': 'COMPLETION_SUBMITTED',
  'Completion_100Percent_Validated': 'COMPLETION_100_VALIDATED',
  'B2C_Client_Onboarded': 'B2C_CLIENT_ONBOARDED'
};

/**
 * Map user types to database enum values
 */
const USER_TYPE_TO_DB: Record<string, string> = {
  'B2C': 'B2C',
  'AGENCY_B2C': 'AGENCY_B2C',
  'INDIVIDUAL': 'INDIVIDUAL',
  'MODERATOR': 'MODERATOR',
  'COMPLETER': 'COMPLETER'
};

/**
 * Award XP for a specific action
 */
export async function awardXP(input: XPTransactionInput): Promise<XPTransactionResult> {
  try {
    // Get the XP action configuration
    const xpAction = getXPAction(input.userType, input.action);
    
    if (!xpAction) {
      return {
        success: false,
        error: `XP action not found: ${input.action} for user type ${input.userType}`,
        xpAmount: 0,
        xpBefore: 0,
        xpAfter: 0,
        level: 1,
        levelUp: false
      };
    }

    // Calculate XP amount (handling formulas)
    const earnXP = calculateXPAmount(xpAction.earn_xp, {
      mintValueWINC: input.mintValueWINC,
      mintValueUSD: input.mintValueUSD,
      priceCompletion: input.priceCompletion,
      stakeAmount: input.stakeAmount,
      stakeAgeDays: input.stakeAgeDays,
      stakerType: input.stakerType
    });

    const loseXP = calculateXPAmount(xpAction.lose_xp, {
      mintValueWINC: input.mintValueWINC,
      mintValueUSD: input.mintValueUSD,
      priceCompletion: input.priceCompletion,
      stakeAmount: input.stakeAmount,
      stakeAgeDays: input.stakeAgeDays,
      stakerType: input.stakerType
    });

    const xpAmount = earnXP - loseXP;

    if (xpAmount === 0) {
      return {
        success: false,
        error: 'XP amount is 0',
        xpAmount: 0,
        xpBefore: 0,
        xpAfter: 0,
        level: 1,
        levelUp: false
      };
    }

    // Get current XP balance
    const { data: currentBalance } = await supabase
      .from('xp_balances')
      .select('total_xp, current_level')
      .eq('user_wallet', input.userWallet)
      .single();

    const xpBefore = currentBalance?.total_xp || 0;
    const previousLevel = currentBalance?.current_level || 1;

    // Map action to database enum
    const dbTransactionType = ACTION_TO_DB_TYPE[input.action] || 'ADMIN_ADJUSTMENT';
    const dbUserType = USER_TYPE_TO_DB[input.userType] || 'B2C';

    // Call the database function to add XP transaction
    const { data, error } = await supabase.rpc('add_xp_transaction', {
      p_user_wallet: input.userWallet,
      p_user_type: dbUserType,
      p_transaction_type: dbTransactionType,
      p_xp_amount: xpAmount,
      p_campaign_id: input.campaignId || null,
      p_completion_id: input.completionId || null,
      p_description: input.description || xpAction.description || null,
      p_metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      p_mint_value_usd: input.mintValueUSD || null,
      p_mint_value_winc: input.mintValueWINC || null,
      p_agency_wallet: input.agencyWallet || null,
      p_client_email: input.clientEmail || null,
      p_created_by: input.createdBy || 'system'
    });

    if (error) {
      console.error('Error adding XP transaction:', error);
      return {
        success: false,
        error: error.message,
        xpAmount,
        xpBefore,
        xpAfter: xpBefore,
        level: previousLevel,
        levelUp: false
      };
    }

    // Get updated balance
    const { data: updatedBalance } = await supabase
      .from('xp_balances')
      .select('total_xp, current_level')
      .eq('user_wallet', input.userWallet)
      .single();

    const xpAfter = updatedBalance?.total_xp || xpBefore;
    const currentLevel = updatedBalance?.current_level || previousLevel;
    const levelUp = currentLevel > previousLevel;

    return {
      success: true,
      transactionId: data as string,
      xpAmount,
      xpBefore,
      xpAfter,
      level: currentLevel,
      levelUp,
      previousLevel
    };

  } catch (error) {
    console.error('Error in awardXP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      xpAmount: 0,
      xpBefore: 0,
      xpAfter: 0,
      level: 1,
      levelUp: false
    };
  }
}

/**
 * Award XP for campaign creation (MINT)
 */
export async function awardCampaignCreationXP(
  userWallet: string,
  campaignType: UserType,
  campaignId: string,
  mintValueUSD: number,
  options: {
    winstoryCreatesVideo?: boolean;
    noRewards?: boolean;
    mintValueWINC?: number;
  } = {}
): Promise<XPTransactionResult[]> {
  const results: XPTransactionResult[] = [];

  // Award base MINT XP
  let mintAction = '';
  if (campaignType === 'B2C') {
    mintAction = 'B2C_MINT_1000USD';
  } else if (campaignType === 'AGENCY_B2C') {
    mintAction = 'Agency_MINT_1000USD';
  } else if (campaignType === 'INDIVIDUAL') {
    mintAction = 'Individual_MINT';
  }

  if (mintAction) {
    const mintResult = await awardXP({
      userWallet,
      userType: campaignType,
      action: mintAction,
      campaignId,
      mintValueUSD,
      mintValueWINC: options.mintValueWINC || mintValueUSD,
      description: `Campaign MINT: ${campaignType}`,
      createdBy: 'campaign_creation'
    });
    results.push(mintResult);
  }

  // Award bonus XP for options (B2C only)
  if (campaignType === 'B2C') {
    if (options.winstoryCreatesVideo) {
      const videoResult = await awardXP({
        userWallet,
        userType: 'B2C',
        action: 'Option_Winstory_Creates_Video',
        campaignId,
        description: 'Bonus: Winstory Creates Video option',
        createdBy: 'campaign_creation'
      });
      results.push(videoResult);
    }

    if (options.noRewards) {
      const noRewardsResult = await awardXP({
        userWallet,
        userType: 'B2C',
        action: 'Option_No_Rewards',
        campaignId,
        description: 'Bonus: No Rewards option',
        createdBy: 'campaign_creation'
      });
      results.push(noRewardsResult);
    }
  }

  // Award bonus XP for no rewards (Agency B2C)
  if (campaignType === 'AGENCY_B2C' && options.noRewards) {
    const noRewardsResult = await awardXP({
      userWallet,
      userType: 'AGENCY_B2C',
      action: 'Option_No_Rewards',
      campaignId,
      description: 'Bonus: No Rewards option',
      createdBy: 'campaign_creation'
    });
    results.push(noRewardsResult);
  }

  return results;
}

/**
 * Award XP for moderation vote
 */
export async function awardModerationVoteXP(
  moderatorWallet: string,
  campaignId: string,
  campaignType: UserType,
  voteDecision: 'VALID' | 'REFUSE',
  completionId?: string
): Promise<XPTransactionResult> {
  const action = voteDecision === 'VALID' 
    ? 'Moderation_Validated_By_1_Moderator'
    : 'Moderation_Refused_By_1_Moderator';

  return await awardXP({
    userWallet: moderatorWallet,
    userType: campaignType,
    action,
    campaignId,
    completionId,
    description: `Moderation vote: ${voteDecision}`,
    createdBy: 'moderation_system'
  });
}

/**
 * Award XP for final moderation decision
 */
export async function awardFinalModerationXP(
  creatorWallet: string,
  campaignId: string,
  campaignType: UserType,
  finalDecision: 'VALIDATED' | 'REFUSED',
  mintValueWINC?: number
): Promise<XPTransactionResult> {
  const action = finalDecision === 'VALIDATED'
    ? 'Creation_Validated_Final'
    : 'Creation_Refused_Final';

  return await awardXP({
    userWallet: creatorWallet,
    userType: campaignType,
    action,
    campaignId,
    mintValueWINC,
    description: `Campaign ${finalDecision.toLowerCase()}`,
    createdBy: 'moderation_system'
  });
}

/**
 * Award XP for moderators voting on completions
 */
export async function awardCompletionModerationXP(
  moderatorWallet: string,
  campaignId: string,
  completionId: string,
  campaignType: UserType,
  voteDecision: 'VALID' | 'REFUSE'
): Promise<XPTransactionResult> {
  const action = voteDecision === 'VALID' 
    ? 'Completion_Moderation_Validated'
    : 'Completion_Moderation_Refused';

  return await awardXP({
    userWallet: moderatorWallet,
    userType: campaignType,
    action,
    campaignId,
    completionId,
    description: `Completion moderation vote: ${voteDecision}`,
    createdBy: 'completion_moderation_system'
  });
}

/**
 * Award XP for completion submission, validation, or refusal
 */
export async function awardCompletionXP(
  completerWallet: string,
  campaignId: string,
  completionId: string,
  campaignType: UserType,
  options: {
    isValidated?: boolean;
    isRefused?: boolean;
    isPaid?: boolean;
    priceCompletion?: number;
    mintValueWINC?: number;
  } = {}
): Promise<XPTransactionResult[]> {
  const results: XPTransactionResult[] = [];
  const { isValidated = false, isRefused = false, isPaid = false, priceCompletion = 0, mintValueWINC = 0 } = options;

  // ========== SUBMISSION XP ==========
  // Only award submission XP if it's a new submission (not a validation/refusal update)
  if (!isValidated && !isRefused) {
    let submitAction = '';
    
    if (campaignType === 'B2C') {
      submitAction = isPaid ? 'Completion_Submit_B2C_Paid' : 'Completion_Submit_B2C_Free';
    } else if (campaignType === 'AGENCY_B2C') {
      submitAction = isPaid ? 'Completion_Submit_Agency_Paid' : 'Completion_Submit_Agency_Free';
    } else if (campaignType === 'INDIVIDUAL') {
      submitAction = 'Completion_Submit_Individual';
    }

    if (submitAction) {
      const submitResult = await awardXP({
        userWallet: completerWallet,
        userType: campaignType,
        action: submitAction,
        campaignId,
        completionId,
        mintValueWINC,
        priceCompletion,
        description: 'Completion submitted',
        createdBy: 'completion_system'
      });
      results.push(submitResult);
    }
  }

  // ========== VALIDATION XP ==========
  if (isValidated) {
    let validatedAction = '';
    
    if (campaignType === 'B2C') {
      validatedAction = 'Completion_Validated_B2C';
    } else if (campaignType === 'AGENCY_B2C') {
      validatedAction = 'Completion_Validated_Agency';
    } else if (campaignType === 'INDIVIDUAL') {
      validatedAction = 'Completion_Validated_Individual';
    }

    if (validatedAction) {
      const validatedResult = await awardXP({
        userWallet: completerWallet,
        userType: campaignType,
        action: validatedAction,
        campaignId,
        completionId,
        description: 'Completion validated',
        createdBy: 'completion_system'
      });
      results.push(validatedResult);
    }
  }

  // ========== REFUSAL XP (LOSS) ==========
  if (isRefused) {
    let refusedAction = '';
    
    if (campaignType === 'B2C') {
      refusedAction = 'Completion_Refused_B2C';
    } else if (campaignType === 'AGENCY_B2C') {
      refusedAction = 'Completion_Refused_Agency';
    } else if (campaignType === 'INDIVIDUAL') {
      refusedAction = 'Completion_Refused_Individual';
    }

    if (refusedAction) {
      const refusedResult = await awardXP({
        userWallet: completerWallet,
        userType: campaignType,
        action: refusedAction,
        campaignId,
        completionId,
        mintValueWINC,
        description: 'Completion refused',
        createdBy: 'completion_system'
      });
      results.push(refusedResult);
    }
  }

  return results;
}

/**
 * Award XP for staking
 */
export async function awardStakingXP(
  stakerWallet: string,
  campaignId: string,
  campaignType: UserType,
  stakerCategory: 'MAJOR' | 'MINOR' | 'INELIGIBLE',
  stakeAmount: number,
  stakeAgeDays: number
): Promise<XPTransactionResult> {
  // Determine action based on staker category
  let action = '';
  
  if (stakerCategory === 'MAJOR') {
    action = 'STAKING_MAJOR';
  } else if (stakerCategory === 'MINOR') {
    action = 'STAKING_MINOR';
  } else if (stakerCategory === 'INELIGIBLE') {
    action = 'STAKING_INELIGIBLE';
  }

  if (!action) {
    return {
      success: false,
      error: `Invalid staker category: ${stakerCategory}`,
      xpAmount: 0,
      xpBefore: 0,
      xpAfter: 0,
      level: 1,
      levelUp: false
    };
  }

  return await awardXP({
    userWallet: stakerWallet,
    userType: campaignType,
    action,
    campaignId,
    stakeAmount,
    stakeAgeDays,
    stakerType: stakerCategory,
    description: `Staking reward (${stakerCategory}): ${stakeAmount} WINC for ${stakeAgeDays} days`,
    metadata: {
      stakerCategory,
      stakeAmount,
      stakeAgeDays
    },
    createdBy: 'staking_system'
  });
}

/**
 * Register Agency B2C client for future XP
 */
export async function registerAgencyB2CClient(
  agencyWallet: string,
  agencyEmail: string,
  clientEmail: string,
  clientName: string,
  campaignId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('agency_b2c_clients')
      .insert({
        agency_wallet: agencyWallet,
        agency_email: agencyEmail,
        client_email: clientEmail,
        client_name: clientName,
        campaign_id: campaignId,
        xp_granted: false,
        is_active: true
      });

    if (error) {
      console.error('Error registering agency client:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in registerAgencyB2CClient:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Award XP when Agency B2C client connects to Winstory
 */
export async function awardAgencyClientOnboardingXP(
  clientEmail: string,
  clientWallet: string
): Promise<XPTransactionResult> {
  try {
    // Find the client record
    const { data: clientRecord, error: findError } = await supabase
      .from('agency_b2c_clients')
      .select('*')
      .eq('client_email', clientEmail)
      .eq('xp_granted', false)
      .single();

    if (findError || !clientRecord) {
      return {
        success: false,
        error: 'Client not found or XP already granted',
        xpAmount: 0,
        xpBefore: 0,
        xpAfter: 0,
        level: 1,
        levelUp: false
      };
    }

    // Award XP to the client (not the agency!)
    const result = await awardXP({
      userWallet: clientWallet,
      userType: 'B2C',
      action: 'B2C_Client_Onboarded',
      campaignId: clientRecord.campaign_id,
      agencyWallet: clientRecord.agency_wallet,
      clientEmail: clientEmail,
      description: 'Agency B2C client onboarded to Winstory',
      createdBy: 'onboarding_system'
    });

    if (result.success) {
      // Update client record
      await supabase
        .from('agency_b2c_clients')
        .update({
          client_wallet: clientWallet,
          xp_granted: true,
          xp_granted_at: new Date().toISOString(),
          xp_transaction_id: result.transactionId,
          onboarded_at: new Date().toISOString()
        })
        .eq('id', clientRecord.id);
    }

    return result;
  } catch (error) {
    console.error('Error in awardAgencyClientOnboardingXP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      xpAmount: 0,
      xpBefore: 0,
      xpAfter: 0,
      level: 1,
      levelUp: false
    };
  }
}

/**
 * Get XP balance for a user
 */
export async function getXPBalance(userWallet: string) {
  try {
    const { data, error } = await supabase
      .from('xp_balances')
      .select('*')
      .eq('user_wallet', userWallet)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching XP balance:', error);
      return null;
    }

    return data || {
      user_wallet: userWallet,
      total_xp: 0,
      current_level: 1,
      xp_to_next_level: 100,
      xp_in_current_level: 0,
      total_xp_earned: 0,
      total_xp_lost: 0
    };
  } catch (error) {
    console.error('Error in getXPBalance:', error);
    return null;
  }
}

/**
 * Get XP transaction history for a user
 */
export async function getXPTransactionHistory(
  userWallet: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const { data, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_wallet', userWallet)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching XP transactions:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getXPTransactionHistory:', error);
    return null;
  }
}

