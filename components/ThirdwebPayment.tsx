"use client";

import React, { useState, useEffect } from 'react';
import { useActiveAccount, useConnect } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { inAppWallet } from "thirdweb/wallets";
import { prepareContractCall, sendTransaction, waitForReceipt } from "thirdweb";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Configuration du token WINC (à paramétrer ultérieurement)
const WINC_TOKEN_CONFIG = {
  contractAddress: "0x0000000000000000000000000000000000000000", // À remplacer par l'adresse réelle
  decimals: 18,
  symbol: "WINC",
  name: "Winstory Token"
};

// Configuration de la blockchain (Chiliz pour le hackathon)
const CHILIZ_CHAIN = defineChain({
  id: 88882,
  name: "Chiliz Chain",
  rpc: "https://spicy-rpc.chiliz.com",
  nativeCurrency: {
    name: "CHZ",
    symbol: "CHZ",
    decimals: 18,
  },
});

interface ThirdwebPaymentProps {
  mintAmount: number;
  onPaymentSuccess: (transactionHash: string) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export default function ThirdwebPayment({ 
  mintAmount, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}: ThirdwebPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'connect' | 'verify' | 'approve' | 'pay' | 'success' | 'error'>('connect');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  
  const account = useActiveAccount();
  const { connect } = useConnect();

  useEffect(() => {
    if (account?.address) {
      setWalletAddress(account.address);
      setPaymentStep('approve');
    }
  }, [account]);

  const validateProfessionalEmail = (email: string): { valid: boolean; message: string } => {
    const personalDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'icloud.com', 'aol.com', 'protonmail.com', 'mail.com',
      'live.com', 'msn.com', 'me.com', 'mac.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();

    if (!domain) {
      return { valid: false, message: "Invalid email format" };
    }

    if (personalDomains.includes(domain)) {
      return {
        valid: false,
        message: "Please use a professional email address"
      };
    }

    return { valid: true, message: "" };
  };

  const handleSendVerificationCode = async () => {
    if (!email) {
      setErrorMessage('Please enter an email address');
      return;
    }

    // Validation de l'email
    const validation = validateProfessionalEmail(email);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Utiliser preAuthenticate pour envoyer le code de vérification
      const { preAuthenticate } = await import("thirdweb/wallets/in-app");
      
      await preAuthenticate({
        client,
        strategy: "email",
        email,
      });

      setIsCodeSent(true);
      setPaymentStep('verify');
    } catch (error) {
      console.error('Pre-authentication error:', error);
      setErrorMessage('Error sending verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!verificationCode) {
      setErrorMessage('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      
      await connect(async () => {
        const wallet = inAppWallet();
        await wallet.connect({
          client,
          strategy: "email",
          email,
          verificationCode,
        });
        return wallet;
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      setErrorMessage('Failed to verify verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveTokens = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setPaymentStep('pay');

      // Pour l'instant, on simule l'approbation
      // TODO: Implémenter l'approbation réelle du token WINC
      console.log(`Approving ${mintAmount} WINC tokens...`);
      
      // Simulation d'un délai d'approbation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Token approval error:', error);
      setErrorMessage('Failed to approve tokens. Please try again.');
      setPaymentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setPaymentStep('pay');

      if (!account?.address) {
        throw new Error('No wallet connected');
      }

      // Pour l'instant, on simule le paiement
      // TODO: Implémenter le paiement réel avec le token WINC
      console.log(`Processing payment of ${mintAmount} WINC tokens...`);
      
      // Simulation d'une transaction
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTransactionHash(mockTransactionHash);
      
      // Simulation d'un délai de transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setPaymentStep('success');
      onPaymentSuccess(mockTransactionHash);
      
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Payment failed. Please try again.');
      setPaymentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setErrorMessage('');
    setPaymentStep('connect');
    setEmail('');
    setVerificationCode('');
    setIsCodeSent(false);
  };

  const handleBackToEmail = () => {
    setPaymentStep('connect');
    setVerificationCode('');
    setIsCodeSent(false);
    setErrorMessage('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#000',
        border: '3px solid #FFD600',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        color: '#fff',
        position: 'relative'
      }}>
        {/* Bouton de fermeture */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#FF2D2D',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>

        {/* Titre */}
        <h2 style={{ color: '#FFD600', fontSize: '28px', fontWeight: '700', marginBottom: '20px' }}>
          Payment Required
        </h2>

        {/* Montant à payer */}
        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '2px solid #FFD600',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ color: '#FFD600', fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Initial MINT Cost
          </div>
          <div style={{ color: '#fff', fontSize: '32px', fontWeight: '700' }}>
            {mintAmount} $WINC
          </div>
          <div style={{ color: '#FFD600', fontSize: '14px', fontStyle: 'italic', marginTop: '8px' }}>
            This amount will be deducted from your wallet
          </div>
        </div>

        {/* État de la connexion du wallet */}
        {walletAddress && (
          <div style={{
            background: 'rgba(24, 201, 100, 0.1)',
            border: '1px solid #18C964',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ color: '#18C964', fontSize: '14px', fontWeight: '600' }}>
              ✓ Wallet Connected
            </div>
            <div style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {errorMessage && (
          <div style={{
            background: 'rgba(255, 45, 45, 0.1)',
            border: '1px solid #FF2D2D',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#FF2D2D',
            fontSize: '14px'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Contenu selon l'étape */}
        {paymentStep === 'connect' && (
          <div>
            <div style={{ color: '#fff', fontSize: '16px', marginBottom: '20px' }}>
              Enter your professional email to connect your wallet
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your professional email"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #FFD600',
                background: 'rgba(255, 215, 0, 0.1)',
                color: '#fff',
                fontSize: '16px',
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleSendVerificationCode}
              disabled={isLoading || !email}
              style={{
                background: '#18C964',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: (isLoading || !email) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !email) ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        )}

        {paymentStep === 'verify' && (
          <div>
            <div style={{ color: '#fff', fontSize: '16px', marginBottom: '20px' }}>
              Enter the verification code sent to {email}
            </div>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Verification code"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #FFD600',
                background: 'rgba(255, 215, 0, 0.1)',
                color: '#fff',
                fontSize: '16px',
                marginBottom: '20px',
                boxSizing: 'border-box',
                textAlign: 'center',
                letterSpacing: '2px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleBackToEmail}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'none',
                  color: '#FFD600',
                  border: '2px solid #FFD600',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                Back
              </button>
              <button
                onClick={handleConnectWallet}
                disabled={isLoading || !verificationCode}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#18C964',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: (isLoading || !verificationCode) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || !verificationCode) ? 0.7 : 1
                }}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        )}

        {paymentStep === 'approve' && (
          <div>
            <div style={{ color: '#fff', fontSize: '16px', marginBottom: '30px' }}>
              Approve the spending of {mintAmount} $WINC tokens
            </div>
            <button
              onClick={handleApproveTokens}
              disabled={isLoading}
              style={{
                background: '#FFD600',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? 'Approving...' : 'Approve Tokens'}
            </button>
          </div>
        )}

        {paymentStep === 'pay' && (
          <div>
            <div style={{ color: '#fff', fontSize: '16px', marginBottom: '30px' }}>
              Confirm the payment of {mintAmount} $WINC tokens
            </div>
            <button
              onClick={handlePayment}
              disabled={isLoading}
              style={{
                background: '#18C964',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isLoading ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        )}

        {paymentStep === 'success' && (
          <div>
            <div style={{ color: '#18C964', fontSize: '48px', marginBottom: '20px' }}>
              ✓
            </div>
            <div style={{ color: '#18C964', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              Payment Successful!
            </div>
            <div style={{ color: '#fff', fontSize: '14px', marginBottom: '20px' }}>
              Transaction Hash: {transactionHash}
            </div>
            <div style={{ color: '#18C964', fontSize: '16px' }}>
              Your campaign is now being created...
            </div>
          </div>
        )}

        {paymentStep === 'error' && (
          <div>
            <div style={{ color: '#FF2D2D', fontSize: '48px', marginBottom: '20px' }}>
              ✗
            </div>
            <div style={{ color: '#FF2D2D', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
              Payment Failed
            </div>
            <div style={{ color: '#fff', fontSize: '14px', marginBottom: '20px' }}>
              {errorMessage}
            </div>
            <button
              onClick={handleRetry}
              style={{
                background: '#FFD600',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                marginRight: '12px'
              }}
            >
              Try Again
            </button>
            <button
              onClick={onCancel}
              style={{
                background: '#FF2D2D',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '3px solid #FFD600',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
