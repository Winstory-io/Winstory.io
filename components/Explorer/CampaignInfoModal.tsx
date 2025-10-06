'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CampaignVideo } from './VideoCard';

type CampaignInfoModalProps = {
  campaign: CampaignVideo;
  onClose: () => void;
};

export default function CampaignInfoModal({ campaign, onClose }: CampaignInfoModalProps) {
  const [isHovered, setIsHovered] = useState(false);

  const displayName =
    campaign.companyName ||
    `@${campaign.creatorWallet?.slice(0, 6)}...${campaign.creatorWallet?.slice(-4)}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
          borderRadius: 24,
          padding: 40,
          minWidth: 420,
          maxWidth: 540,
          color: '#fff',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 0 2px rgba(255, 214, 0, 0.3)',
          animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255, 82, 82, 0.2)',
            border: '2px solid rgba(255, 82, 82, 0.4)',
            color: '#FF5252',
            fontSize: 24,
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FF5252';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 82, 82, 0.2)';
            e.currentTarget.style.color = '#FF5252';
            e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Company/Creator Name */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00FFB0 0%, #00CC88 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
            }}
          >
            <Image
              src={campaign.companyName ? '/company.svg' : '/individual.svg'}
              alt={campaign.companyName ? 'Company' : 'Individual'}
              width={32}
              height={32}
              style={{ filter: 'brightness(0)' }}
            />
          </div>
          <span style={{ color: '#00FFB0', fontWeight: 700, fontSize: 20, textShadow: '0 0 10px rgba(0, 255, 176, 0.5)' }}>
            {displayName}
          </span>
        </div>

        {/* Campaign Title */}
        <h2
          style={{
            fontWeight: 900,
            fontSize: 28,
            marginBottom: 24,
            color: '#FFD600',
            lineHeight: 1.2,
            textShadow: '0 2px 8px rgba(255, 214, 0, 0.3)',
          }}
        >
          {campaign.title}
        </h2>

        {/* Campaign Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
          {campaign.startingStory && (
            <div>
              <div style={{ color: '#999', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                Starting Story
              </div>
              <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6 }}>{campaign.startingStory}</div>
            </div>
          )}

          {campaign.guidelines && (
            <div>
              <div style={{ color: '#999', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                Guidelines
              </div>
              <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6 }}>{campaign.guidelines}</div>
            </div>
          )}

          {/* Rewards Section */}
          <div
            style={{
              background: 'rgba(255, 214, 0, 0.1)',
              border: '2px solid rgba(255, 214, 0, 0.3)',
              borderRadius: 16,
              padding: 16,
            }}
          >
            <div style={{ color: '#FFD600', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '1px' }}>
              💰 Rewards
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {campaign.standardReward && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#999' }}>Standard:</span>
                  <span style={{ color: '#00FF88', fontWeight: 700 }}>{campaign.standardReward}</span>
                </div>
              )}
              {campaign.premiumReward && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#999' }}>Premium (Top 3):</span>
                  <span style={{ color: '#FFD600', fontWeight: 700 }}>{campaign.premiumReward}</span>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {campaign.completionPercentage !== undefined && (
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ color: '#999', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Progress</div>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    height: 8,
                    overflow: 'hidden',
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(90deg, #FFD600 0%, #00FF88 100%)',
                      height: '100%',
                      width: `${campaign.completionPercentage}%`,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
                <div style={{ color: '#FFD600', fontSize: 14, fontWeight: 700 }}>
                  {campaign.completionPercentage}% Complete
                  {campaign.completionsMinted !== undefined && campaign.completionsAvailable !== undefined && (
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      {campaign.completionsMinted} / {campaign.completionsAvailable} completions
                    </div>
                  )}
                </div>
              </div>
            )}

            {campaign.timeLeft && (
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ color: '#999', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Time Left</div>
                <div style={{ color: '#00FFB0', fontSize: 16, fontWeight: 700 }}>⏱ {campaign.timeLeft}</div>
              </div>
            )}

            {campaign.averageScore !== undefined && (
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ color: '#999', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Average Score</div>
                <div style={{ color: '#FFD600', fontSize: 16, fontWeight: 700 }}>⭐ {campaign.averageScore.toFixed(1)} / 10</div>
              </div>
            )}
          </div>

          {campaign.completionPrice && (
            <div>
              <div style={{ color: '#999', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Completion Price</div>
              <div style={{ color: '#00FF88', fontSize: 18, fontWeight: 900 }}>{campaign.completionPrice}</div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            background: isHovered
              ? 'linear-gradient(135deg, #FFD600 0%, #FFA500 100%)'
              : 'linear-gradient(135deg, rgba(255, 214, 0, 0.2) 0%, rgba(255, 165, 0, 0.2) 100%)',
            border: '2px solid #FFD600',
            borderRadius: 16,
            padding: '16px 32px',
            color: isHovered ? '#000' : '#FFD600',
            fontWeight: 900,
            fontSize: 18,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isHovered ? '0 8px 24px rgba(255, 214, 0, 0.5)' : '0 4px 16px rgba(255, 214, 0, 0.2)',
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          }}
          onClick={() => {
            // TODO: Navigate to completion flow
            console.log('Complete campaign:', campaign.id);
          }}
        >
          {campaign.completionPercentage === 100 ? 'View Campaign' : '🎬 Start Completing'}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
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