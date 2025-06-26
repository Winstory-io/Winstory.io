import Link from 'next/link';
import React from 'react';

const LoginHeader: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: 40, marginBottom: 48, width: '100%', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
    <span style={{ fontSize: 32, fontWeight: 700, color: '#2eea8b', letterSpacing: 1 }}>Creation login</span>
    <span style={{ fontSize: 32, marginLeft: 16, marginRight: 16 }}>💡</span>
    <Link href="/creation/youare" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} aria-label="Close">
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
        <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </Link>
  </div>
);

export default LoginHeader; 