import React from 'react';

interface ModerationCardProps {
  userType: 'b2c' | 'agency' | 'user';
  companyName?: string;
  agencyName?: string;
  walletAddress?: string;
  userName?: string;
  title: string;
  info: any;
  videoUrl: string;
  videoOrientation: 'horizontal' | 'vertical';
  onInfoClick: () => void;
  onValid: () => void;
  onRefuse: () => void;
  onBubbleClick: (type: string) => void;
  startingText: string;
  guideline: string;
  standardRewards: string;
  premiumRewards: string;
}

const bubbleStyle = {
  position: 'absolute' as const,
  background: '#111',
  color: '#FFD600',
  border: '2px solid #FFD600',
  borderRadius: 16,
  padding: '8px 16px',
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
  zIndex: 2,
  boxShadow: '0 2px 12px #000',
  maxWidth: 140,
  textAlign: 'center' as const,
};

const ModerationCard: React.FC<ModerationCardProps> = ({
  userType, companyName, agencyName, walletAddress, userName, title, info, videoUrl, videoOrientation, onInfoClick, onValid, onRefuse, onBubbleClick,
  startingText, guideline, standardRewards, premiumRewards
}) => {
  // Format wallet address
  const truncate = (addr: string) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '';
  let userLabel = '';
  if (userType === 'b2c' && companyName) userLabel = companyName;
  else if (userType === 'agency' && agencyName && companyName) userLabel = agencyName + ' / ' + companyName;
  else if (userType === 'user' && walletAddress) userLabel = truncate(walletAddress);
  else userLabel = userName || '@User';

  return (
    <div style={{
      background: '#111', borderRadius: 24, padding: 24, maxWidth: 480, margin: '32px auto', boxShadow: '0 4px 32px #000', color: '#FFD600', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 320
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <div style={{ background: '#FFD600', color: '#111', borderRadius: 12, padding: '6px 18px', fontWeight: 700, fontSize: 18 }}>
          {userLabel}
        </div>
        <button onClick={onInfoClick} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}>
          <span style={{ background: '#FFD600', color: '#111', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>i</span>
        </button>
      </div>
      <div style={{ fontStyle: 'italic', fontSize: 18, marginBottom: 18 }}>{title}</div>
      <div style={{ position: 'relative', width: videoOrientation === 'vertical' ? 240 : 400, height: videoOrientation === 'vertical' ? 400 : 225, background: '#222', borderRadius: 16, overflow: 'hidden', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Bulles d'accès rapide */}
        <div style={{ ...bubbleStyle, top: 8, left: '50%', transform: 'translateX(-50%)' }} onClick={() => onBubbleClick('rewards')}>Rewards</div>
        <div style={{ ...bubbleStyle, bottom: 8, left: 8 }} onClick={() => onBubbleClick('startingText')}>Starting Text</div>
        <div style={{ ...bubbleStyle, bottom: 8, right: 8 }} onClick={() => onBubbleClick('guideline')}>Guideline</div>
        <video src={videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} />
      </div>
      <div style={{ display: 'flex', gap: 32, width: '100%', justifyContent: 'center' }}>
        <button onClick={onValid} style={{ background: '#37FF00', color: '#111', fontWeight: 700, fontSize: 22, border: 'none', borderRadius: 12, padding: '14px 38px', cursor: 'pointer', minWidth: 120 }}>Valid</button>
        <button onClick={onRefuse} style={{ background: '#FF0000', color: '#fff', fontWeight: 700, fontSize: 22, border: 'none', borderRadius: 12, padding: '14px 38px', cursor: 'pointer', minWidth: 120 }}>Refuse</button>
      </div>
    </div>
  );
};

export default ModerationCard; 