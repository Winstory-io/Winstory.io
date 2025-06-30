import React from 'react';

type CampaignInfoModalProps = {
  campaign: any;
  onClose: () => void;
};

export default function CampaignInfoModal({ campaign, onClose }: CampaignInfoModalProps) {
  const { company, title, info } = campaign;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ background: '#181818', borderRadius: 16, padding: 32, minWidth: 340, maxWidth: 420, color: '#fff', position: 'relative', boxShadow: '0 4px 32px #000a' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#FFD600', fontSize: 28, cursor: 'pointer' }} aria-label="Fermer">×</button>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ color: '#FFD600', fontWeight: 700, fontSize: 20 }}>@{company}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>{title}</div>
        <div style={{ marginBottom: 8 }}><b>Starting Story:</b> <span style={{ color: '#bfae5e' }}>{info.startingStory}</span></div>
        <div style={{ marginBottom: 8 }}><b>Guideline:</b> <span style={{ color: '#bfae5e' }}>{info.guideline}</span></div>
        <div style={{ marginBottom: 8 }}><b>Rewards:</b> <span style={{ color: '#FFD600' }}>{info.rewards}</span></div>
        <div style={{ marginBottom: 8 }}><b>Total completions:</b> {info.totalCompletions}</div>
        <div style={{ marginBottom: 8 }}><b>Time left:</b> {info.timeLeft}</div>
        <div style={{ marginBottom: 16 }}><b>Completion Price:</b> {info.price}</div>
        <button style={{ background: '#4CAF50', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', borderRadius: 8, padding: '12px 32px', cursor: 'pointer', width: '100%' }}>
          Complete
        </button>
      </div>
    </div>
  );
} 