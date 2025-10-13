'use client';

import React, { useEffect } from 'react';
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

interface ExplorerWalletPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (walletAddress: string) => void;
}

export default function ExplorerWalletPopup({ isOpen, onClose, onSuccess }: ExplorerWalletPopupProps) {
  const account = useActiveAccount();

  // Écouter la connexion du wallet
  useEffect(() => {
    if (account?.address) {
      // Sauvegarder dans localStorage
      localStorage.setItem('walletAddress', account.address);
      
      // Appeler onSuccess
      onSuccess(account.address);
    }
  }, [account, onSuccess]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%)',
          border: '3px solid #00FF88',
          borderRadius: 24,
          padding: 48,
          maxWidth: 500,
          width: '90%',
          boxShadow: '0 24px 72px rgba(0, 255, 136, 0.4)',
          position: 'relative',
          animation: 'slideUp 0.4s ease',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(0, 255, 136, 0.2)',
            border: '2px solid #00FF88',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 24,
            fontWeight: 700,
            color: '#00FF88',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00FF88';
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)';
            e.currentTarget.style.color = '#00FF88';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          ×
        </button>

        {/* Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #00FF88 0%, #00CC6E 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            boxShadow: '0 8px 24px rgba(0, 255, 136, 0.4)',
          }}
        >
          🔗
        </div>

        {/* Title */}
        <h2
          style={{
            color: '#00FF88',
            fontSize: 32,
            fontWeight: 900,
            marginBottom: 12,
            textAlign: 'center',
            letterSpacing: '1px',
            textShadow: '0 0 24px rgba(0, 255, 136, 0.6)',
          }}
        >
          Connect Wallet
        </h2>

        <p
          style={{
            color: '#999',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 40,
            lineHeight: 1.6,
          }}
        >
          Connect your Web3 wallet to complete campaigns and earn rewards
        </p>

        {/* Wallet Connect Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <ConnectButton 
            client={client}
            theme="dark"
            connectButton={{
              label: "Connect Wallet",
              style: {
                background: 'linear-gradient(135deg, #00FF88 0%, #00CC6E 100%)',
                color: '#000',
                fontWeight: '900',
                fontSize: '18px',
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 8px 24px rgba(0, 255, 136, 0.4)',
                transition: 'all 0.3s ease',
              },
            }}
          />
        </div>

        {/* Info Box */}
        <div
          style={{
            padding: 20,
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: 12,
            fontSize: 13,
            color: '#999',
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              color: '#00FF88',
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 18 }}>💡</span>
            <span>Supported Wallets</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12 }}>
            <li style={{ marginBottom: 4 }}>MetaMask, WalletConnect, Coinbase</li>
            <li style={{ marginBottom: 4 }}>Email wallet (Account Abstraction)</li>
            <li style={{ marginBottom: 4 }}>Social logins (Google, Apple, etc.)</li>
            <li>And many more Web3 wallets</li>
          </ul>
        </div>
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

