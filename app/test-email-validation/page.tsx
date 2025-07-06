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
                    Test Validation Email Pro
                </span>
            </div>

            {/* Status de connexion */}
            <div style={{
                background: '#181818',
                border: '2px solid #FFD600',
                borderRadius: 12,
                padding: 24,
                marginBottom: 32,
                maxWidth: 500,
                width: '100%'
            }}>
                <h3 style={{ color: '#FFD600', marginBottom: 16 }}>Statut de connexion :</h3>
                <p>Status: <span style={{ color: '#FFD600' }}>Vérification en cours...</span></p>
                <p>Regardez le panneau de debug en bas à droite pour voir les détails</p>
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
                <h3 style={{ color: '#2eea8b', marginBottom: 16 }}>Instructions de test :</h3>
                <ol style={{ lineHeight: 1.6 }}>
                    <li>Essayez de vous connecter avec un email personnel (gmail.com, yahoo.com, etc.)</li>
                    <li>Vous devriez voir une modal d'erreur après connexion</li>
                    <li>Vous serez automatiquement déconnecté après 3 secondes</li>
                    <li>Essayez ensuite avec un email professionnel (exemple@company.com)</li>
                </ol>
            </div>

            {/* Composant d'authentification */}
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

            {/* Retour à l'accueil */}
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
                    Retour à l'accueil
                </button>
            </div>
        </div>
    );
} 