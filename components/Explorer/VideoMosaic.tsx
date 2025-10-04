'use client';

import React, { useState, useEffect } from 'react';
import VideoCard, { CampaignVideo } from './VideoCard';

type VideoMosaicProps = {
  videos: CampaignVideo[];
  onInfoClick: (video: CampaignVideo) => void;
  onVideoClick?: (video: CampaignVideo) => void;
  externalTypeFilter?: 'all' | 'company' | 'community' | 'completed';
  externalFormatFilter?: 'all' | 'horizontal' | 'vertical';
  externalSortBy?: 'recent' | 'popular';
};

type FilterType = 'all' | 'company' | 'community' | 'completed';
type OrientationFilter = 'all' | 'horizontal' | 'vertical';

export default function VideoMosaic({ 
  videos, 
  onInfoClick, 
  onVideoClick,
  externalTypeFilter = 'all',
  externalFormatFilter = 'all',
  externalSortBy = 'recent',
}: VideoMosaicProps) {
  const [filter, setFilter] = useState<FilterType>(externalTypeFilter);
  const [orientationFilter, setOrientationFilter] = useState<OrientationFilter>(externalFormatFilter);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>(externalSortBy);

  // Update internal state when external filters change
  useEffect(() => {
    setFilter(externalTypeFilter);
    setOrientationFilter(externalFormatFilter);
    setSortBy(externalSortBy);
  }, [externalTypeFilter, externalFormatFilter, externalSortBy]);

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
        <div style={{ fontSize: 80 }}>🌐</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#FFD600', textAlign: 'center' }}>
          No Campaigns Available
        </div>
        <div style={{ fontSize: 16, textAlign: 'center', maxWidth: 600, lineHeight: 1.8 }}>
          The Winstory ecosystem is ready to launch. Soon, this space will be filled with creative campaigns from
          companies and community creators. Be ready to explore and create!
        </div>
      </div>
    );
  }

  // Filter videos based on selected filters
  const filteredVideos = videos.filter((video) => {
    // Type filter
    if (filter === 'company' && !video.companyName) return false;
    if (filter === 'community' && video.companyName) return false;
    if (filter === 'completed' && video.completionPercentage !== 100) return false;
    
    // Orientation filter
    if (orientationFilter === 'horizontal' && video.orientation !== 'horizontal') return false;
    if (orientationFilter === 'vertical' && video.orientation !== 'vertical') return false;
    
    return true;
  });

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === 'recent') {
      return 0; // Assuming they're already in recent order
    } else {
      // Sort by completion percentage or another popularity metric
      return (b.completionPercentage || 0) - (a.completionPercentage || 0);
    }
  });

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: 'All Campaigns', icon: '🌟' },
    { key: 'company', label: 'Companies', icon: '🏢' },
    { key: 'community', label: 'Community', icon: '👥' },
    { key: 'completed', label: 'Completed', icon: '✅' },
  ];

  return (
    <div style={{ padding: '0 2rem' }}>
      {/* Results Count */}
      <div
        style={{
          fontSize: 14,
          color: '#999',
          marginBottom: 24,
          fontWeight: 600,
        }}
      >
        {sortedVideos.length} campaign{sortedVideos.length !== 1 ? 's' : ''} found
      </div>

      {/* Mosaic Grid */}
      {sortedVideos.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666',
            fontSize: 18,
          }}
        >
          No campaigns match your filter. Try selecting a different category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* Horizontal Videos Section */}
          {sortedVideos.filter(v => v.orientation === 'horizontal').length > 0 && (
            <div>
              <div style={{ fontSize: 14, color: '#999', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                ▬ Horizontal Videos ({sortedVideos.filter(v => v.orientation === 'horizontal').length})
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 24,
                  justifyItems: 'center',
                  maxWidth: '100%',
                  margin: '0 auto',
                  paddingTop: 48,
                }}
              >
                {sortedVideos
                  .filter(v => v.orientation === 'horizontal')
                  .map((video) => (
                    <div
                      key={video.id}
                      style={{
                        animation: 'fadeInUp 0.6s ease backwards',
                      }}
                    >
                      <VideoCard video={video} onInfoClick={onInfoClick} onVideoClick={onVideoClick} variant="mosaic" size="medium" />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Vertical Videos Section */}
          {sortedVideos.filter(v => v.orientation === 'vertical').length > 0 && (
            <div>
              <div style={{ fontSize: 14, color: '#999', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                ▮ Vertical Videos ({sortedVideos.filter(v => v.orientation === 'vertical').length})
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 24,
                  justifyItems: 'center',
                  maxWidth: '100%',
                  margin: '0 auto',
                  paddingTop: 48,
                }}
              >
                {sortedVideos
                  .filter(v => v.orientation === 'vertical')
                  .map((video) => (
                    <div
                      key={video.id}
                      style={{
                        animation: 'fadeInUp 0.6s ease backwards',
                      }}
                    >
                      <VideoCard video={video} onInfoClick={onInfoClick} onVideoClick={onVideoClick} variant="mosaic" size="medium" />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {sortedVideos.length >= 12 && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40, paddingBottom: 20 }}>
          <button
            style={{
              background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)',
              border: '2px solid #FFD600',
              borderRadius: 28,
              padding: '14px 40px',
              color: '#FFD600',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 16px rgba(255, 214, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #FFD600 0%, #FFA500 100%)';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 214, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, rgba(255, 214, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)';
              e.currentTarget.style.color = '#FFD600';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 214, 0, 0.2)';
            }}
          >
            Load More Campaigns
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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