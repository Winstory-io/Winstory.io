import React from 'react';

interface ModerationBubblesProps {
  userType: 'b2c' | 'agency' | 'individual';
  onBubbleClick: (bubbleType: string) => void;
  bubbleSize?: number;
  bubbleGap?: number;
}

const ModerationBubbles: React.FC<ModerationBubblesProps> = ({ 
  userType, 
  onBubbleClick, 
  bubbleSize = 100, 
  bubbleGap = 24 
}) => {
  const getBubbles = () => {
    if (userType === 'individual') {
      return [
        { key: 'guideline', label: 'Guideline', onClick: () => onBubbleClick('guideline') },
        { key: 'startingText', label: 'Starting Story', onClick: () => onBubbleClick('startingText') },
      ];
    } else {
      // B2C et Agencies
      return [
        { key: 'premiumRewards', label: 'Premium Reward', onClick: () => onBubbleClick('premiumRewards') },
        { key: 'standardRewards', label: 'Standard Reward', onClick: () => onBubbleClick('standardRewards') },
        { key: 'guideline', label: 'Guideline', onClick: () => onBubbleClick('guideline') },
        { key: 'startingText', label: 'Starting Story', onClick: () => onBubbleClick('startingText') },
      ];
    }
  };

  const bubbles = getBubbles();
  const totalHeight = bubbles.length * bubbleSize + (bubbles.length - 1) * bubbleGap;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: bubbleGap,
        width: bubbleSize,
        height: totalHeight,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {bubbles.map((bubble, idx) => (
        <div
          key={bubble.key}
          style={{
            width: bubbleSize,
            height: bubbleSize,
            fontSize: 16,
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
            border: '2px solid rgba(255, 215, 0, 0.6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#FFD600',
            fontWeight: 600,
            textAlign: 'center',
            padding: '8px',
            transition: 'all 0.3s ease',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
            userSelect: 'none'
          }}
          onClick={bubble.onClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 215, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.2)';
          }}
        >
          {bubble.label}
        </div>
      ))}
    </div>
  );
};

export default ModerationBubbles; 