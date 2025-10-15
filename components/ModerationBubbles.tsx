import React from 'react';
import { useModerationComponentConfig } from '@/lib/hooks/useModerationDevControls';

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
  bubbleSize, 
  bubbleGap,
  campaignType = 'initial',
  hasRewards = false
}) => {
  // Utiliser les Dev Controls pour la configuration
  const { styles, theme } = useModerationComponentConfig('bubbles');
  
  // Utiliser les valeurs des Dev Controls ou les props en fallback
  const finalBubbleSize = bubbleSize || styles.defaultSize || 100;
  const finalBubbleGap = bubbleGap || styles.defaultGap || 24;
  const fontSize = styles.fontSize || 14;
  const colors = styles.colors || {
    primary: '#FFD600',
    secondary: '#FFD600',
    green: '#00FF00',
    red: '#FF0000',
    yellow: '#FFD700',
  };
  const animations = styles.animations || {
    hoverScale: 1.05,
    transitionDuration: '0.3s ease',
  };
  const getBubbles = () => {
    // Bulles communes à tous les types
    const commonBubbles = [
      { key: 'startingText', label: 'Starting Story', onClick: () => onBubbleClick('startingText') },
      { key: 'guideline', label: 'Guideline', onClick: () => onBubbleClick('guideline') },
    ];

    // Pour les campagnes de completion
    if (campaignType === 'completion') {
      // Toujours afficher Rewards en vert (y compris For Individuals), et rendre Also Starting/Guideline verts
      return [
        { key: 'rewards', label: 'Rewards', onClick: () => onBubbleClick('rewards'), isGreen: true },
        { key: 'initialVideo', label: 'Initial Video', onClick: () => onBubbleClick('initialVideo'), isGreen: true },
        { key: 'startingText', label: 'Starting Story', onClick: () => onBubbleClick('startingText'), isGreen: true },
        { key: 'guideline', label: 'Guideline', onClick: () => onBubbleClick('guideline'), isGreen: true },
      ];
    }

    // Pour les campagnes initiales
    // B2C/Agency: Rewards si présents
    if (userType === 'b2c' || userType === 'agency') {
      if (hasRewards) {
        return [
          { key: 'rewards', label: 'Rewards', onClick: () => onBubbleClick('rewards') },
          ...commonBubbles
        ];
      }
      return commonBubbles;
    }

    // Individual Creators: toujours afficher une bulle Rewards jaune (WINC pool)
    if (userType === 'individual') {
      return [
        { key: 'rewards', label: 'Rewards', onClick: () => onBubbleClick('rewards') },
        ...commonBubbles
      ];
    }

    // fallback
    return commonBubbles;
  };

  const bubbles = getBubbles();
  const totalHeight = bubbles.length * finalBubbleSize + (bubbles.length - 1) * finalBubbleGap;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: finalBubbleGap,
        width: finalBubbleSize,
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
              width: finalBubbleSize,
              height: finalBubbleSize,
              fontSize: fontSize,
              background: isGreen 
                ? `linear-gradient(135deg, ${colors.green}20 0%, ${colors.green}10 100%)`
                : `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.primary}10 100%)`,
              border: isGreen 
                ? `2px solid ${colors.green}60`
                : `2px solid ${colors.primary}60`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isGreen ? colors.green : colors.primary,
              fontWeight: 600,
              textAlign: 'center',
              padding: '4px',
              transition: animations.transitionDuration,
              textShadow: isGreen 
                ? `0 0 10px ${colors.green}50`
                : `0 0 10px ${colors.primary}50`,
              boxShadow: isGreen 
                ? `0 4px 20px ${colors.green}20`
                : `0 4px 20px ${colors.primary}20`,
              userSelect: 'none'
            }}
            onClick={bubble.onClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `scale(${animations.hoverScale})`;
              e.currentTarget.style.boxShadow = isGreen 
                ? `0 6px 25px ${colors.green}30`
                : `0 6px 25px ${colors.primary}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = isGreen 
                ? `0 4px 20px ${colors.green}20`
                : `0 4px 20px ${colors.primary}20`;
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