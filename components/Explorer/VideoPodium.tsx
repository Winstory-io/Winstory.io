import React from 'react';

type VideoPodiumProps = {
  videos: any[];
  onInfoClick: (video: any) => void;
};

export default function VideoPodium({ videos, onInfoClick }: VideoPodiumProps) {
  // Placeholder : à remplacer par l'affichage réel du podium
  return (
    <div style={{ textAlign: 'center', color: '#FFD600', fontSize: 20 }}>
      Podium des Best Completions (à implémenter)
    </div>
  );
} 