"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { useEffect, useState } from "react";

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

export default function HackathonWalletConnect() {
  const [mounted, setMounted] = useState(false);
  const account = useActiveAccount();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '2px solid #00FF00',
      borderRadius: '12px',
      color: '#00FF00'
    }}>
      <h2 style={{ margin: 0, color: '#00FF00' }}>Hackathon Access</h2>
      
      {account?.address ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px 0' }}>Connected:</p>
          <p style={{ 
            margin: '0 0 20px 0', 
            fontFamily: 'monospace',
            background: 'rgba(0, 255, 0, 0.1)',
            padding: '8px 12px',
            borderRadius: '6px'
          }}>
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </p>
          <ConnectButton 
            client={client}
            theme="dark"
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px' }}>Connect your wallet to access hackathon features</p>
          <ConnectButton 
            client={client}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
} 