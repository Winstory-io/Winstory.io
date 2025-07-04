'use client';
import React from 'react';
import LoginButton from '@/components/LoginButton';
import WalletConnect from '@/components/WalletConnect';
import Link from 'next/link';
import EmailAuth from '@/components/EmailAuth';

export default function IndividualLoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      {/* <div className="flex items-center">
        <EmailAuth title="Se connecter" />
      </div> */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 500, margin: '32px auto 32px auto', position: 'relative' }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#2eea8b', letterSpacing: 1, whiteSpace: 'nowrap' }}>Creation Individual login</span>
        <button style={{ background: 'none', border: 'none', marginLeft: 16, marginRight: 8, cursor: 'pointer', padding: 0 }} aria-label="Ampoule" onClick={() => { }}>
          <img src="/tooltip.svg" alt="Aide" style={{ width: 32, height: 32, filter: 'drop-shadow(0 0 6px #FFD600)' }} />
        </button>
        <Link href="/creation/youare" style={{ marginLeft: 8, cursor: 'pointer', fontSize: 32, color: '#FF2D2D', display: 'flex', alignItems: 'center' }} aria-label="Close">
          ×
        </Link>
      </div>
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        {/* <LoginButton
          icon={<span role="img" aria-label="wallet">💳</span>}
          text="With your Web.3 Wallet"
          color="#FFD600"
        /> */}
        <WalletConnect isWalletLogin={true} />
      </div>
    </div>
  );
} 