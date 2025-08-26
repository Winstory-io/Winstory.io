"use client";

import RewardsHeader from '../../b2c/standardrewards/RewardsHeader';
import RewardsOptions from './RewardsOptions';
import styles from '../../b2c/standardrewards/Rewards.module.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getAddressValidationError, getDecimalsNote } from '../../../../lib/blockchain';
import { useRealTimeBalance } from '../../../../lib/hooks/useWalletBalance';
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from 'next/navigation';
import { validateContract } from '../../../../lib/blockchain-rpc';
import { ItemInfo } from '../../../../lib/blockchain-rpc';
import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { useEffect, useState, useRef } from "react";

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

export default function AgencyB2CStandardRewardsPage() {
  const account = useActiveAccount();
  const walletAddress = account?.address;
  const router = useRouter();
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleForceDisconnect = () => {
    setShowDisconnectMenu(false);
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    localStorage.removeItem("walletAddress");
    // Redirect to welcome page
    router.push('/welcome');
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

  // If no wallet connected, show connection screen
  if (!account) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: '#181818',
          border: '2px solid #FFD600',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{
            color: '#FFD600',
            marginBottom: '24px',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            Wallet Connection Required
          </h2>
          <p style={{
            color: '#fff',
            marginBottom: '32px',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            Please connect your wallet to access the rewards configuration.
          </p>
          <ConnectButton client={client} theme="dark" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ErrorBoundary>
        <div className={styles.container}>
          {/* Top Navigation Bar with Wallet */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 100,
            padding: '16px 24px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              maxWidth: 1200,
              margin: '0 auto',
            }}>
              {/* Wallet Display */}
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
                  {truncateAddress(walletAddress || '')}
                  <span style={{
                    fontSize: '12px',
                    transition: 'transform 0.3s ease',
                    transform: showDisconnectMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                </button>

                {/* Disconnect Menu */}
                {showDisconnectMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'rgba(0, 0, 0, 0.95)',
                    border: '2px solid #00FF00',
                    borderRadius: '12px',
                    padding: '8px 0',
                    minWidth: '200px',
                    zIndex: 1000,
                    boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#00FF00',
                      borderBottom: '1px solid rgba(0, 255, 0, 0.2)'
                    }}>
                      Wallet Connected
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      color: '#999',
                      fontFamily: 'monospace'
                    }}>
                      {walletAddress}
                    </div>
                    <button
                      onClick={handleForceDisconnect}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'none',
                        border: 'none',
                        color: '#FF6B6B',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      🔌 Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content with Top Padding */}
          <div style={{ paddingTop: '80px' }}>
            <RewardsHeader />
            <div className={styles.subtitles}>
              <p className={styles.choose}>Choose how you want to thank your Community</p>
              <h2 className={styles.standard}>Standard Rewards</h2>
              <p className={styles.italic}>
                <em>
                  Select the type of reward to give for each completion <span className={styles.validated}>validated</span> by Moderators
                </em>
              </p>
            </div>
            <RewardsOptions />
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </ErrorBoundary>
    </>
  );
} 