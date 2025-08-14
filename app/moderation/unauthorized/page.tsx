'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#FF6B6B',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '24px'
    }}>
      <h1 style={{ 
        fontSize: '48px', 
        fontWeight: 900, 
        marginBottom: '24px'
      }}>
        Access Denied
      </h1>
      
      <p style={{ 
        fontSize: '20px', 
        color: '#fff',
        marginBottom: '48px',
        maxWidth: '600px',
        lineHeight: '1.6'
      }}>
        You are not authorized to moderate this campaign. This could be due to:
      </p>
      
      <ul style={{ 
        textAlign: 'left',
        fontSize: '18px',
        color: '#fff',
        marginBottom: '48px',
        maxWidth: '500px'
      }}>
        <li style={{ marginBottom: '12px' }}>• Insufficient staking requirements</li>
        <li style={{ marginBottom: '12px' }}>• Campaign already completed</li>
        <li style={{ marginBottom: '12px' }}>• You are the creator of this campaign</li>
        <li style={{ marginBottom: '12px' }}>• Campaign is not in moderation phase</li>
      </ul>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={() => router.push('/moderation/list')}
          style={{
            padding: '12px 24px',
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#00CC00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#00FF00';
          }}
        >
          View Other Campaigns
        </button>
        
        <button
          onClick={() => router.push('/welcome')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            color: '#00FF00',
            border: '2px solid #00FF00',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
} 