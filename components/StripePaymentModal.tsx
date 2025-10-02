"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { STRIPE_CONFIG } from '@/lib/config/stripe-config';

// Initialiser Stripe
const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  flowType: 'b2c' | 'agencyb2c';
  userEmail?: string;
  metadata?: Record<string, any>;
}

/**
 * Formulaire de paiement Stripe (à l'intérieur du modal)
 */
function PaymentForm({ 
  amount, 
  flowType, 
  onSuccess, 
  onError 
}: { 
  amount: number;
  flowType: 'b2c' | 'agencyb2c';
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/creation/${flowType}/thanks`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred');
        onError(error.message || 'An error occurred');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage('Payment processing error');
      onError('Payment processing error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <PaymentElement />
      
      {errorMessage && (
        <div style={{ 
          color: '#ff4444', 
          fontSize: 14, 
          marginTop: 16,
          padding: 12,
          background: 'rgba(255, 68, 68, 0.1)',
          borderRadius: 8,
        }}>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        style={{
          width: '100%',
          marginTop: 24,
          padding: 16,
          background: isProcessing ? '#666' : '#18C964',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {isProcessing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
}

/**
 * Composant principal du modal de paiement Stripe
 */
export default function StripePaymentModal({
  isOpen,
  onClose,
  amount,
  flowType,
  userEmail,
  metadata = {},
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && !clientSecret) {
      createPaymentIntent();
    }
  }, [isOpen]);

  const createPaymentIntent = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          flowType,
          userEmail,
          metadata,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setClientSecret(data.clientSecret);
      }
    } catch (err) {
      setError('Error initializing payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    // Redirect to thank you page
    window.location.href = `/creation/${flowType}/thanks`;
  };

  const handleError = (errorMsg: string) => {
    console.error('Payment error:', errorMsg);
  };

  if (!isOpen) return null;

  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#18C964',
        colorBackground: '#181818',
        colorText: '#ffffff',
        colorDanger: '#ff4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '12px',
      },
    },
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#181818',
          borderRadius: 24,
          padding: 32,
          maxWidth: 500,
          width: '100%',
          border: '2px solid #18C964',
          boxShadow: '0 8px 64px rgba(24, 201, 100, 0.2)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: 24,
            cursor: 'pointer',
            padding: 8,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <h2 style={{ 
          color: '#FFD600', 
          fontSize: 24, 
          fontWeight: 700, 
          marginBottom: 8,
          textAlign: 'center',
        }}>
          Secure Payment
        </h2>
        
        <div style={{ 
          color: '#888', 
          fontSize: 14, 
          marginBottom: 24,
          textAlign: 'center',
        }}>
          Amount: <span style={{ color: '#18C964', fontWeight: 700, fontSize: 18 }}>${amount}</span>
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#fff' }}>
            <div style={{ fontSize: 16 }}>Initializing payment...</div>
          </div>
        ) : error ? (
          <div style={{ 
            color: '#ff4444', 
            padding: 20,
            background: 'rgba(255, 68, 68, 0.1)',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            {error}
            <button
              onClick={createPaymentIntent}
              style={{
                marginTop: 16,
                padding: '10px 20px',
                background: '#18C964',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm 
              amount={amount}
              flowType={flowType}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </Elements>
        ) : null}

        {/* Footer */}
        <div style={{ 
          marginTop: 24, 
          color: '#666', 
          fontSize: 12, 
          textAlign: 'center',
          borderTop: '1px solid #333',
          paddingTop: 16,
        }}>
          🔒 Secure payment via Stripe<br />
          Credit Card • PayPal • Google Pay • Apple Pay
        </div>
      </div>
    </div>
  );
} 