'use client';

import { useActiveAccount } from 'thirdweb/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdminWallet } from '@/lib/adminAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const account = useActiveAccount();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // En développement, permettre l'accès
    if (process.env.NODE_ENV !== 'production') {
      setIsAuthorized(true);
      return;
    }

    // Vérifier l'accès admin
    if (account?.address) {
      const authorized = isAdminWallet(account.address);
      setIsAuthorized(authorized);
      
      if (!authorized) {
        console.warn('🚫 [ADMIN] Unauthorized access attempt');
        router.push('/');
      }
    } else {
      setIsAuthorized(false);
    }
  }, [account?.address, router]);

  // Afficher un loader pendant la vérification
  if (isAuthorized === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#FFD600',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 214, 0, 0.3)',
          borderTopColor: '#FFD600',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div>Vérification de l'accès admin...</div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si non autorisé, afficher un message
  if (isAuthorized === false) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        color: '#FF6B6B',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        gap: '16px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          margin: '0 0 8px 0'
        }}>
          Accès refusé
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#999',
          maxWidth: '500px',
          margin: '0 0 24px 0'
        }}>
          Vous n'êtes pas autorisé à accéder à cette interface admin.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '12px 24px',
            background: '#FFD600',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // Afficher le contenu si autorisé
  return <>{children}</>;
}

