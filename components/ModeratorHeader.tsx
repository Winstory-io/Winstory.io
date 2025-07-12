import React from 'react';
import { useWalletAddress } from '../lib/hooks/useWalletConnection';

interface ModeratorHeaderProps {
  activeTab: 'initial' | 'completion';
  onTabChange: (tab: 'initial' | 'completion') => void;
  onIconClick: () => void;
  onBulbClick: () => void;
}

const ModeratorHeader: React.FC<ModeratorHeaderProps> = ({ activeTab, onTabChange, onIconClick, onBulbClick }) => {
  const walletAddress = useWalletAddress();
  const formatAddress = (address: any) => {
    if (!address || typeof address !== 'string') return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1rem 1rem 1rem', background: '#000', color: '#FFD600', borderBottom: '2px solid #FFD600', position: 'relative', zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onIconClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src="/moderation.svg" alt="Moderation" style={{ width: 120, height: 120, borderRadius: '50%', marginTop: '20px' }} />
        </button>
        {walletAddress && (
          <div style={{
            background: 'linear-gradient(90deg, #2eea8b 60%, #1bbf5c 100%)',
            color: '#181818',
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 16,
            padding: '6px 18px',
            marginLeft: 8,
            boxShadow: '0 2px 8px 0 rgba(46,234,139,0.12)',
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #18C964',
            letterSpacing: 0.5,
            minWidth: 90,
            userSelect: 'all',
            transition: 'background 0.2s',
          }}
            title={walletAddress}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: 7, marginLeft: -3, verticalAlign: 'middle' }}><circle cx="12" cy="12" r="12" fill="#18C964"/><path d="M7 12.5L10 15.5L17 8.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {formatAddress(walletAddress)}
          </div>
        )}
      </div>
      <div style={{ flex: 1, textAlign: 'center', marginLeft: '-80px' }}>
        <span style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: 1 }}>
          Moderate{' '}
          <span role="img" aria-label="bulb" style={{ cursor: 'pointer' }} onClick={onBulbClick}>💡</span>
        </span>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 32 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: activeTab === 'initial' ? '#FFD600' : '#665c2e',
              borderBottom: activeTab === 'initial' ? '3px solid #FFD600' : 'none',
              cursor: 'pointer',
              marginRight: 16
            }}
            onClick={() => onTabChange('initial')}
          >
            Initial
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: activeTab === 'completion' ? '#FFD600' : '#665c2e',
              borderBottom: activeTab === 'completion' ? '3px solid #FFD600' : 'none',
              cursor: 'pointer',
              opacity: 0.7
            }}
            onClick={() => onTabChange('completion')}
          >
            Completion
          </span>
        </div>
      </div>
      <span onClick={() => window.location.href = '/welcome'} style={{ fontSize: 40, color: '#FFD600', cursor: 'pointer', userSelect: 'none' }}>&#10005;</span>
    </header>
  );
};

export default ModeratorHeader; 