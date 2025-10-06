'use client';

import React, { useState } from 'react';
import { CampaignVideo } from './VideoCard';

type CompanyCarouselProps = {
  videos: CampaignVideo[];
  onInfoClick: (campaign: CampaignVideo) => void;
  onVideoClick?: (campaign: CampaignVideo) => void;
};

export default function CompanyCarousel({ videos, onInfoClick, onVideoClick }: CompanyCarouselProps) {
  const [selectedOrientation, setSelectedOrientation] = useState<'all' | 'horizontal' | 'vertical'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBubbleContent, setShowBubbleContent] = useState<{ 
    type: 'starting' | 'guideline' | 'rewards'; 
    content: string 
  } | null>(null);

  // Filter by orientation
  const filteredVideos = selectedOrientation === 'all' 
    ? videos 
    : videos.filter(v => v.orientation === selectedOrientation);

  // Sort by most recent (assuming the last items in the array are most recent)
  const sortedVideos = [...filteredVideos].reverse();

  // Update currentIndex when filter changes - MUST BE BEFORE ANY EARLY RETURNS
  React.useEffect(() => {
    if (currentIndex >= sortedVideos.length && sortedVideos.length > 0) {
      setCurrentIndex(Math.max(0, sortedVideos.length - 1));
    }
  }, [sortedVideos.length, currentIndex]);

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
        <div style={{ fontSize: 64 }}>🏢</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#FFD600' }}>
          No Company Campaigns Yet
        </div>
        <div style={{ fontSize: 16, textAlign: 'center', maxWidth: 500, lineHeight: 1.6 }}>
          Be the first to discover amazing brand campaigns when they launch. Check back soon for exciting opportunities.
        </div>
      </div>
    );
  }

  const currentVideo = sortedVideos[currentIndex];

  if (!currentVideo) {
    return (
      <div style={{ 
        textAlign: 'center', 
        color: '#666', 
        padding: '4rem 2rem',
        fontSize: 16,
      }}>
        No campaigns match your filter.
      </div>
    );
  }

  const isHorizontal = currentVideo.orientation === 'horizontal';

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedVideos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      padding: '0 2rem', 
      maxWidth: 1800, 
      margin: '0 auto',
      marginTop: '-0.5rem',
    }}>
      <div style={{ display: 'flex', gap: 60, alignItems: 'flex-start' }}>
        {/* Left Side - Filters */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12,
          minWidth: 180,
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
            onClick={() => setSelectedOrientation('all')}
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
            onClick={() => setSelectedOrientation('horizontal')}
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
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              width: '100%',
              boxShadow: selectedOrientation === 'horizontal' ? '0 4px 16px rgba(255, 214, 0, 0.4)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (selectedOrientation !== 'horizontal') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#FFD600';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedOrientation !== 'horizontal') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#999';
              }
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
              gap: 10,
              padding: '12px 16px',
              background: selectedOrientation === 'vertical' ? '#fff' : 'rgba(255, 255, 255, 0.05)',
              border: `2px solid ${selectedOrientation === 'vertical' ? '#FFD600' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: 12,
              color: selectedOrientation === 'vertical' ? '#000' : '#999',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              width: '100%',
              boxShadow: selectedOrientation === 'vertical' ? '0 4px 16px rgba(255, 214, 0, 0.4)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (selectedOrientation !== 'vertical') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#FFD600';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedOrientation !== 'vertical') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#999';
              }
            }}
          >
            <span style={{ fontSize: 20 }}>▮</span>
            <span>Vertical</span>
          </button>

          {/* Campaign Counter */}
          <div style={{ 
            marginTop: 20,
            padding: '16px',
            background: 'linear-gradient(145deg, rgba(255, 214, 0, 0.1) 0%, rgba(255, 214, 0, 0.05) 100%)',
            border: '2px solid rgba(255, 214, 0, 0.3)',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <div style={{ 
              fontSize: 12, 
              color: '#999', 
              fontWeight: 600,
              marginBottom: 8,
            }}>
              Available Campaigns
            </div>
            <div style={{ 
              fontSize: 32, 
              fontWeight: 900, 
              color: '#FFD600',
              textShadow: '0 0 20px rgba(255, 214, 0, 0.5)',
            }}>
              {sortedVideos.length}
            </div>
          </div>

          {/* Navigation Arrows - Below Available Campaigns */}
          {sortedVideos.length > 1 && (
            <div style={{ 
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}>
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: currentIndex === 0 
                    ? '1px solid rgba(100, 100, 100, 0.3)'
                    : '1px solid rgba(255, 214, 0, 0.4)',
                  color: currentIndex === 0 ? 'rgba(100, 100, 100, 0.5)' : '#FFD600',
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  opacity: currentIndex === 0 ? 0.3 : 0.7,
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={(e) => {
                  if (currentIndex !== 0) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentIndex !== 0) {
                    e.currentTarget.style.opacity = '0.7';
                    e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.4)';
                  }
                }}
              >
                ‹
              </button>

              <div style={{ 
                fontSize: 13, 
                color: '#FFD600',
                fontWeight: 700,
                minWidth: 45,
                textAlign: 'center',
              }}>
                {currentIndex + 1} / {sortedVideos.length}
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === sortedVideos.length - 1}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: currentIndex === sortedVideos.length - 1 
                    ? '1px solid rgba(100, 100, 100, 0.3)'
                    : '1px solid rgba(255, 214, 0, 0.4)',
                  color: currentIndex === sortedVideos.length - 1 ? 'rgba(100, 100, 100, 0.5)' : '#FFD600',
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: currentIndex === sortedVideos.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  opacity: currentIndex === sortedVideos.length - 1 ? 0.3 : 0.7,
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={(e) => {
                  if (currentIndex !== sortedVideos.length - 1) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentIndex !== sortedVideos.length - 1) {
                    e.currentTarget.style.opacity = '0.7';
                    e.currentTarget.style.borderColor = 'rgba(255, 214, 0, 0.4)';
                  }
                }}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* Center - Video Display */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Video with Bubbles */}
          <div
            key={currentVideo.id}
            style={{
              display: 'flex',
              flexDirection: isHorizontal ? 'row' : 'row',
              gap: isHorizontal ? 40 : 32,
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'fadeSlideIn 0.5s ease',
            }}
          >
            {/* Left Bubbles - Starting Story & Guideline */}
            <div style={{
              display: 'flex',
              flexDirection: isHorizontal ? 'column' : 'column',
              gap: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Starting Story Bubble */}
              <div
                onClick={() => setShowBubbleContent({ 
                  type: 'starting', 
                  content: currentVideo.startingStory || 'No starting story available.' 
                })}
                style={{
                  width: isHorizontal ? 100 : 85,
                  height: isHorizontal ? 100 : 85,
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)',
                  border: '3px solid rgba(255, 215, 0, 0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFD600',
                  fontWeight: 700,
                  fontSize: 13,
                  textAlign: 'center',
                  padding: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 24px rgba(255, 215, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.15) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)';
                }}
              >
                <div>Starting<br/>Story</div>
              </div>

              {/* Guideline Bubble */}
              <div
                onClick={() => setShowBubbleContent({ 
                  type: 'guideline', 
                  content: currentVideo.guidelines || 'No guidelines available.' 
                })}
                style={{
                  width: isHorizontal ? 100 : 85,
                  height: isHorizontal ? 100 : 85,
                  background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)',
                  border: '3px solid rgba(255, 215, 0, 0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#FFD600',
                  fontWeight: 700,
                  fontSize: 13,
                  textAlign: 'center',
                  padding: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 24px rgba(255, 215, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.15) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 215, 0, 0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.08) 100%)';
                }}
              >
                <div>Guideline</div>
              </div>
            </div>

            {/* Main Video */}
            <div style={{ position: 'relative' }}>
              {/* Video Container */}
              <div
                onClick={() => onVideoClick && onVideoClick(currentVideo)}
                style={{
                  position: 'relative',
                  width: isHorizontal ? 800 : 360,
                  height: isHorizontal ? 450 : 640,
                  borderRadius: 20,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(255, 214, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 24px 72px rgba(255, 214, 0, 0.3), 0 0 0 4px rgba(255, 214, 0, 0.5)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 3px rgba(255, 214, 0, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img
                  src={currentVideo.thumbnail}
                  alt={currentVideo.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onVideoClick) {
                      onVideoClick(currentVideo);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(255, 214, 0, 0.95)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(255, 214, 0, 0.5)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.15)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 214, 0, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 214, 0, 0.5)';
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '24px solid #000',
                      borderTop: '16px solid transparent',
                      borderBottom: '16px solid transparent',
                      marginLeft: 6,
                    }}
                  />
                </button>

                {/* Video Info Bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                  }}>
                    <div style={{ 
                      color: '#00FFB0', 
                      fontWeight: 800, 
                      fontSize: 16,
                      textShadow: '0 0 10px rgba(0, 255, 176, 0.6)',
                    }}>
                      {currentVideo.companyName}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInfoClick(currentVideo);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #FFD600 0%, #FFA500 100%)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: 18,
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(255, 214, 0, 0.5)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      i
                    </button>
                  </div>

                  <div style={{ 
                    color: '#FFD600', 
                    fontStyle: 'italic', 
                    fontSize: 14,
                    fontWeight: 600,
                  }}>
                    {currentVideo.title}
                  </div>

                  {/* Completion Progress */}
                  {currentVideo.completionPercentage !== undefined && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8,
                      fontSize: 12,
                      color: '#999',
                    }}>
                      <div style={{ 
                        flex: 1, 
                        height: 6, 
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${currentVideo.completionPercentage}%`,
                            background: 'linear-gradient(90deg, #FFD600 0%, #00FF88 100%)',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                      <span style={{ 
                        fontWeight: 700, 
                        color: '#FFD600',
                        minWidth: 45,
                      }}>
                      {currentVideo.completionPercentage}%
                    </span>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Right Bubbles - Rewards, Complete Button & Time Left */}
            <div style={{
              display: 'flex',
              flexDirection: isHorizontal ? 'column' : 'column',
              gap: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Rewards Bubble */}
              <div
                onClick={() => setShowBubbleContent({ 
                  type: 'rewards', 
                  content: `Standard: ${currentVideo.standardReward || 'N/A'}\nPremium: ${currentVideo.premiumReward || 'N/A'}\nCompletion Price: ${currentVideo.completionPrice || 'N/A'}` 
                })}
                style={{
                  width: isHorizontal ? 100 : 85,
                  height: isHorizontal ? 100 : 85,
                  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.08) 100%)',
                  border: '3px solid rgba(0, 255, 136, 0.6)',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#00FF88',
                  fontWeight: 700,
                  fontSize: 13,
                  textAlign: 'center',
                  padding: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 24px rgba(0, 255, 136, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 255, 136, 0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.25) 0%, rgba(0, 255, 136, 0.15) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 255, 136, 0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.08) 100%)';
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>💰</div>
                <div>Rewards</div>
              </div>

              {/* Complete Button */}
              <button
                onClick={() => {
                  // TODO: Navigate to complete page or open completion modal
                  alert(`Complete campaign: ${currentVideo.title}`);
                }}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #00FF88 0%, #00CC6E 100%)',
                  border: 'none',
                  borderRadius: 16,
                  color: '#000',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(0, 255, 136, 0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  minWidth: isHorizontal ? 100 : 85,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 255, 136, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 255, 136, 0.4)';
                }}
              >
                Complete
              </button>

              {/* Time Left - Below Complete Button */}
              {currentVideo.timeLeft && (
                <div style={{ 
                  fontSize: 14, 
                  color: '#FF5252',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  background: 'rgba(255, 82, 82, 0.1)',
                  border: '2px solid rgba(255, 82, 82, 0.3)',
                  borderRadius: 12,
                  textShadow: '0 0 10px rgba(255, 82, 82, 0.5)',
                }}>
                  <span>⏱</span>
                  <span>{currentVideo.timeLeft}</span>
                </div>
              )}
            </div>
          </div>
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
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
              borderRadius: 24,
              padding: 48,
              maxWidth: 700,
              width: '100%',
              border: `3px solid ${
                showBubbleContent.type === 'rewards' ? '#00FF88' : '#FFD600'
              }`,
              boxShadow: `0 24px 72px ${
                showBubbleContent.type === 'rewards' 
                  ? 'rgba(0, 255, 136, 0.4)' 
                  : 'rgba(255, 214, 0, 0.4)'
              }`,
              position: 'relative',
              animation: 'modalFadeIn 0.3s ease',
            }}
          >
            <button
              onClick={() => setShowBubbleContent(null)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: showBubbleContent.type === 'rewards' 
                  ? 'rgba(0, 255, 136, 0.2)' 
                  : 'rgba(255, 214, 0, 0.2)',
                border: `2px solid ${
                  showBubbleContent.type === 'rewards' ? '#00FF88' : '#FFD600'
                }`,
                borderRadius: '50%',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 24,
                fontWeight: 700,
                color: showBubbleContent.type === 'rewards' ? '#00FF88' : '#FFD600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = showBubbleContent.type === 'rewards' 
                  ? '#00FF88' 
                  : '#FFD600';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = showBubbleContent.type === 'rewards' 
                  ? 'rgba(0, 255, 136, 0.2)' 
                  : 'rgba(255, 214, 0, 0.2)';
                e.currentTarget.style.color = showBubbleContent.type === 'rewards' 
                  ? '#00FF88' 
                  : '#FFD600';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ×
            </button>

            <div
              style={{
                color: showBubbleContent.type === 'rewards' ? '#00FF88' : '#FFD600',
                fontWeight: 900,
                fontSize: 28,
                marginBottom: 32,
                textAlign: 'center',
                letterSpacing: '1px',
                textShadow: `0 0 24px ${
                  showBubbleContent.type === 'rewards' 
                    ? 'rgba(0, 255, 136, 0.6)' 
                    : 'rgba(255, 214, 0, 0.6)'
                }`,
              }}
            >
              {showBubbleContent.type === 'starting' && '📝 Starting Story'}
              {showBubbleContent.type === 'guideline' && '📋 Guidelines'}
              {showBubbleContent.type === 'rewards' && '💰 Rewards'}
            </div>

            <div
              style={{
                color: '#fff',
                fontSize: 17,
                lineHeight: 1.9,
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
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

