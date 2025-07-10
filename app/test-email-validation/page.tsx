'use client';

import React from 'react';
import WalletConnect from '@/components/WalletConnect';

export default function TestEmailValidationPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 24
        }}>

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 500,
                margin: '32px auto 32px auto',
                position: 'relative'
            }}>
                <span style={{
                    fontSize: 40,
                    fontWeight: 700,
                    color: '#FFD600',
                    letterSpacing: 1,
                    whiteSpace: 'nowrap'
                }}>
                    Test Professional Email Validation
                </span>
            </div>

            {/* Connection status */}
            <div style={{
                background: '#181818',
                border: '2px solid #FFD600',
                borderRadius: 12,
                padding: 24,
                marginBottom: 32,
                maxWidth: 500,
                width: '100%'
            }}>
                <h3 style={{ color: '#FFD600', marginBottom: 16 }}>Connection status:</h3>
                <p>Status: <span style={{ color: '#FFD600' }}>Verification in progress...</span></p>
                <p>Check the debug panel at the bottom right to see details</p>
            </div>

            {/* Instructions */}
            <div style={{
                background: '#181818',
                border: '2px solid #2eea8b',
                borderRadius: 12,
                padding: 24,
                marginBottom: 32,
                maxWidth: 500,
                width: '100%'
            }}>
                <h3 style={{ color: '#2eea8b', marginBottom: 16 }}>Test instructions:</h3>
                <ol style={{ lineHeight: 1.6 }}>
                    <li>Try to connect with a personal email (gmail.com, yahoo.com, etc.)</li>
                    <li>You should see an error modal after connection</li>
                    <li>You will be automatically disconnected after 3 seconds</li>
                    <li>Then try with a professional email (example@company.com)</li>
                </ol>
            </div>

            {/* Authentication component */}
            <div style={{
                width: '100%',
                maxWidth: 400,
                margin: '0 auto',
                marginTop: 32,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24
            }}>
                <WalletConnect isEmailLogin={true} />
            </div>

            {/* Back to home */}
            <div style={{ marginTop: 32 }}>
                <button
                    onClick={() => window.location.href = '/welcome'}
                    style={{
                        background: '#FF2D2D',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 16
                    }}
                >
                    Back to home
                </button>
            </div>
        </div>
    );
} 