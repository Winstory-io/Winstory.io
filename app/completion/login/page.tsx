'use client';
import React from 'react';
import LoginHeader from '@/components/LoginHeader';
import LoginButton from '@/components/LoginButton';
import Link from 'next/link';

export default function CompletionLoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32, position: 'relative' }}>
        {/* Header customisé pour Completion */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 40, marginBottom: 48, width: '100%', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          <img src="/individual.svg" alt="Individual Icon" style={{ width: 96, height: 96, marginRight: 24 }} />
          <span style={{ fontSize: 32, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
            Completion login
            <button style={{ background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', fontSize: 32, padding: 0 }} aria-label="Ampoule" onClick={() => {}}>
              <img src="/tooltip.svg" alt="Aide" style={{ width: 32, height: 32, filter: 'drop-shadow(0 0 6px #FFD600)' }} />
            </button>
          </span>
          <Link href="/welcome" style={{ position: 'absolute', right: -122, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} aria-label="Close">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
              <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>
        <LoginButton
          icon={<span role="img" aria-label="email">📧</span>}
          text="With your Email"
          color="#FFD600"
        />
        <div style={{ textAlign: 'center', color: '#FFD600', fontWeight: 700, fontSize: 18, margin: '8px 0' }}>OR</div>
        <LoginButton
          icon={<span role="img" aria-label="wallet">💳</span>}
          text="With your Web.3 Wallet"
          color="#FFD600"
        />
      </div>
    </div>
  );
} 