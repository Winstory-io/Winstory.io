'use client';

import React, { useState } from 'react';
import VideoCard, { CampaignVideo } from './VideoCard';

type VideoCarouselProps = {
  videos: CampaignVideo[];
  subTab?: string;
  onInfoClick: (campaign: CampaignVideo) => void;
  onVideoClick?: (campaign: CampaignVideo) => void;
};

export default function VideoCarousel({ videos, subTab, onInfoClick, onVideoClick }: VideoCarouselProps) {
  const [selectedOrientation, setSelectedOrientation] = useState<'all' | 'horizontal' | 'vertical'>('all');

  // Empty state
  if (!videos || videos.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          color: '#666',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 64 }}>🎬</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#FFD600' }}>
          {subTab === 'company' ? 'No Company Campaigns Yet' : 'No Community Campaigns Yet'}
        </div>
        <div style={{ fontSize: 16, textAlign: 'center', maxWidth: 500, lineHeight: 1.6 }}>
          Be the first to discover amazing campaigns when they launch. Check back soon for creative challenges and
          collaborative storytelling opportunities.
        </div>
      </div>
    );
  }

  // Filter by orientation
  const filteredVideos = selectedOrientation === 'all' 
    ? videos 
    : videos.filter(v => v.orientation === selectedOrientation);

  // Reverse order so newest videos appear on the left (newest first)
  const horizontalVideos = filteredVideos.filter(v => v.orientation === 'horizontal').reverse();
  const verticalVideos = filteredVideos.filter(v => v.orientation === 'vertical').reverse();

  return (
    <div style={{ position: 'relative', padding: '0 2rem', maxWidth: 1600, margin: '0 auto' }}>
      {/* Orientation Filter Tabs - Centered */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 40, 
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <button
          onClick={() => setSelectedOrientation('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: selectedOrientation === 'all' ? '#fff' : 'rgba(255, 255, 255, 0.1)',
            border: `2px solid ${selectedOrientation === 'all' ? '#FFD600' : 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: 12,
            color: selectedOrientation === 'all' ? '#000' : '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: selectedOrientation === 'all' ? '0 4px 16px rgba(255, 214, 0, 0.4)' : 'none',
          }}
        >
          <span style={{ fontSize: 18 }}>🎬</span>
          <span>All Videos</span>
        </button>

        <button
          onClick={() => setSelectedOrientation('horizontal')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: selectedOrientation === 'horizontal' ? '#fff' : 'rgba(255, 255, 255, 0.1)',
            border: `2px solid ${selectedOrientation === 'horizontal' ? '#FFD600' : 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: 12,
            color: selectedOrientation === 'horizontal' ? '#000' : '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: selectedOrientation === 'horizontal' ? '0 4px 16px rgba(255, 214, 0, 0.4)' : 'none',
          }}
        >
          <span style={{ fontSize: 20 }}>▬</span>
          <span>Horizontal</span>
        </button>

        <button
          onClick={() => setSelectedOrientation('vertical')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: selectedOrientation === 'vertical' ? '#fff' : 'rgba(255, 255, 255, 0.1)',
            border: `2px solid ${selectedOrientation === 'vertical' ? '#FFD600' : 'rgba(255, 255, 255, 0.2)'}`,
            borderRadius: 12,
            color: selectedOrientation === 'vertical' ? '#000' : '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: selectedOrientation === 'vertical' ? '0 4px 16px rgba(255, 214, 0, 0.4)' : 'none',
          }}
        >
          <span style={{ fontSize: 20 }}>▮</span>
          <span>Vertical</span>
        </button>
      </div>

      {/* Content Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {/* Horizontal Videos - Show if "All" or "Horizontal" selected */}
        {(selectedOrientation === 'all' || selectedOrientation === 'horizontal') && horizontalVideos.length > 0 && (
          <div>
            <div style={{ 
              fontSize: 14, 
              color: '#999', 
              marginBottom: 20, 
              fontWeight: 600, 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              textAlign: 'center',
            }}>
              ▬ Horizontal Videos ({horizontalVideos.length})
            </div>
            
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                columnGap: 24, // Reduced horizontal gap for closer videos
                rowGap: 80, // Much larger vertical gap to prevent hover overlap
                paddingTop: 60,
                paddingBottom: 60,
                maxWidth: '100%',
                margin: '0 auto',
              }}
            >
              {horizontalVideos.map((video, index) => {
                const totalVideos = horizontalVideos.length;
                const remainder = totalVideos % 3;
                const isInLastRow = index >= totalVideos - remainder && remainder !== 0;
                
                let gridColumn = 'span 1';
                let additionalStyle: React.CSSProperties = {};
                
                if (isInLastRow && remainder === 1) {
                  // Only 1 video in last row - center it
                  gridColumn = '2 / 3';
                } else if (isInLastRow && remainder === 2) {
                  // 2 videos in last row - bring them much closer together
                  if (index === totalVideos - 2) {
                    gridColumn = '1 / 2'; // First of the two
                    additionalStyle.marginLeft = '25%'; // Pull more from left
                  } else {
                    gridColumn = '3 / 4'; // Second of the two
                    additionalStyle.marginRight = '25%'; // Pull more from right
                  }
                }

                return (
                  <div
                    key={video.id}
                    style={{
                      gridColumn: gridColumn,
                      animation: 'fadeSlideIn 0.5s ease backwards',
                      animationDelay: `${index * 0.1}s`,
                      display: 'flex',
                      justifyContent: 'center',
                      transform: 'scale(1.15)',
                      ...additionalStyle,
                    }}
                  >
                    <VideoCard 
                      video={video} 
                      onInfoClick={onInfoClick} 
                      onVideoClick={onVideoClick} 
                      variant="carousel" 
                      size="large"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vertical Videos - Show if "All" or "Vertical" selected */}
        {(selectedOrientation === 'all' || selectedOrientation === 'vertical') && verticalVideos.length > 0 && (
          <div>
            <div style={{ 
              fontSize: 14, 
              color: '#999', 
              marginBottom: 20, 
              fontWeight: 600, 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              textAlign: 'center',
            }}>
              ▮ Vertical Videos ({verticalVideos.length})
            </div>
            
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                columnGap: 24, // Reduced horizontal gap for closer videos
                rowGap: 70, // Much larger vertical gap to prevent hover overlap
                paddingTop: 48,
                paddingBottom: 20,
                maxWidth: '100%',
                margin: '0 auto',
              }}
            >
              {verticalVideos.map((video, index) => {
                const totalVideos = verticalVideos.length;
                const remainder = totalVideos % 3;
                const isInLastRow = index >= totalVideos - remainder && remainder !== 0;
                
                let gridColumn = 'span 1';
                let additionalStyle: React.CSSProperties = {};
                
                if (isInLastRow && remainder === 1) {
                  // Only 1 video in last row - center it
                  gridColumn = '2 / 3';
                } else if (isInLastRow && remainder === 2) {
                  // 2 videos in last row - bring them much closer together
                  if (index === totalVideos - 2) {
                    gridColumn = '1 / 2'; // First of the two
                    additionalStyle.marginLeft = '30%'; // Pull much more from left (more for vertical)
                  } else {
                    gridColumn = '3 / 4'; // Second of the two
                    additionalStyle.marginRight = '30%'; // Pull much more from right (more for vertical)
                  }
                }

                return (
                  <div
                    key={video.id}
                    style={{
                      gridColumn: gridColumn,
                      animation: 'fadeSlideIn 0.5s ease backwards',
                      animationDelay: `${index * 0.1}s`,
                      display: 'flex',
                      justifyContent: 'center',
                      ...additionalStyle,
                    }}
                  >
                    <VideoCard 
                      video={video} 
                      onInfoClick={onInfoClick} 
                      onVideoClick={onVideoClick} 
                      variant="carousel" 
                      size="medium" 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
