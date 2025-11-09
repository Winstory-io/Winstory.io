import React from 'react';

export type FeedbackType = 'valid-initial' | 'refuse-initial' | 'valid-completion' | 'refuse-completion';

interface ModerationFeedbackProps {
  type: FeedbackType;
  score?: number;
}

const ModerationFeedback: React.FC<ModerationFeedbackProps> = ({ type, score }) => {
  const isValid = type.startsWith('valid');
  const isCompletion = type.includes('completion');

  const getMessage = () => {
    switch (type) {
      case 'valid-initial':
        return 'Initial Story validated successfully';
      case 'refuse-initial':
        return 'Initial Story refused';
      case 'valid-completion':
        return score 
          ? `Completion validated and scored ${score}/100 successfully`
          : 'Completion validated and scored successfully';
      case 'refuse-completion':
        return 'Completion refused';
      default:
        return 'Action completed';
    }
  };

  const getIcon = () => {
    return isValid ? '✅' : '❌';
  };

  const getColors = () => {
    if (isValid) {
      return {
        border: '#37FF00',
        background: 'rgba(55, 255, 0, 0.1)',
        text: '#37FF00',
        shadow: 'rgba(55, 255, 0, 0.3)'
      };
    } else {
      return {
        border: '#FF0000',
        background: 'rgba(255, 0, 0, 0.1)',
        text: '#FF0000',
        shadow: 'rgba(255, 0, 0, 0.3)'
      };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)',
          border: `3px solid ${colors.border}`,
          borderRadius: '20px',
          padding: '48px 64px',
          maxWidth: '500px',
          boxShadow: `0 20px 60px ${colors.shadow}, 0 0 40px ${colors.shadow}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Effet de glow subtil en arrière-plan */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${colors.shadow} 0%, transparent 70%)`,
            opacity: 0.3,
            pointerEvents: 'none'
          }}
        />

        {/* Icône */}
        <div
          style={{
            fontSize: '72px',
            lineHeight: 1,
            filter: `drop-shadow(0 4px 12px ${colors.shadow})`,
            position: 'relative',
            zIndex: 1
          }}
        >
          {getIcon()}
        </div>

        {/* Message */}
        <div
          style={{
            color: colors.text,
            fontSize: '22px',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.4,
            textShadow: `0 2px 8px ${colors.shadow}`,
            position: 'relative',
            zIndex: 1
          }}
        >
          {getMessage()}
        </div>

        {/* Sous-message informatif */}
        <div
          style={{
            color: '#999',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: 400,
            position: 'relative',
            zIndex: 1
          }}
        >
          Loading next content...
        </div>

        {/* Barre de progression */}
        <div
          style={{
            width: '100%',
            height: '3px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: colors.border,
              borderRadius: '2px',
              animation: 'progressBar 3s linear forwards',
              transformOrigin: 'left'
            }}
          />
        </div>

        {/* Animation CSS pour la barre de progression */}
        <style>{`
          @keyframes progressBar {
            from {
              transform: scaleX(1);
            }
            to {
              transform: scaleX(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ModerationFeedback;

