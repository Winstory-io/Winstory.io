"use client";

import RewardsHeader from './RewardsHeader';
import RewardsOptions from './RewardsOptions';
import styles from './Rewards.module.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import WalletConnect from '@/components/WalletConnect';
import { useWalletAddress } from '@/lib/hooks/useWalletConnection';
import { ThirdwebProvider } from "thirdweb/react";

export default function StandardRewardsPage() {
  // const walletAddress = useWalletAddress(); // plus besoin
  return (
    <ThirdwebProvider>
      <ErrorBoundary>
        <div className={styles.container}>
          <WalletConnect isBothLogin />
          {/* Affichage debug supprimé */}
          <RewardsHeader />
          <div className={styles.subtitles}>
            <p className={styles.choose}>Choose how you want to thank your Community</p>
            <h2 className={styles.standard}>Standard Rewards</h2>
            <p className={styles.italic}>
              <em>
                Select the type of reward to give for each completion <span className={styles.validated}>validated</span> by Moderators
              </em>
            </p>
          </div>
          <RewardsOptions />
        </div>
      </ErrorBoundary>
    </ThirdwebProvider>
  );
} 