'use client';

import React from 'react';
import { ConnectWallet } from '@thirdweb-dev/react';

export default function WalletConnect() {
    return (
        <ConnectWallet
            theme="dark"
            btnTitle="Connect Wallet"
            modalTitle="Connect your wallet"
            modalSize="wide"
            welcomeScreen={{
                title: "Welcome to Winstory",
                subtitle: "Connect your wallet to get started",
            }}
            modalTitleIconUrl="/logo.svg"
            style={{
                backgroundColor: 'transparent',
                color: '#FFD600',
                border: '2px solid #FFD600',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                minWidth: '140px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        />
    );
}
