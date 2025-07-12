'use client';

import React from 'react';
import TipBox from '@/components/icons/TipBox';
import CreationIcon from '@/components/icons/CreationIcon';
import ModerationIcon from '@/components/icons/ModerationIcon';
import CompletionIcon from '@/components/icons/CompletionIcon';
import ExplorerIcon from '@/components/icons/ExplorerIcon';
import { useRouter } from 'next/navigation';
import { useWalletAddress } from '@/lib/hooks/useWalletConnection';

export default function Home() {
  const router = useRouter();
  const walletAddress = useWalletAddress();

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
    >
      {/* Logo en haut à gauche */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Home"
        >
          <img
            src="/logo.svg"
            alt="Logo Winstory"
            style={{
              width: '10vw',
              minWidth: 48,
              maxWidth: 120,
              height: 'auto',
              display: 'block',
            }}
          />
        </button>
      </div>

      {/* Ampoule en haut à droite */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          right: 32,
          cursor: 'pointer',
          zIndex: 10,
        }}
        onClick={() => router.push('/welcome/tooltip')}
      >
        <TipBox />
      </div>

      {/* Actions principales */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 48,
          marginBottom: 80,
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD600',
            fontWeight: 900,
            fontSize: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/creation/youare')}
        >
          <span style={{ fontSize: 56 }}>
            <CreationIcon />
          </span>
          Create Campaign
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD600',
            fontWeight: 900,
            fontSize: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/moderation/hackathon-login')}
        >
          <span style={{ fontSize: 56 }}>
            <ModerationIcon />
          </span>
          Moderate
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD600',
            fontWeight: 900,
            fontSize: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/completion/login')}
        >
          <span style={{ fontSize: 56 }}>
            <CompletionIcon />
          </span>
          Complete Campaign
        </button>
      </div>

      {/* Explorer en bas */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#FFD600',
            fontWeight: 900,
            fontSize: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/explorer')}
        >
          <span style={{ fontSize: 48 }}>
            <ExplorerIcon />
          </span>
          Explorer
        </button>
      </div>
    </div>
  );
}
