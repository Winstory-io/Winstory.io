import { useActiveAccount } from "thirdweb/react";

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