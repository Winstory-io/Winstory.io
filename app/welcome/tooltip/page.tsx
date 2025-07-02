'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

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
        {/* Croix rouge pour fermer */}
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
            <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
            <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Titre sans ampoule */}
        <h1 style={{ color: '#FFD600', fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>What do you Win today?</h1>
        <div style={{ width: '100%', fontSize: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Explorer */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 20, marginRight: 8 }} role="img" aria-label="compass">🧭</span>
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
              <span style={{ fontSize: 20, marginRight: 8 }} role="img" aria-label="play">▶️</span>
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
              <span style={{ fontSize: 20, marginRight: 8 }} role="img" aria-label="check and cross">✅❌</span>
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
              <span style={{ fontSize: 20, marginRight: 8 }} role="img" aria-label="fast forward">➡️</span>
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
        </div>
      </div>
    </div>
  );
};

export default TooltipPage; 