'use client';

import React from 'react';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Ethereum } from '@thirdweb-dev/chains';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <ThirdwebProvider
          activeChain={Ethereum}
          clientId="your-client-id-here"
        >
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
} 