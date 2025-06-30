import React from 'react';

type VideoMosaicProps = {
  videos: any[];
  onInfoClick: (video: any) => void;
};

export default function VideoMosaic({ videos, onInfoClick }: VideoMosaicProps) {
  // Placeholder : à remplacer par la vraie mosaïque Netflix
  return (
    <div style={{ textAlign: 'center', color: '#FFD600', fontSize: 20 }}>
      Mosaïque de toutes les vidéos (à implémenter)
    </div>
  );
} 