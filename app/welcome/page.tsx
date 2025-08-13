'use client';

import React, { useEffect } from 'react';
import TipBox from '@/components/icons/TipBox';
import CreationIcon from '@/components/icons/CreationIcon';
import ModerationIcon from '@/components/icons/ModerationIcon';
import CompletionIcon from '@/components/icons/CompletionIcon';
import ExplorerIcon from '@/components/icons/ExplorerIcon';
import { useRouter } from 'next/navigation';
import { useWalletAddress } from '@/lib/hooks/useWalletConnection';
import { clearUserCache } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const walletAddress = useWalletAddress();

  // Nettoyer automatiquement le cache à chaque visite de la page welcome
  useEffect(() => {
    // S'assurer que nous sommes côté client
    if (typeof window !== 'undefined') {
      clearUserCache();
    }
  }, []);

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
          top: 32,
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
              width: '15vw',
              minWidth: 72,
              maxWidth: 180,
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
          // TODO: restreindre l'accès à /moderation à la possession d'un token spécifique dans le wallet
          onClick={() => router.push('/moderation')}
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
        
        {/* My Win - Positioned separately with green color */}
        <div style={{ 
          position: 'fixed', 
          bottom: '32px', 
          right: '32px', 
          zIndex: 100 
        }}>
          <button
            style={{
              background: '#000',
              border: '3px solid #00FF00',
              borderRadius: '50%',
              width: '120px',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `
                0 0 20px rgba(0, 255, 0, 0.6),
                0 0 40px rgba(0, 255, 0, 0.4),
                0 0 60px rgba(0, 255, 0, 0.2),
                inset 0 0 20px rgba(0, 255, 0, 0.1)
              `,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = `
                0 0 25px rgba(0, 255, 0, 0.8),
                0 0 50px rgba(0, 255, 0, 0.6),
                0 0 75px rgba(0, 255, 0, 0.4),
                inset 0 0 25px rgba(0, 255, 0, 0.2)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = `
                0 0 20px rgba(0, 255, 0, 0.6),
                0 0 40px rgba(0, 255, 0, 0.4),
                0 0 60px rgba(0, 255, 0, 0.2),
                inset 0 0 20px rgba(0, 255, 0, 0.1)
              `;
            }}
            onClick={() => router.push('/mywin')}
          >
            <div style={{
              color: '#00FF00',
              fontWeight: 900,
              fontSize: 24,
              lineHeight: 1,
              textAlign: 'center',
              textShadow: '0 0 10px rgba(0, 255, 0, 0.8)'
            }}>
              <div>My</div>
              <div>Win</div>
            </div>
          </button>
        </div>
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
