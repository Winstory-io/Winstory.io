'use client';
import React from 'react';
import LoginHeader from '@/components/LoginHeader';
import Link from 'next/link';
import LoginButton from '@/components/LoginButton';
import WalletConnect from '@/components/WalletConnect';

export default function ModerationLoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Custom header for Moderation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 10, marginBottom: 48, marginLeft: -120 }}>
          <img src="/moderation.svg" alt="Moderation Icon" style={{ width: 192, height: 192, marginRight: 32 }} />
          <span style={{ fontSize: 32, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
            Moderation login
            <button style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', fontSize: 32, padding: 0 }} aria-label="Help" onClick={() => { /* TODO: open popup */ }}>
              <img src="/tooltip.svg" alt="Help" style={{ width: 32, height: 32, filter: 'drop-shadow(0 0 6px #FFD600)' }} />
            </button>
          </span>
          <Link href="/welcome" style={{ position: 'absolute', right: -196, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} aria-label="Close">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
              <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
        <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* <WalletConnect title="With your Pro E-mail" /> */}
          <WalletConnect isEmailLogin={true} />
        </div>
      </div>
    </div>
  );
} 