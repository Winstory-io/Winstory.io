'use client';

import React, { useState } from 'react';
import VideoCard, { CampaignVideo } from './VideoCard';

type VideoPodiumProps = {
  videos: CampaignVideo[];
  onInfoClick: (video: CampaignVideo) => void;
  onVideoClick?: (video: CampaignVideo) => void;
};

export default function VideoPodium({ videos, onInfoClick, onVideoClick }: VideoPodiumProps) {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL RETURNS
  const [selectedOrientation, setSelectedOrientation] = useState<'all' | 'horizontal' | 'vertical'>('all');
  const [showBubbleContent, setShowBubbleContent] = useState<{ type: 'starting' | 'guideline'; content: string } | null>(null);
  const [allIndex, setAllIndex] = useState(0);
  const [horizontalIndex, setHorizontalIndex] = useState(0);
  const [verticalIndex, setVerticalIndex] = useState(0);

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

  // Group campaigns by orientation
  const allCampaigns: CampaignVideo[][] = [];
  const horizontalCampaigns: CampaignVideo[][] = [];
  const verticalCampaigns: CampaignVideo[][] = [];

  // Group videos into campaigns (1 initial + up to 3 completions)
  const allVideos = [...videos];
  let currentGroup: CampaignVideo[] = [];
  
  for (let i = 0; i < allVideos.length; i++) {
    currentGroup.push(allVideos[i]);
    
    // When we have 4 videos or reach the end, save the group
    if (currentGroup.length === 4 || i === allVideos.length - 1) {
      allCampaigns.push([...currentGroup]);
      if (currentGroup[0].orientation === 'horizontal') {
        horizontalCampaigns.push([...currentGroup]);
      } else {
        verticalCampaigns.push([...currentGroup]);
      }
      currentGroup = [];
    }
  }

  const activeCampaigns = selectedOrientation === 'all' ? allCampaigns : (selectedOrientation === 'horizontal' ? horizontalCampaigns : verticalCampaigns);
  const currentIndex = selectedOrientation === 'all' ? allIndex : (selectedOrientation === 'horizontal' ? horizontalIndex : verticalIndex);
  const setCurrentIndex = selectedOrientation === 'all' ? setAllIndex : (selectedOrientation === 'horizontal' ? setHorizontalIndex : setVerticalIndex);

  if (activeCampaigns.length === 0) {
    return (
      <div style={{ padding: '0 2rem', textAlign: 'center', color: '#666', fontSize: 16 }}>
        No {selectedOrientation} campaigns available in Best Completions.
      </div>
    );
  }

  const currentCampaign = activeCampaigns[currentIndex];
  const initialVideo = currentCampaign[0];
  const topCompletions = currentCampaign.slice(1, 4).map((video, index) => ({
    ...video,
    rank: index + 1,
  }));

  const isHorizontal = initialVideo.orientation === 'horizontal';

  return (
    <div style={{ padding: '0 2rem', maxWidth: 1800, margin: '0 auto', marginTop: '-3rem' }}>
      {/* Filters Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12,
        minWidth: 180,
        marginTop: 80,
        marginBottom: 40,
        position: 'relative',
        zIndex: 20,
      }}>
        <div style={{ 
          fontSize: 14, 
          color: '#999', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: 8,
        }}>
          Filters
        </div>

        <button
          onClick={() => {
            setSelectedOrientation('all');
            setAllIndex(0);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: selectedOrientation === 'all' ? '#fff' : 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${selectedOrientation === 'all' ? '#FFD600' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: 12,
            color: selectedOrientation === 'all' ? '#000' : '#999',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left',
            width: '100%',
            maxWidth: 200,
            boxShadow: selectedOrientation === 'all' ? '0 4px 16px rgba(255, 214, 0, 0.4)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (selectedOrientation !== 'all') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#FFD600';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedOrientation !== 'all') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#999';
            }
          }}
        >
          <span style={{ fontSize: 18 }}>🎬</span>
          <span>All Videos</span>
        </button>

        <button
          onClick={() => {
            setSelectedOrientation('horizontal');
            setHorizontalIndex(0);
          }}
          disabled={horizontalCampaigns.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: selectedOrientation === 'horizontal' ? '#fff' : 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${selectedOrientation === 'horizontal' ? '#FFD600' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: 12,
            color: selectedOrientation === 'horizontal' ? '#000' : '#999',
            fontSize: 14,
            fontWeight: 700,
            cursor: horizontalCampaigns.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left',
            width: '100%',
            maxWidth: 200,
            opacity: horizontalCampaigns.length === 0 ? 0.3 : 1,
            boxShadow: selectedOrientation === 'horizontal' ? '0 4px 16px rgba(255, 214, 0, 0.4)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (selectedOrientation !== 'horizontal' && horizontalCampaigns.length > 0) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#FFD600';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedOrientation !== 'horizontal' && horizontalCampaigns.length > 0) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#999';
            }
          }}
        >
          <span style={{ fontSize: 20 }}>▬</span>
          <span>Horizontal</span>
        </button>

        <button
          onClick={() => {
            setSelectedOrientation('vertical');
            setVerticalIndex(0);
          }}
          disabled={verticalCampaigns.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            background: selectedOrientation === 'vertical' ? '#fff' : 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${selectedOrientation === 'vertical' ? '#FFD600' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: 12,
            color: selectedOrientation === 'vertical' ? '#000' : '#999',
            fontSize: 14,
            fontWeight: 700,
            cursor: verticalCampaigns.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            textAlign: 'left',
            width: '100%',
            maxWidth: 200,
            opacity: verticalCampaigns.length === 0 ? 0.3 : 1,
            boxShadow: selectedOrientation === 'vertical' ? '0 4px 16px rgba(255, 214, 0, 0.4)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (selectedOrientation !== 'vertical' && verticalCampaigns.length > 0) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#FFD600';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedOrientation !== 'vertical' && verticalCampaigns.length > 0) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#999';
            }
          }}
        >
          <span style={{ fontSize: 20 }}>▮</span>
          <span>Vertical</span>
        </button>
      </div>

      {/* Campaign Display */}
      <div style={{ position: 'relative', marginTop: isHorizontal ? -290 : -200 }}>
        {/* Campaign Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: isHorizontal ? 'column' : 'row',
            gap: isHorizontal ? 24 : 16,
            alignItems: isHorizontal ? 'center' : 'flex-start',
            justifyContent: isHorizontal ? 'center' : 'center',
            animation: 'fadeSlideIn 0.5s ease',
            width: '100%',
          }}
        >
          {/* Initial Video with Bubbles (only for horizontal) */}
          <div style={{ 
            display: 'flex', 
            alignItems: isHorizontal ? 'center' : 'flex-start',
            gap: isHorizontal ? 60 : 0,
            flexDirection: isHorizontal ? 'row' : 'column',
            marginTop: 0,
            marginBottom: isHorizontal ? 20 : 20,
          }}>
            {/* Starting Story Bubble - Only for horizontal */}
            {isHorizontal && (
              <div
                onClick={() => setShowBubbleContent({ type: 'starting', content: initialVideo.startingStory || 'Starting story...' })}
                style={{
                  width: 90,
                  height: 90,
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFD600',
                  fontWeight: 600,
                  fontSize: 12,
                  textAlign: 'center',
                  padding: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.2)';
                }}
              >
                Starting<br/>Story
              </div>
            )}

            {/* Initial Video - Hover disabled to prevent layout shift */}
            <div
              style={{
                padding: 8,
                border: '3px solid #00FF88',
                borderRadius: 16,
                boxShadow: '0 12px 40px rgba(0, 255, 136, 0.3)',
                transform: isHorizontal ? 'scale(1.0)' : 'scale(0.85)',
              }}
            >
              <VideoCard
                video={initialVideo}
                onInfoClick={onInfoClick}
                onVideoClick={onVideoClick}
                variant="podium"
                size={isHorizontal ? "medium" : "small"}
                disableHover={true}
              />
            </div>

            {/* Guideline Bubble - Only for horizontal */}
            {isHorizontal && (
              <div
                onClick={() => setShowBubbleContent({ type: 'guideline', content: initialVideo.guidelines || 'Guidelines...' })}
                style={{
                  width: 90,
                  height: 90,
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFD600',
                  fontWeight: 600,
                  fontSize: 12,
                  textAlign: 'center',
                  padding: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.2)';
                }}
              >
                Guideline
              </div>
            )}
          </div>

          {/* Bubbles for Vertical Layout - Between initial and completions */}
          {!isHorizontal && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
              {/* Starting Story Bubble */}
              <div
                onClick={() => setShowBubbleContent({ type: 'starting', content: initialVideo.startingStory || 'Starting story...' })}
                style={{
                  width: 70,
                  height: 70,
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFD600',
                  fontWeight: 600,
                  fontSize: 11,
                  textAlign: 'center',
                  padding: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.2)';
                }}
              >
                Starting<br/>Story
              </div>

              {/* Guideline Bubble */}
              <div
                onClick={() => setShowBubbleContent({ type: 'guideline', content: initialVideo.guidelines || 'Guidelines...' })}
                style={{
                  width: 70,
                  height: 70,
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFD600',
                  fontWeight: 600,
                  fontSize: 11,
                  textAlign: 'center',
                  padding: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 215, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.2)';
                }}
              >
                Guideline
              </div>
            </div>
          )}

          {/* Top 3 Completions - Always Side by Side */}
          {topCompletions.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${topCompletions.length}, 1fr)`,
                gap: isHorizontal ? 16 : 10,
                alignItems: 'flex-start',
                marginTop: 0,
              }}
            >
              {topCompletions.map((video) => {
                const rank = video.rank!;
                const colors = {
                  1: { primary: '#FFD700', glow: 'rgba(255, 215, 0, 0.4)' },
                  2: { primary: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.4)' },
                  3: { primary: '#CD7F32', glow: 'rgba(205, 127, 50, 0.4)' },
                };
                const color = colors[rank as 1 | 2 | 3];

                return (
                  <div
                    key={video.id}
                    style={{
                      position: 'relative',
                      animation: `fadeIn 0.5s ease ${rank * 0.15}s backwards`,
                    }}
                  >
                    {/* Ranking Badge - Closer to video */}
                    <div
                      style={{
                        position: 'absolute',
                        top: isHorizontal ? -8 : -6,
                        left: isHorizontal ? -8 : -6,
                        width: isHorizontal ? 44 : 38,
                        height: isHorizontal ? 44 : 38,
                        borderRadius: '50%',
                        background: color.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: isHorizontal ? 24 : 20,
                        color: rank === 2 ? '#000' : '#fff',
                        border: '3px solid #000',
                        boxShadow: `0 4px 16px ${color.glow}, 0 0 20px ${color.glow}`,
                        zIndex: 100,
                      }}
                    >
                      {rank}
                    </div>

                    {/* Completion Card */}
                    <div
                      style={{
                        padding: 6,
                        border: `2px solid ${color.primary}`,
                        borderRadius: 16,
                        boxShadow: `0 6px 20px ${color.glow}`,
                        transform: isHorizontal ? 'scale(1)' : 'scale(0.85)',
                      }}
                    >
                      <VideoCard
                        video={video}
                        onInfoClick={onInfoClick}
                        onVideoClick={onVideoClick}
                        variant="podium"
                        size="small"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bubble Content Modal */}
      {showBubbleContent && (
        <div
          onClick={() => setShowBubbleContent(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
              borderRadius: 20,
              padding: 40,
              maxWidth: 600,
              width: '100%',
              border: '2px solid #FFD600',
              boxShadow: '0 20px 60px rgba(255, 214, 0, 0.3)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowBubbleContent(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(255, 214, 0, 0.2)',
                border: '2px solid #FFD600',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 20,
                fontWeight: 700,
                color: '#FFD600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFD600';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 214, 0, 0.2)';
                e.currentTarget.style.color = '#FFD600';
              }}
            >
              ×
            </button>

            <div
              style={{
                color: '#FFD600',
                fontWeight: 800,
                fontSize: 24,
                marginBottom: 24,
                textAlign: 'center',
                letterSpacing: '1px',
                textShadow: '0 0 20px rgba(255, 214, 0, 0.5)',
              }}
            >
              {showBubbleContent.type === 'starting' ? '📝 Starting Story' : '📋 Guideline'}
            </div>

            <div
              style={{
                color: '#fff',
                fontSize: 16,
                lineHeight: 1.8,
                textAlign: 'center',
                whiteSpace: 'pre-wrap',
              }}
            >
              {showBubbleContent.content}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
} 
