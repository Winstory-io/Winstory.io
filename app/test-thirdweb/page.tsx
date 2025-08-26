"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

export default function TestThirdwebPage() {
  const account = useActiveAccount();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#00FF00',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>
        Test Thirdweb Connection
      </h1>
      
      <div style={{ marginBottom: '24px' }}>
        <ConnectButton client={client} theme="dark" />
      </div>
      
      {account ? (
        <div style={{ 
          background: 'rgba(0, 255, 0, 0.1)', 
          border: '2px solid #00FF00',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#00FF00', marginBottom: '16px' }}>
            Connected!
          </h3>
          <p style={{ color: '#fff', fontSize: '14px', wordBreak: 'break-all' }}>
            Address: {account.address}
          </p>
        </div>
      ) : (
        <p style={{ color: '#ccc', fontSize: '16px' }}>
          Please connect your wallet to test
        </p>
      )}
    </div>
  );
} 