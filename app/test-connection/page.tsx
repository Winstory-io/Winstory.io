"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestConnectionPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Simuler une connexion réussie
      localStorage.setItem('user', JSON.stringify({ email }));
      localStorage.setItem('walletAddress', '0x1234567890abcdef');
      
      setMessage('Connection successful! Redirecting to /mywin...');
      
      // Rediriger vers /mywin après un délai
      setTimeout(() => {
        router.push('/mywin');
      }, 2000);
      
    } catch (error) {
      setMessage('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToMyWin = () => {
    router.push('/mywin');
  };

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
        Test Connection
      </h1>
      
      <form onSubmit={handleTestConnection} style={{ marginBottom: '24px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{
            width: '300px',
            padding: '12px',
            borderRadius: '6px',
            border: '2px solid #00FF00',
            background: 'none',
            color: '#00FF00',
            fontSize: '16px',
            marginBottom: '16px',
            display: 'block'
          }}
          required
        />
        
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '300px',
            padding: '12px',
            background: '#00FF00',
            color: '#000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Connecting...' : 'Test Connection'}
        </button>
      </form>
      
      {message && (
        <div style={{ 
          padding: '16px',
          background: message.includes('successful') ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          border: `2px solid ${message.includes('successful') ? '#00FF00' : '#FF0000'}`,
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          {message}
        </div>
      )}
      
      <button
        onClick={handleGoToMyWin}
        style={{
          padding: '12px 24px',
          background: 'none',
          color: '#00FF00',
          border: '2px solid #00FF00',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        Go to /mywin directly
      </button>
    </div>
  );
} 