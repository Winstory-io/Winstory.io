"use client";

import RewardsHeader from './RewardsHeader';
import RewardsOptions from './RewardsOptions';
import styles from './Rewards.module.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import WalletConnect from '@/components/WalletConnect';
import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";

export default function StandardRewardsPage() {
  // DEBUG: Affichage de l'état du wallet et du localStorage
  const account = useActiveAccount();
  const [localUser, setLocalUser] = useState<string | null>(null);
  const [localWallet, setLocalWallet] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalUser(localStorage.getItem('user'));
      setLocalWallet(localStorage.getItem('walletAddress'));
    }
  }, []);

  return (
    <>
      {/* DEBUG INFO */}
      <div style={{ background: '#222', color: '#FFD600', padding: 12, marginBottom: 16, borderRadius: 8 }}>
        <div><b>DEBUG</b></div>
        <div>useActiveAccount: {account ? `${account.address}` : 'undefined'}</div>
        <div>localStorage.user: {localUser || 'null'}</div>
        <div>localStorage.walletAddress: {localWallet || 'null'}</div>
      </div>
      <ErrorBoundary>
        <div className={styles.container}>
          <WalletConnect isBothLogin />
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
    </>
  );
} 