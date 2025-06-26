"use client";
import Link from 'next/link';

export default function B2CRedirect() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <Link href="/creation/b2c/yourwinstory" style={{ color: '#FFD600', fontSize: 24, textDecoration: 'underline' }}>
        Go to Your Winstory
      </Link>
    </div>
  );
}
