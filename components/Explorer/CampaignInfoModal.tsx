'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CampaignVideo } from './VideoCard';
import { getCompanyLogoFromUser } from '../../lib/utils/companyLogo';

type CampaignInfoModalProps = {
  campaign: CampaignVideo;
  onClose: () => void;
  onCompleteClick?: (campaign: CampaignVideo) => void;
};

export default function CampaignInfoModal({ campaign, onClose, onCompleteClick }: CampaignInfoModalProps) {
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
          {(() => {
            // Get company logo if available
            const companyLogoUrl = campaign.companyDomain 
              ? getCompanyLogoFromUser(undefined, campaign.companyDomain, 'dark')
              : null;
            
            return (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: campaign.companyName 
                    ? 'linear-gradient(135deg, #00FFB0 0%, #00CC88 100%)'
                    : 'linear-gradient(135deg, rgba(255, 214, 0, 0.2) 0%, rgba(255, 214, 0, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                  overflow: 'hidden',
                }}
              >
                {companyLogoUrl ? (
                  <Image
                    src={companyLogoUrl}
                    alt={campaign.companyName || 'Company'}
                    width={32}
                    height={32}
                    style={{
                      objectFit: 'contain',
                      padding: 2,
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/company.svg';
                      e.currentTarget.style.filter = 'brightness(0)';
                    }}
                  />
                ) : (
                  <Image
                    src={campaign.companyName ? '/company.svg' : '/individual.svg'}
                    alt={campaign.companyName ? 'Company' : 'Individual'}
                    width={32}
                    height={32}
                    style={{ filter: 'brightness(0)' }}
                  />
                )}
              </div>
            );
          })()}
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
          {campaign.startingStory && !campaign.rank && (
            <div>
              <div style={{ color: '#999', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                Starting Story
              </div>
              <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6 }}>{campaign.startingStory}</div>
            </div>
          )}

          {campaign.guidelines && !campaign.rank && (
            <div>
              <div style={{ color: '#999', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, letterSpacing: '1px' }}>
                Guidelines
              </div>
              <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6 }}>{campaign.guidelines}</div>
            </div>
          )}

          {/* Completion Story for Best Completions (Top 3) */}
          {campaign.rank && (
            <div
              style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '2px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ color: '#00FF88', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '1px' }}>
                📝 Completion Story
              </div>
              <div style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6 }}>
                {campaign.completionStory || 'This completion story will be displayed here once connected to the backend.'}
              </div>
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
                  <span style={{ color: '#999' }}>Standard{campaign.rank ? ' (Won)' : ''}:</span>
                  <span style={{ color: '#00FF88', fontWeight: 700 }}>{campaign.standardReward}</span>
                </div>
              )}
              {campaign.premiumReward && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#999' }}>Premium{campaign.rank ? ' (Won)' : ' (Top 3)'}:</span>
                  <span style={{ color: '#FFD600', fontWeight: 700 }}>{campaign.premiumReward}</span>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {campaign.completionPercentage !== undefined && !campaign.rank && (
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

        {/* Action Button - Only show if campaign is active */}
        {(() => {
          // Check if campaign is active
          const isTimeEnded = !campaign.timeLeft || 
                             campaign.timeLeft === 'Ended' || 
                             campaign.timeLeft === '0h left' ||
                             campaign.timeLeft.includes('0h') ||
                             campaign.timeLeft.includes('expired');
          const isFullyCompleted = campaign.completionPercentage === 100;
          const isCampaignActive = !campaign.rank && !isTimeEnded && !isFullyCompleted;

          // Only show Complete button if campaign is active
          if (isCampaignActive) {
            return (
              <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  background: 'linear-gradient(135deg, #00FF88 0%, #00CC6E 100%)',
                  border: 'none',
                  borderRadius: 16,
                  padding: '16px 32px',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: 18,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  boxShadow: isHovered ? '0 12px 32px rgba(0, 255, 136, 0.6)' : '0 8px 24px rgba(0, 255, 136, 0.4)',
                  transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
                onClick={() => {
                  if (onCompleteClick) {
                    onCompleteClick(campaign);
                    onClose();
                  }
                }}
              >
                Complete
              </button>
            );
          }

          // No message for inactive campaigns - just don't show the button
          return null;
        })()}
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