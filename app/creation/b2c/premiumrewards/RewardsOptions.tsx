"use client";

import React, { useState } from 'react';
import styles from '../standardrewards/Rewards.module.css';
import TokenRewardConfig from './TokenRewardConfig';
import ItemRewardConfig from './ItemRewardConfig';
import DigitalExclusiveAccessConfig from './DigitalExclusiveAccessConfig';
import PhysicalExclusiveAccessConfig from './PhysicalExclusiveAccessConfig';

export default function RewardsOptions() {
  const [openConfig, setOpenConfig] = useState<null | 'token' | 'item' | 'digital' | 'physical'>(null);

  return (
    <>
      <div className={styles.optionsContainer}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Digital</h3>
          <button className={styles.rewardBtn} onClick={() => setOpenConfig('item')}>👾 <span className={styles.btnLabel}>Items</span></button>
          <button className={styles.rewardBtn} onClick={() => setOpenConfig('digital')}>🔐 <span className={styles.btnLabel}>Exclusive Access</span></button>
          <button className={styles.rewardBtn} onClick={() => setOpenConfig('token')}>🪙 <span className={styles.btnLabel}>Tokens</span></button>
        </div>
        <div className={styles.separator}></div>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Physical</h3>
          <button className={styles.rewardBtn} onClick={() => setOpenConfig('physical')}>🎟️ <span className={styles.btnLabel}>Exclusive Access</span></button>
        </div>
      </div>
      {openConfig === 'token' && <TokenRewardConfig onClose={() => setOpenConfig(null)} />}
      {openConfig === 'item' && <ItemRewardConfig onClose={() => setOpenConfig(null)} />}
      {openConfig === 'digital' && <DigitalExclusiveAccessConfig onClose={() => setOpenConfig(null)} />}
      {openConfig === 'physical' && <PhysicalExclusiveAccessConfig onClose={() => setOpenConfig(null)} />}
    </>
  );
} 