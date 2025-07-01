"use client";
import React from 'react';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Ethereum } from '@thirdweb-dev/chains';
import Providers from '@/components/Providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <ThirdwebProvider
          activeChain={Ethereum}
          clientId="4ddc5eed2e073e550a7307845d10f348" // Remplace par ton vrai clientId thirdweb si besoin
        >
          <Providers>
            {children}
          </Providers>
        </ThirdwebProvider>
      </body>
    </html>
  );
} 