/**
 * Helpers pour créer des notifications dans le système
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface NotificationData {
  user_wallet: string;
  campaign_id?: string;
  completion_id?: string;
  notification_type: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
  expires_at?: string;
}

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification(data: NotificationData): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data: notification, error } = await supabase
      .from('system_notifications')
      .insert({
        user_wallet: data.user_wallet.toLowerCase(),
        campaign_id: data.campaign_id || null,
        notification_type: data.notification_type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal',
        is_read: false,
        expires_at: data.expires_at || null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: notification.id };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Crée une notification de récompense distribuée
 */
export async function notifyRewardDistributed(
  completerWallet: string,
  campaignId: string,
  completionId: string,
  rewardType: 'standard' | 'premium',
  rewardDetails: {
    tokenName?: string;
    amount?: number;
    ranking?: number;
  }
): Promise<void> {
  const isPremium = rewardType === 'premium';
  const title = isPremium 
    ? '🏆 Premium Reward Received!'
    : '🎁 Reward Received!';
  
  let message = '';
  if (isPremium && rewardDetails.ranking) {
    message = `Congratulations! You ranked #${rewardDetails.ranking} and received `;
  } else {
    message = 'You received ';
  }
  
  if (rewardDetails.tokenName && rewardDetails.amount) {
    message += `${rewardDetails.amount} ${rewardDetails.tokenName}`;
  } else {
    message += 'your reward';
  }
  
  message += ' for completing the campaign!';

  await createNotification({
    user_wallet: completerWallet,
    campaign_id: campaignId,
    completion_id: completionId,
    notification_type: isPremium ? 'premium_reward_distributed' : 'reward_distributed',
    title,
    message,
    priority: 'high'
  });
}

