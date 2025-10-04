'use client';

import React from 'react';
import VideoCard, { CampaignVideo } from './VideoCard';

type VideoCarouselProps = {
  videos: CampaignVideo[];
  subTab?: string;
  onInfoClick: (campaign: CampaignVideo) => void;
  onVideoClick?: (campaign: CampaignVideo) => void;
};

export default function VideoCarousel({ videos, subTab, onInfoClick, onVideoClick }: VideoCarouselProps) {
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

  return (
    <div style={{ position: 'relative', padding: '0 2rem' }}>
      {/* Separate Sections for Horizontal and Vertical */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {/* Horizontal Videos */}
        {horizontalVideos.length > 0 && (
          <div>
            <div style={{ fontSize: 14, color: '#999', marginBottom: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              ▬ Horizontal Videos
            </div>
            <div
              style={{
                display: 'flex',
                gap: 24,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingBottom: 20,
                scrollBehavior: 'smooth',
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {horizontalVideos.map((video) => (
                <VideoCard key={video.id} video={video} onInfoClick={onInfoClick} onVideoClick={onVideoClick} variant="carousel" size="medium" />
              ))}
            </div>
          </div>
        )}

        {/* Vertical Videos */}
        {verticalVideos.length > 0 && (
          <div>
            <div style={{ fontSize: 14, color: '#999', marginBottom: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              ▮ Vertical Videos
            </div>
            <div
              style={{
                display: 'flex',
                gap: 24,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                paddingBottom: 20,
                scrollBehavior: 'smooth',
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {verticalVideos.map((video) => (
                <VideoCard key={video.id} video={video} onInfoClick={onInfoClick} onVideoClick={onVideoClick} variant="carousel" size="medium" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
