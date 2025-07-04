import React, { useEffect, useState } from 'react';
import styles from './Rewards.module.css';

export default function TokenRewardConfig({ onClose }: { onClose: () => void }) {
  const [amountPerUser, setAmountPerUser] = useState<number | ''>('');
  const [maxCompletions, setMaxCompletions] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get maxCompletions from localStorage (set by /rewardsornot)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('maxCompletions');
      if (stored) {
        setMaxCompletions(Number(stored));
      }
    }
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setAmountPerUser('');
      setError(null);
      return;
    }
    const num = Number(val);
    if (isNaN(num) || num < 0.0001) {
      setError('Amount per user must be at least 0.0001');
    } else {
      setError(null);
    }
    setAmountPerUser(val === '' ? '' : num);
  };

  const totalTokens = typeof amountPerUser === 'number' && !error && maxCompletions > 0
    ? (amountPerUser * maxCompletions).toFixed(5)
    : '[X tokens]';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="close">✖️</button>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button style={{ border: '2px solid #00C46C', color: '#00C46C', background: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center' }}>
            🪙 <span style={{ marginLeft: 10, fontStyle: 'italic' }}>Tokens</span>
          </button>
        </div>
        <h2 style={{ color: '#FFD600', fontWeight: 800, fontSize: 26, marginBottom: 12 }}>Standard Rewards <span style={{ color: '#00C46C' }}>Tokens</span></h2>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, color: '#fff' }}>
          Select the name, token contract address, and the number of tokens to send per validated completer.
        </div>
        <div style={{ color: '#FFD600', fontWeight: 700, marginBottom: 12 }}>
          ⚠️ Winstory will automatically handle distribution to validated completers only if your connected wallet holds enough tokens.
        </div>
        <div style={{ color: '#fff', marginBottom: 18, fontWeight: 600 }}>
          You must hold at least : <span style={{ color: '#FFD600', fontWeight: 700 }}>{totalTokens}</span> = <span style={{ color: '#FFD600' }}>{amountPerUser !== '' ? amountPerUser : '[Amount per user]'}</span> × {maxCompletions > 0 ? maxCompletions : '[Max completions]'}
        </div>
        {error && <div style={{ color: 'red', fontWeight: 600, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <input type="text" placeholder="Name of the Token" style={{ padding: 12, borderRadius: 8, border: '2px solid #FFD600', background: 'none', color: '#FFD600', fontWeight: 600, fontSize: 16 }} />
          <input type="text" placeholder="Token contract address" style={{ padding: 12, borderRadius: 8, border: '2px solid #FFD600', background: 'none', color: '#FFD600', fontWeight: 600, fontSize: 16 }} />
          <input
            type="number"
            min={0.0001}
            step={0.00001}
            value={amountPerUser}
            onChange={handleAmountChange}
            placeholder="How many token(s) per individual community minter validated ?"
            style={{
              padding: 12,
              borderRadius: 8,
              border: '2px solid #FFD600',
              background: 'none',
              color: '#FFD600',
              fontWeight: 600,
              fontSize: 16,
            }}
          />
        </div>
      </div>
    </div>
  );
} 