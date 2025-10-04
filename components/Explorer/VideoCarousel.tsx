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
  const [horizontalPage, setHorizontalPage] = useState(0);
  const [verticalPage, setVerticalPage] = useState(0);

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

  const horizontalVideos = videos.filter(v => v.orientation === 'horizontal');
  const verticalVideos = videos.filter(v => v.orientation === 'vertical');

  const VIDEOS_PER_PAGE = 4;
  
  // Pagination for horizontal videos
  const totalHorizontalPages = Math.ceil(horizontalVideos.length / VIDEOS_PER_PAGE);
  const horizontalStartIndex = horizontalPage * VIDEOS_PER_PAGE;
  const visibleHorizontalVideos = horizontalVideos.slice(horizontalStartIndex, horizontalStartIndex + VIDEOS_PER_PAGE);

  // Pagination for vertical videos
  const totalVerticalPages = Math.ceil(verticalVideos.length / VIDEOS_PER_PAGE);
  const verticalStartIndex = verticalPage * VIDEOS_PER_PAGE;
  const visibleVerticalVideos = verticalVideos.slice(verticalStartIndex, verticalStartIndex + VIDEOS_PER_PAGE);

  const NavigationButton = ({ 
    direction, 
    onClick, 
    disabled 
  }: { 
    direction: 'left' | 'right'; 
    onClick: () => void; 
    disabled: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'absolute',
        top: '50%',
        [direction === 'left' ? 'left' : 'right']: -20,
        transform: 'translateY(-50%)',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: disabled ? 'rgba(50, 50, 50, 0.5)' : 'rgba(0, 0, 0, 0.85)',
        border: `2px solid ${disabled ? 'rgba(100, 100, 100, 0.3)' : 'rgba(255, 214, 0, 0.6)'}`,
        color: disabled ? '#555' : '#FFD600',
        fontSize: 28,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.6)',
        opacity: disabled ? 0.3 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255, 214, 0, 0.95)';
          e.currentTarget.style.color = '#000';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.85)';
          e.currentTarget.style.color = '#FFD600';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }
      }}
      aria-label={`Scroll ${direction}`}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );

  return (
    <div style={{ position: 'relative', padding: '0 2rem' }}>
      {/* Separate Sections for Horizontal and Vertical */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {/* Horizontal Videos - Grid with Pagination */}
        {horizontalVideos.length > 0 && (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                ▬ Horizontal Videos
              </div>
              {totalHorizontalPages > 1 && (
                <div style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                  {horizontalPage + 1} / {totalHorizontalPages}
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              {/* Navigation Buttons */}
              {totalHorizontalPages > 1 && (
                <>
                  <NavigationButton
                    direction="left"
                    onClick={() => setHorizontalPage(Math.max(0, horizontalPage - 1))}
                    disabled={horizontalPage === 0}
                  />
                  <NavigationButton
                    direction="right"
                    onClick={() => setHorizontalPage(Math.min(totalHorizontalPages - 1, horizontalPage + 1))}
                    disabled={horizontalPage === totalHorizontalPages - 1}
                  />
                </>
              )}

              {/* Grid Display */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(visibleHorizontalVideos.length, 4)}, 1fr)`,
                  gap: 24,
                  paddingTop: 48,
                  paddingBottom: 20,
                  justifyItems: 'center',
                  transition: 'all 0.4s ease',
                }}
              >
                {visibleHorizontalVideos.map((video, index) => (
                  <div
                    key={video.id}
                    style={{
                      animation: 'fadeSlideIn 0.5s ease backwards',
                      animationDelay: `${index * 0.1}s`,
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
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vertical Videos - Grid with Pagination */}
        {verticalVideos.length > 0 && (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                ▮ Vertical Videos
              </div>
              {totalVerticalPages > 1 && (
                <div style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
                  {verticalPage + 1} / {totalVerticalPages}
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              {/* Navigation Buttons */}
              {totalVerticalPages > 1 && (
                <>
                  <NavigationButton
                    direction="left"
                    onClick={() => setVerticalPage(Math.max(0, verticalPage - 1))}
                    disabled={verticalPage === 0}
                  />
                  <NavigationButton
                    direction="right"
                    onClick={() => setVerticalPage(Math.min(totalVerticalPages - 1, verticalPage + 1))}
                    disabled={verticalPage === totalVerticalPages - 1}
                  />
                </>
              )}

              {/* Grid Display */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(visibleVerticalVideos.length, 4)}, 1fr)`,
                  gap: 24,
                  paddingTop: 48,
                  paddingBottom: 20,
                  justifyItems: 'center',
                  transition: 'all 0.4s ease',
                }}
              >
                {visibleVerticalVideos.map((video, index) => (
                  <div
                    key={video.id}
                    style={{
                      animation: 'fadeSlideIn 0.5s ease backwards',
                      animationDelay: `${index * 0.1}s`,
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
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
