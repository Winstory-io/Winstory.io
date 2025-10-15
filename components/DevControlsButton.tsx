import React, { useState } from 'react';
import DevControlsPanel from './DevControlsPanel';

interface DevControlsButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

const DevControlsButton: React.FC<DevControlsButtonProps> = ({ className, style }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);

  // Détecter le mode développement
  React.useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' ||
                         window.location.search.includes('dev=true');
    setIsDevMode(isDevelopment);
  }, []);

  // Ne pas afficher en production
  if (!isDevMode) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          background: '#111',
          color: '#FFD600',
          border: '1px solid #6B5A20',
          borderRadius: 12,
          padding: '10px 12px',
          fontWeight: 800,
          cursor: 'pointer',
          zIndex: 50,
          fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1a1a1a';
          e.currentTarget.style.borderColor = '#FFD600';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#111';
          e.currentTarget.style.borderColor = '#6B5A20';
        }}
        title="Ouvrir les Dev Controls"
      >
        ⚙️ Dev Controls
      </button>

      <DevControlsPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
};

export default DevControlsButton;
