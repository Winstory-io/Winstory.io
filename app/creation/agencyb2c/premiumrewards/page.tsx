"use client";

import RewardsHeader from '../../b2c/standardrewards/RewardsHeader';
import RewardsOptions from '../../b2c/premiumrewards/RewardsOptions';
import styles from '../../b2c/standardrewards/Rewards.module.css';

export default function AgencyB2CPremiumRewardsPage() {
  return (
    <div className={styles.container}>
      <RewardsHeader />
      <div className={styles.subtitles}>
        <div className={styles.standardRewardsConfigured}>
          Standard Rewards : ✅
        </div>
        <p className={styles.choose}>Choose how you want to thank your best Community</p>
        <h2 className={styles.standard}>Premium Rewards</h2>
        <p className={styles.italic}>
          <em>
            Select the type of reward to give for 3 best <span className={styles.validated}>valid</span> completions <span style={{ color: '#FFD600', fontWeight: 700 }}>scored</span> by Moderators
          </em>
        </p>
      </div>
      <RewardsOptions />
    </div>
  );
} 