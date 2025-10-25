'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CreationIcon from '@/components/icons/CreationIcon';
import ModerationIcon from '@/components/icons/ModerationIcon';
import CompletionIcon from '@/components/icons/CompletionIcon';
import ExplorerIcon from '@/components/icons/ExplorerIcon';

const listItem = 'text-white font-inter';

const TooltipPage = () => {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#000',
        color: '#FFD600',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      onClick={() => router.push('/welcome')}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: 600,
          width: '90vw',
          background: '#000',
          border: '4px solid #FFD600',
          borderRadius: 24,
          padding: '28px 12px 20px 12px',
          boxShadow: '0 0 32px #000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Red cross to close */}
        <button
          aria-label="Close"
          onClick={() => router.push('/welcome')}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
        {/* Title without bulb */}
        <h1 style={{ color: '#FFD600', fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>What do you Win today?</h1>
        <div style={{ width: '100%', fontSize: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Explorer */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <div 
                style={{ 
                  fontSize: 5, 
                  marginRight: 8, 
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => router.push('/explorer')}
              >
                <ExplorerIcon />
              </div>
              <h2 style={{ color: '#FFD600', fontSize: 20, fontWeight: 800, marginBottom: 0 }}>Explorer</h2>
            </div>
            <h3 style={{ color: '#FFD600', fontWeight: 700, marginBottom: 4 }}>For You. Humanity. With Love <span style={{ color: '#FF2D2D' }}>❤️</span></h3>
            <ul style={{ color: '#fff', marginLeft: 18, fontSize: 15, fontWeight: 500 }}>
              <li>All in one place <span style={{ color: '#FFD600' }}>☀️</span></li>
              <li>Discover Winstory world.</li>
              <li>Creations and best Completions.</li>
            </ul>
          </div>
          {/* Create Campaign */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <div 
                style={{ 
                  fontSize: 5, 
                  marginRight: 8, 
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => router.push('/creation/youare')}
              >
                <CreationIcon />
              </div>
              <h2 style={{ color: '#FFD600', fontSize: 20, fontWeight: 800, marginBottom: 0 }}>Create Campaign</h2>
            </div>
            <h3 style={{ color: '#FFD600', fontWeight: 700, marginBottom: 4 }}>For B2C Companies & creative individuals</h3>
            <ul style={{ color: '#fff', marginLeft: 18, fontSize: 15, fontWeight: 500 }}>
              <li>Launch interactive narrative stories</li>
              <li>As a B2C Company : <span style={{ color: '#FFD600' }}>Your storytelling with ROI</span></li>
              <li>As an Individual : <span style={{ color: '#FFD600' }}>Your vision with $WINC</span></li>
              <li>Base the creative contributions</li>
              <li>Turn storytelling into visibility and impact</li>
            </ul>
          </div>
          {/* Moderate */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <div 
                style={{ 
                  fontSize: 5, 
                  marginRight: 8, 
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => router.push('/moderation')}
              >
                <ModerationIcon />
              </div>
              <h2 style={{ color: '#FFD600', fontSize: 20, fontWeight: 800, marginBottom: 0 }}>Moderate</h2>
            </div>
            <h3 style={{ color: '#FFD600', fontWeight: 700, marginBottom: 4 }}>For $WINC Stakers / DAO members only</h3>
            <ul style={{ color: '#fff', marginLeft: 18, fontSize: 15, fontWeight: 500 }}>
              <li>Shape what deserves to rise</li>
              <li>Vote on the quality of completions</li>
              <li>Win <span style={{ color: '#FFD600' }}>$WINC</span> based on alignment</li>
              <li>Governance & rewards powered by your judgment</li>
            </ul>
          </div>
          {/* Complete Campaign */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <div 
                style={{ 
                  fontSize: 5, 
                  marginRight: 8, 
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => router.push('/completion')}
              >
                <CompletionIcon />
              </div>
              <h2 style={{ color: '#FFD600', fontSize: 20, fontWeight: 800, marginBottom: 0 }}>Complete Campaign</h2>
            </div>
            <h3 style={{ color: '#FFD600', fontWeight: 700, marginBottom: 4 }}>For Community Members</h3>
            <ul style={{ color: '#fff', marginLeft: 18, fontSize: 15, fontWeight: 500 }}>
              <li>Take a story. Make it yours.</li>
              <li>Extend campaigns with your creative completion</li>
              <li>Win exclusive rewards from brands or Winstory</li>
              <li>Top 3 completions unlock <span style={{ color: '#FFD600' }}>Premium Rewards</span></li>
              <li>Inspire, tell, and get noticed</li>
            </ul>
          </div>
          {/* My Win */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <div 
                style={{ 
                  fontSize: 5, 
                  marginRight: 8, 
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  cursor: 'pointer',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: '#00FF00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={() => router.push('/mywin')}
              />
              <h2 style={{ color: '#00FF00', fontSize: 20, fontWeight: 800, marginBottom: 0 }}>My Win</h2>
            </div>
            <h3 style={{ color: '#00FF00', fontWeight: 700, marginBottom: 4 }}>Track your actions & rewards</h3>
            <ul style={{ color: '#fff', marginLeft: 18, fontSize: 15, fontWeight: 500 }}>
              <li>Monitor your campaign progress and completions</li>
              <li>Track your earnings in <span style={{ color: '#FFD600' }}>$WINC</span>, NFTs, and rewards</li>
              <li>View moderation history and staking results</li>
              <li>Access your personal dashboard and achievements</li>
              <li>Stay updated on your community impact</li>
            </ul>
          </div>

          {/* Connection Information */}
          <div style={{
            marginTop: 24,
            padding: 16,
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: 12,
            fontSize: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 18, marginRight: 8 }} role="img" aria-label="wallet">🔗</span>
              <h3 style={{ color: '#FFD600', fontSize: 16, fontWeight: 700, marginBottom: 0 }}>Wallet Connection</h3>
            </div>
            <div style={{ color: '#fff', lineHeight: 1.4 }}>
              <p style={{ margin: '8px 0' }}>
                <strong style={{ color: '#FFD600' }}>To connect your wallet</strong>, choose a process linked to a campaign:
              </p>
              <ul style={{ marginLeft: 18, margin: '8px 0' }}>
                <li><strong>Create Campaign</strong>, <strong>Moderate</strong>, <strong>Complete Campaign</strong>, or <strong>My Win</strong></li>
                <li>These sections require wallet connection via <span style={{ color: '#FFD600' }}>Account Abstraction</span> or <span style={{ color: '#FFD600' }}>classic Web3</span></li>
                <li>This opens access to both <span style={{ color: '#FFD600' }}>Web2</span> and <span style={{ color: '#FFD600' }}>Web3</span> users</li>
              </ul>
              <p style={{ margin: '8px 0' }}>
                <strong style={{ color: '#00FF00' }}>Explorer</strong> is freely accessible without connection to browse content.
              </p>
              <p style={{ margin: '8px 0', fontSize: 13, fontStyle: 'italic', color: '#ccc' }}>
                Note: Wallet connection is not available from this Welcome menu.
              </p>
              <div style={{
                marginTop: 12,
                padding: 12,
                background: 'rgba(255, 45, 45, 0.1)',
                border: '1px solid rgba(255, 45, 45, 0.3)',
                borderRadius: 8,
                fontSize: 13
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, marginRight: 6 }} role="img" aria-label="security">🔒</span>
                  <strong style={{ color: '#FF2D2D', fontSize: 14 }}>Security Notice</strong>
                </div>
                <p style={{ margin: 0, color: '#fff', lineHeight: 1.3 }}>
                  You may be disconnected when switching between processes. This is due to our security measures to guarantee credibility and prevent impersonation of companies and users.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TooltipPage; 