"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from './Rewards.module.css';
import Image from "next/image";

export default function RewardsHeader() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.header}>
      <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Image src="/company.svg" alt="Company" width={80} height={80} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
        Rewards
        <button className={styles.iconBulb} aria-label="info" onClick={() => setShowModal(true)}>
          <Image src="/tooltip.svg" alt="Info" width={28} height={28} />
        </button>
      </h1>
      <button className={styles.closeBtn} aria-label="close" onClick={() => router.push('/creation/b2c/rewardsornot')}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 6L18 18" stroke="#F31260" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowModal(false)} aria-label="close">✖️</button>
            <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>About Rewards</h2>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
              Here you can configure the types of rewards for your community completions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 