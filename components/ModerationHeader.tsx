"use client";

import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createThirdwebClient } from "thirdweb";
import StakerInfo from './StakerInfo';

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

interface ModerationHeaderProps {
  stakerData: {
    stakedAmount: number;
    stakeAgeDays: number;
    moderatorXP: number;
    isEligible: boolean;
  } | null;
}

export default function ModerationHeader({ stakerData }: ModerationHeaderProps) {
  const router = useRouter();
  const account = useActiveAccount();
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debug: Log staker data received
  console.log('🔍 [MODERATION HEADER] Received stakerData:', stakerData);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleMenu = () => {
    setShowDisconnectMenu(!showDisconnectMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDisconnectMenu(false);
      }
    };

    if (showDisconnectMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDisconnectMenu]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        borderBottom: '2px solid #00FF00',
        zIndex: 100,
        padding: '16px 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => router.push('/welcome')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Back to Welcome"
        >
          <Image
            src="/logo.svg"
            alt="Logo Winstory"
            width={48}
            height={48}
            style={{ display: 'block' }}
          />
        </button>

        {/* Wallet Address Display with Staker Info */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={toggleMenu}
            style={{
              background: showDisconnectMenu ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 255, 0, 0.1)',
              border: '2px solid #00FF00',
              borderRadius: '20px',
              padding: '8px 16px',
              color: '#00FF00',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              background: '#00FF00',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            {account?.address ? truncateAddress(account.address) : 'Connect Wallet'}
            <span style={{ 
              fontSize: '12px', 
              transition: 'transform 0.3s ease',
              transform: showDisconnectMenu ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </button>
          
          {/* Connected Menu with Staker Info */}
          {showDisconnectMenu && account && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'rgba(0, 0, 0, 0.95)',
                border: '2px solid #00FF00',
                borderRadius: '12px',
                padding: '16px',
                minWidth: '300px',
                zIndex: 1000,
                boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '14px',
                color: '#00FF00',
                marginBottom: '12px'
              }}>
                Wallet Connected
              </div>
              <div style={{
                fontSize: '12px',
                color: '#999',
                marginBottom: '16px'
              }}>
                {account.address}
              </div>
              
              {/* Staker information card - only in moderation */}
              <div style={{ marginBottom: 16 }}>
                <StakerInfo stakerData={stakerData} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ConnectButton 
                  client={client}
                  theme="dark"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
