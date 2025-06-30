import React from 'react';

type Video = {
  id: number;
  company: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  info: any;
};

type VideoCarouselProps = {
  videos: Video[];
  subTab?: string;
  onInfoClick: (campaign: Video) => void;
};

export default function VideoCarousel({ videos, onInfoClick }: VideoCarouselProps) {
  return (
    <div style={{ display: 'flex', gap: 32, overflowX: 'auto', padding: '0 2rem' }}>
      {videos.map(video => (
        <div key={video.id} style={{ minWidth: 280, background: '#181818', borderRadius: 12, boxShadow: '0 2px 12px #0008', position: 'relative', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <button
              onClick={() => window.location.href = '/welcome'}
              style={{
                background: 'none',
                border: 'none',
                color: '#00FFB0',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                padding: 0,
                marginRight: 4,
              }}
              aria-label="Go to Welcome"
            >
              @{video.company}
            </button>
            <button
              onClick={() => onInfoClick(video)}
              style={{
                background: '#FFD600',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                marginLeft: 8,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 20,
                color: '#181818',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Infos"
            >
              i
            </button>
          </div>
          <div style={{ fontStyle: 'italic', color: '#bfae5e', marginBottom: 8 }}>{video.title}</div>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <img src={video.thumbnail} alt={video.title} style={{ width: '100%', borderRadius: 8 }} />
            <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#000a',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFD600',
              fontSize: 28,
              textDecoration: 'none',
            }}>
              ▶
            </a>
          </div>
        </div>
      ))}
    </div>
  );
} 