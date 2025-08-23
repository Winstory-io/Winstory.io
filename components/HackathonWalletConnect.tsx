"use client";

import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";

interface HackathonWalletConnectProps {
  onLoginSuccess?: (data: { walletAddress: string }) => void;
  onLogout?: () => void;
}

export default function HackathonWalletConnect({ onLoginSuccess, onLogout }: HackathonWalletConnectProps) {
  const [mounted, setMounted] = useState(false);
  const account = useAddress(); // Utilise useAddress au lieu de useActiveAccount
  const [chzBalance, setChzBalance] = useState<string>('0');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle wallet connection
  useEffect(() => {
    if (account && onLoginSuccess) {
      onLoginSuccess({
        walletAddress: account
      });
    }
  }, [account, onLoginSuccess]);

  if (!mounted) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      width: '100%'
    }}>
      <ConnectWallet />
      
      {account && (
        <div style={{
          background: '#181818',
          border: '2px solid #FFD600',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{
            color: '#18C964',
            fontSize: '14px',
            marginBottom: '8px'
          }}>
            Wallet Connected
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#999'
          }}>
            CHZ Balance: {chzBalance}
          </div>
        </div>
      )}
    </div>
  );
} 