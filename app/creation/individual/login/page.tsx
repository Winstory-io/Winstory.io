import React from 'react';
import LoginHeader from '@/components/LoginHeader';
import LoginButton from '@/components/LoginButton';

export default function IndividualLoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 }}>
      <LoginHeader />
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 32 }}>
        <LoginButton
          icon={<span role="img" aria-label="wallet">💳</span>}
          text="With your Web.3 Wallet"
          required
        />
      </div>
    </div>
  );
} 