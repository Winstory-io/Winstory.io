import React from 'react';

interface ModerationBubblesProps {
  userType: 'b2c' | 'agency' | 'individual';
  onBubbleClick: (bubbleType: string) => void;
  bubbleSize?: number;
  bubbleGap?: number;
  campaignType?: 'initial' | 'completion';
  hasRewards?: boolean;
}

const ModerationBubbles: React.FC<ModerationBubblesProps> = ({ 
  userType, 
  onBubbleClick, 
  bubbleSize = 100, 
  bubbleGap = 24,
  campaignType = 'initial',
  hasRewards = false
}) => {
  const getBubbles = () => {
    // Bulles communes à tous les types
    const commonBubbles = [
      { key: 'startingText', label: 'Starting Story', onClick: () => onBubbleClick('startingText') },
      { key: 'guideline', label: 'Guideline', onClick: () => onBubbleClick('guideline') },
    ];

    // Pour les campagnes de completion, ajouter la bulle verte "Initial Video"
    if (campaignType === 'completion') {
      const completionBubbles = [
        { key: 'initialVideo', label: 'Initial Video', onClick: () => onBubbleClick('initialVideo'), isGreen: true },
        ...commonBubbles
      ];

      // Si c'est un créateur B2C/Agency ET qu'il y a des récompenses, ajouter la bulle de récompenses combinée
      if ((userType === 'b2c' || userType === 'agency') && hasRewards) {
        return [
          { key: 'rewards', label: 'Rewards', onClick: () => onBubbleClick('rewards') },
          ...completionBubbles
        ];
      }

      return completionBubbles;
    }

    // Pour les campagnes initiales
    // Si c'est un créateur B2C/Agency ET qu'il y a des récompenses, ajouter la bulle de récompenses combinée
    if ((userType === 'b2c' || userType === 'agency') && hasRewards) {
      return [
        { key: 'rewards', label: 'Rewards', onClick: () => onBubbleClick('rewards') },
        ...commonBubbles
      ];
    }

    // Pour les créateurs individuels ou les campagnes sans récompenses
    return commonBubbles;
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
      {bubbles.map((bubble: any, idx) => {
        const isGreen = bubble.isGreen;
        return (
          <div
            key={bubble.key}
            style={{
              width: bubbleSize,
              height: bubbleSize,
              fontSize: 14, // Augmenté de 12 à 14 pour une meilleure lisibilité
              background: isGreen 
                ? 'linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
              border: isGreen 
                ? '2px solid rgba(0, 255, 0, 0.6)'
                : '2px solid rgba(255, 215, 0, 0.6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isGreen ? '#00FF00' : '#FFD600',
              fontWeight: 600,
              textAlign: 'center',
              padding: '4px', // Réduit encore pour les bulles plus petites
              transition: 'all 0.3s ease',
              textShadow: isGreen 
                ? '0 0 10px rgba(0, 255, 0, 0.5)'
                : '0 0 10px rgba(255, 215, 0, 0.5)',
              boxShadow: isGreen 
                ? '0 4px 20px rgba(0, 255, 0, 0.2)'
                : '0 4px 20px rgba(255, 215, 0, 0.2)',
              userSelect: 'none'
            }}
            onClick={bubble.onClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = isGreen 
                ? '0 6px 25px rgba(0, 255, 0, 0.3)'
                : '0 6px 25px rgba(255, 215, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = isGreen 
                ? '0 4px 20px rgba(0, 255, 0, 0.2)'
                : '0 4px 20px rgba(255, 215, 0, 0.2)';
            }}
          >
            {bubble.label}
          </div>
        );
      })}
    </div>
  );
};

export default ModerationBubbles; 