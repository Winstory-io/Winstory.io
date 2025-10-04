'use client';

import React from 'react';
import VideoCard, { CampaignVideo } from './VideoCard';

type VideoPodiumProps = {
  videos: CampaignVideo[];
  onInfoClick: (video: CampaignVideo) => void;
  onVideoClick?: (video: CampaignVideo) => void;
};

export default function VideoPodium({ videos, onInfoClick, onVideoClick }: VideoPodiumProps) {
  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 500,
          color: '#666',
          gap: 20,
          padding: '0 2rem',
        }}
      >
        <div style={{ fontSize: 80 }}>🏆</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#FFD600', textAlign: 'center' }}>
          No Best Completions Yet
        </div>
        <div style={{ fontSize: 16, textAlign: 'center', maxWidth: 600, lineHeight: 1.8 }}>
          The podium is waiting for extraordinary completions. When campaigns end, the top 3 winners will be showcased
          here with their premium rewards. Will you be the next champion?
        </div>
      </div>
    );
  }

  // Get top 3 videos and add rank
  const topThree = videos.slice(0, 3).map((video, index) => ({
    ...video,
    rank: index + 1,
  }));

  // Better podium layout: horizontal row with cards side by side
  return (
    <div style={{ padding: '0 2rem', maxWidth: 1600, margin: '0 auto' }}>
      {/* Podium Display - Horizontal Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: topThree.length === 3 ? '1fr 1fr 1fr' : topThree.length === 2 ? '1fr 1fr' : '1fr',
          gap: 40,
          margin: '0 auto',
          maxWidth: 1400,
        }}
      >
        {topThree.map((video, index) => {
          const rank = video.rank!;
          const colors = {
            1: { primary: '#FFD700', secondary: '#FFA500', glow: 'rgba(255, 215, 0, 0.4)' },
            2: { primary: '#C0C0C0', secondary: '#808080', glow: 'rgba(192, 192, 192, 0.4)' },
            3: { primary: '#CD7F32', secondary: '#8B4513', glow: 'rgba(205, 127, 50, 0.4)' },
          };
          const color = colors[rank as 1 | 2 | 3];
          
          return (
            <div
              key={video.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: `riseUp 0.8s ease ${index * 0.15}s backwards`,
                position: 'relative',
              }}
            >
              {/* Rank Badge - Floating above */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 40,
                  color: rank === 2 ? '#000' : '#fff',
                  border: '4px solid #000',
                  boxShadow: `0 8px 24px ${color.glow}, 0 0 60px ${color.glow}`,
                  marginBottom: -40,
                  zIndex: 10,
                  position: 'relative',
                }}
              >
                {rank}
              </div>

              {/* Winner Container */}
              <div
                style={{
                  background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
                  borderRadius: 20,
                  padding: rank === 1 ? 24 : 20,
                  border: `3px solid ${color.primary}`,
                  boxShadow: `0 12px 40px ${color.glow}, inset 0 0 30px rgba(0,0,0,0.8)`,
                  transform: rank === 1 ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                  width: '100%',
                }}
              >
                {/* Video Card */}
                <div style={{ marginBottom: 20, marginTop: 30 }}>
                  <VideoCard
                    video={video}
                    onInfoClick={onInfoClick}
                    onVideoClick={onVideoClick}
                    variant="podium"
                    size={rank === 1 ? 'large' : 'medium'}
                  />
                </div>

                {/* Winner Info */}
                <div style={{ textAlign: 'center', paddingTop: 12 }}>
                  <div
                    style={{
                      fontSize: rank === 1 ? 18 : 16,
                      fontWeight: 800,
                      color: color.primary,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: 12,
                      textShadow: `0 0 20px ${color.glow}`,
                    }}
                  >
                    {rank === 1 ? '🏆 Champion' : rank === 2 ? '🥈 Runner-Up' : '🥉 Third Place'}
                  </div>

                  {/* Reward Display */}
                  {video.premiumReward && (
                    <div
                      style={{
                        background: 'rgba(0, 255, 136, 0.15)',
                        border: '2px solid rgba(0, 255, 136, 0.4)',
                        borderRadius: 12,
                        padding: '12px 20px',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#00FF88',
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#00FF88', opacity: 0.7, marginBottom: 4 }}>
                        Premium Reward
                      </div>
                      💰 {video.premiumReward}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Description */}
      <div
        style={{
          maxWidth: 800,
          margin: '40px auto 0',
          textAlign: 'center',
          fontSize: 14,
          color: '#999',
          lineHeight: 1.8,
          padding: '0 20px',
        }}
      >
        <p style={{ marginBottom: 12 }}>
          <span style={{ color: '#FFD600', fontWeight: 700 }}>Premium Rewards</span> are distributed to the top 3
          completions at the end of each campaign.
        </p>
        <p style={{ margin: 0 }}>
          Rankings are determined by moderator votes and community engagement. Keep creating exceptional content to
          claim your spot on the podium!
        </p>
      </div>

      <style jsx>{`
        @keyframes riseUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 