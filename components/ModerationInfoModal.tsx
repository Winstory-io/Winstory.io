import React from 'react';

interface ModerationInfoModalProps {
  info: {
    startingText: string;
    guideline: string;
    standardRewards: string;
    premiumRewards: string;
    completionPrice: string;
    totalCompletions: number;
  };
  onClose: () => void;
}

const ModerationInfoModal: React.FC<ModerationInfoModalProps> = ({ info, onClose }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#222', color: '#FFD600', borderRadius: 16, padding: 32, minWidth: 320, maxWidth: 420, boxShadow: '0 4px 32px #000', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: '#FFD600', fontSize: 28, cursor: 'pointer' }}>&#10005;</button>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Informations de la campagne</h2>
        <div style={{ fontSize: 16, lineHeight: 1.5 }}>
          <div style={{ marginBottom: 12 }}><b>Starting Text :</b><br />{info.startingText}</div>
          <div style={{ marginBottom: 12 }}><b>Guideline :</b><br />{info.guideline}</div>
          <div style={{ marginBottom: 12 }}><b>Standard Rewards :</b><br />{info.standardRewards}</div>
          <div style={{ marginBottom: 12 }}><b>Premium Rewards :</b><br />{info.premiumRewards}</div>
          <div style={{ marginBottom: 12 }}><b>Completion Price :</b><br />{info.completionPrice}</div>
          <div style={{ marginBottom: 0 }}><b>Total Completions if Validated :</b><br />{info.totalCompletions}</div>
        </div>
      </div>
    </div>
  );
};

export default ModerationInfoModal; 