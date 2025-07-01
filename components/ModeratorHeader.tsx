import React from 'react';

interface ModeratorHeaderProps {
  activeTab: 'initial' | 'completion';
  onTabChange: (tab: 'initial' | 'completion') => void;
  onIconClick: () => void;
  onBulbClick: () => void;
}

const ModeratorHeader: React.FC<ModeratorHeaderProps> = ({ activeTab, onTabChange, onIconClick, onBulbClick }) => {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1rem 1rem 1rem', background: '#000', color: '#FFD600', borderBottom: '2px solid #FFD600', position: 'relative', zIndex: 10
    }}>
      <button onClick={onIconClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <img src="/moderation.svg" alt="Moderation" style={{ width: 180, height: 180, borderRadius: '50%', marginTop: '20px' }} />
      </button>
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