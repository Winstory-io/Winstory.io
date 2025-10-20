'use client';

import React, { useState } from 'react';
import ModerationStatsDevControls from './ModerationStatsDevControls';

interface ModerationStatsDevControlsButtonProps {
  className?: string;
  style?: React.CSSProperties;
  onStatsUpdate?: (stats: any) => void;
}

const ModerationStatsDevControlsButton: React.FC<ModerationStatsDevControlsButtonProps> = ({
  className,
  style,
  onStatsUpdate
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  // Toujours afficher en développement, même en production pour les tests
  const isDevMode = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_DEV_CONTROLS === 'true';
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
          bottom: 80, // Positionné au-dessus du bouton Dev Controls principal
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
        title="Ouvrir les Dev Controls des Statistiques de Modération"
      >
        📊 Stats Controls
      </button>

      <ModerationStatsDevControls
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onStatsUpdate={onStatsUpdate}
      />
    </>
  );
};

export default ModerationStatsDevControlsButton;
