'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export type CampaignVideo = {
  id: string;
  title: string;
  companyName?: string;
  creatorWallet?: string;
  thumbnail: string;
  videoUrl: string;
  orientation: 'horizontal' | 'vertical';
  completionPercentage?: number;
  completionsMinted?: number; // Number of completions minted
  completionsAvailable?: number; // Total completions available
  timeLeft?: string;
  standardReward?: string;
  premiumReward?: string;
  completionPrice?: string;
  startingStory?: string;
  guidelines?: string;
  rank?: number; // For podium display
  averageScore?: number; // Average score for Best Completions
  completionStory?: string; // Completion story for Best Completions
};

type VideoCardProps = {
  video: CampaignVideo;
  onInfoClick: (video: CampaignVideo) => void;
  onVideoClick?: (video: CampaignVideo) => void;
  variant?: 'carousel' | 'mosaic' | 'podium';
  size?: 'small' | 'medium' | 'large';
  disableHover?: boolean;
};

export default function VideoCard({ video, onInfoClick, onVideoClick, variant = 'carousel', size = 'medium', disableHover = false }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Better sizing that adapts to orientation
  const getSizeStyles = () => {
    const isVertical = video.orientation === 'vertical';
    
    if (variant === 'mosaic') {
      // Mosaic: Cards take natural size based on orientation
      return {
        width: isVertical ? 280 : 420,
        height: isVertical ? 498 : 236,
      };
    }
    
    if (variant === 'podium') {
      // Podium: Larger for winner
      const scale = size === 'large' ? 1.3 : 1;
      return {
        width: isVertical ? 280 * scale : 420 * scale,
        height: isVertical ? 498 * scale : 236 * scale,
      };
    }
    
    // Carousel: Fixed width, height adapts
    return {
      width: 320,
      height: isVertical ? 570 : 180,
    };
  };

  const currentSize = getSizeStyles();
  const displayName = video.companyName || `@${video.creatorWallet?.slice(0, 6)}...${video.creatorWallet?.slice(-4)}`;

  return (
    <div
      onClick={() => {
        if (onVideoClick) {
          onVideoClick(video);
        }
      }}
      onMouseEnter={() => !disableHover && setIsHovered(true)}
      onMouseLeave={() => !disableHover && setIsHovered(false)}
      style={{
        position: 'relative',
        width: currentSize.width,
        minWidth: currentSize.width,
        background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
        borderRadius: variant === 'podium' ? 20 : 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: disableHover ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: disableHover 
          ? 'none'
          : (variant === 'podium' 
            ? 'none'
            : (isHovered ? 'scale(1.05) translateY(-8px)' : 'scale(1)')),
        boxShadow: disableHover
          ? '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 214, 0, 0.2)'
          : (isHovered
            ? '0 20px 40px rgba(255, 214, 0, 0.3), 0 0 0 2px rgba(255, 214, 0, 0.5), inset 0 0 20px rgba(255, 214, 0, 0.1)'
            : '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 214, 0, 0.2)'),
        zIndex: (isHovered && !disableHover) ? 10 : 1,
      }}
    >

      {/* Video Thumbnail */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: currentSize.height,
          overflow: 'hidden',
        }}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Play Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onVideoClick) {
              onVideoClick(video);
            }
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${isHovered ? 1.2 : 1})`,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(255, 214, 0, 0.95)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 24px rgba(255, 214, 0, 0.4)',
            opacity: isHovered ? 1 : 0.85,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '18px solid #000',
              borderTop: '12px solid transparent',
              borderBottom: '12px solid transparent',
              marginLeft: 4,
            }}
          />
        </button>

        {/* Completion Progress Bar */}
        {video.completionPercentage !== undefined && video.completionPercentage < 100 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${video.completionPercentage}%`,
                background: 'linear-gradient(90deg, #FFD600 0%, #00FF88 100%)',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        )}
      </div>

      {/* Card Info */}
      <div style={{ padding: variant === 'carousel' ? 16 : 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Navigate to company/creator profile
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#00FFB0',
              fontWeight: 700,
              fontSize: variant === 'carousel' ? 14 : 12,
              cursor: 'pointer',
              padding: 0,
              textShadow: '0 0 10px rgba(0, 255, 176, 0.5)',
              transition: 'all 0.2s',
            }}
          >
            {displayName}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick(video);
            }}
            style={{
              background: 'linear-gradient(135deg, #FFD600 0%, #FFA500 100%)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: 16,
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255, 214, 0, 0.4)',
              transition: 'all 0.2s',
            }}
            aria-label="Campaign Info"
          >
            i
          </button>
        </div>

        <div
          style={{
            fontStyle: 'italic',
            color: '#FFD600',
            fontSize: variant === 'carousel' ? 14 : 12,
            marginBottom: 8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 600,
          }}
        >
          {video.title}
        </div>

        {/* Additional Info */}
        {isHovered && variant !== 'mosaic' && (
          <div
            style={{
              fontSize: 11,
              color: '#999',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              animation: 'fadeIn 0.3s ease',
            }}
          >
            {video.timeLeft && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#FFD600' }}>⏱</span>
                <span>{video.timeLeft}</span>
              </div>
            )}
            {video.completionPrice && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#00FF88' }}>💰</span>
                <span>{video.completionPrice}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
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

