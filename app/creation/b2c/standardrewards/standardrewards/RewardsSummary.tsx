import { useActiveAccount } from "thirdweb/react";
import type { RewardsSummaryProps } from 'components/RewardsSummary';

export default function RewardsSummary({ 
  standard, 
  premium, 
  maxCompletions, 
  onProceed, 
  onEdit 
}: RewardsSummaryProps) {
  const account = useActiveAccount();
  const walletAddress = account?.address;
  // ...
} 