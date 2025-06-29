"use client";

import styles from './Rewards.module.css';

export default function RewardsOptions() {
  return (
    <div className={styles.optionsContainer}>
      <div className={styles.column}>
        <h3 className={styles.columnTitle}>Digital</h3>
        <button className={styles.rewardBtn} onClick={() => {}}>👾 <span className={styles.btnLabel}>Items</span></button>
        <button className={styles.rewardBtn} onClick={() => {}}>🔐 <span className={styles.btnLabel}>Exclusive Access</span></button>
        <button className={styles.rewardBtn} onClick={() => {}}>🪙 <span className={styles.btnLabel}>Tokens</span></button>
      </div>
      <div className={styles.separator}></div>
      <div className={styles.column}>
        <h3 className={styles.columnTitle}>Physical</h3>
        <button className={styles.rewardBtn} onClick={() => {}}>🎟️ <span className={styles.btnLabel}>Exclusive Access</span></button>
      </div>
    </div>
  );
} 