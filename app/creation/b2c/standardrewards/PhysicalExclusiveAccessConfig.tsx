import React from 'react';
import styles from './Rewards.module.css';

export default function PhysicalExclusiveAccessConfig({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #00C46C', color: '#00C46C', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🎟️ <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Exclusive Access</span>
          </button>
        </div>
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>Standard Rewards <span style={{ color: '#00C46C' }}>Physical Exclusive Access</span></h2>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Select the name, access contract address, and upload your access metadata (link, code, or file). Winstory will automatically mint and distribute one Physi Access Pass per validated community completer.
        </div>
        <div style={{ color: '#FFD600', fontWeight: 700, marginBottom: 12 }}>
          ⚠️ You must hold the minting rights (or be the owner) of the selected contract address. Otherwise, distribution cannot proceed.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input type="text" placeholder="Name of the Physical Exclusive Access" style={{ padding: 12, borderRadius: 8, border: '2px solid #FFD600', background: 'none', color: '#FFD600', fontWeight: 600, fontSize: 16 }} />
          <input type="text" placeholder="Smart Contract Address for the Access" style={{ padding: 12, borderRadius: 8, border: '2px solid #FFD600', background: 'none', color: '#FFD600', fontWeight: 600, fontSize: 16 }} />
          <input type="file" style={{ padding: 12, borderRadius: 8, border: '2px solid #FFD600', background: 'none', color: '#FFD600', fontWeight: 600, fontSize: 16 }} />
        </div>
      </div>
    </div>
  );
} 