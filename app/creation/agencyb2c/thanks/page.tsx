"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AgencyB2CThanksPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Get details from localStorage
    const details = {
      amount: localStorage.getItem('finalPrice') || '1000',
      agencyName: localStorage.getItem('agencyName') || 'Your agency',
      clientName: localStorage.getItem('clientB2CName') || '',
      agencyEmail: localStorage.getItem('userEmail') || '',
      clientEmail: localStorage.getItem('clientB2CEmail') || '',
    };
    setPaymentDetails(details);

    // Compte à rebours pour la redirection
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/mywin/creations');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #000 0%, #0a3d0a 100%)',
      color: '#fff', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animations de fond */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(24, 201, 100, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 2s ease-in-out infinite',
      }} />

      {/* Icône de succès animée */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: '#18C964',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        animation: 'scaleIn 0.5s ease-out',
        boxShadow: '0 8px 32px rgba(24, 201, 100, 0.4)',
      }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Main title */}
      <h1 style={{
        fontSize: 48,
        fontWeight: 700,
        marginBottom: 16,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #FFD600 0%, #18C964 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'fadeIn 0.8s ease-out',
      }}>
        🎉 Payment Successful!
      </h1>

      {/* Main message */}
      <p style={{
        fontSize: 20,
        color: '#18C964',
        marginBottom: 32,
        textAlign: 'center',
        maxWidth: 600,
        animation: 'fadeIn 1s ease-out',
      }}>
        Thank you {paymentDetails?.agencyName}! Your client's campaign is being prepared.
      </p>

      {/* Carte d'informations */}
      <div style={{
        background: 'rgba(24, 201, 100, 0.1)',
        border: '2px solid #18C964',
        borderRadius: 24,
        padding: 32,
        maxWidth: 600,
        width: '100%',
        marginBottom: 32,
        animation: 'slideUp 1.2s ease-out',
      }}>
        <h2 style={{ 
          color: '#FFD600', 
          fontSize: 24, 
          fontWeight: 700, 
          marginBottom: 24,
          textAlign: 'center',
        }}>
          📋 Next Steps
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ 
              minWidth: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: '#18C964',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>1</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Email confirmation (x2)</div>
              <div style={{ color: '#888', fontSize: 14 }}>
                A confirmation will be sent to your agency ({paymentDetails?.agencyEmail || 'your email'})
                {paymentDetails?.clientEmail && ` and to your client (${paymentDetails.clientEmail})`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ 
              minWidth: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: '#18C964',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>2</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Community moderation</div>
              <div style={{ color: '#888', fontSize: 14 }}>
                The campaign will be submitted to the Winstory community for moderation
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ 
              minWidth: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: '#18C964',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>3</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Publication within 24-48h</div>
              <div style={{ color: '#888', fontSize: 14 }}>
                After validation, the campaign will be published and visible in the Explorer
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ 
              minWidth: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: '#FFD600',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>4</div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Real-time tracking</div>
              <div style={{ color: '#888', fontSize: 14 }}>
                You and your client will be able to track the campaign's progress from "My Creations"
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agency info */}
      {paymentDetails?.clientName && (
        <div style={{
          background: 'rgba(255, 214, 0, 0.1)',
          border: '1px solid #FFD600',
          borderRadius: 16,
          padding: 20,
          maxWidth: 600,
          width: '100%',
          marginBottom: 32,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#FFD600', marginBottom: 4 }}>
            👤 Campaign created for
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {paymentDetails.clientName}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
        <button
          onClick={() => router.push('/mywin/creations')}
          style={{
            background: '#18C964',
            border: 'none',
            color: '#fff',
            borderRadius: 16,
            fontSize: 18,
            fontWeight: 700,
            padding: '16px 32px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 16px rgba(24, 201, 100, 0.3)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          View My Creations 🎬
        </button>

        <button
          onClick={() => router.push('/explorer')}
          style={{
            background: 'none',
            border: '2px solid #FFD600',
            color: '#FFD600',
            borderRadius: 16,
            fontSize: 18,
            fontWeight: 700,
            padding: '16px 32px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 214, 0, 0.1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Explore Campaigns 🔍
        </button>
      </div>

      {/* Countdown */}
      <div style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
        Automatic redirect in <span style={{ color: '#18C964', fontWeight: 700 }}>{countdown}s</span>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 