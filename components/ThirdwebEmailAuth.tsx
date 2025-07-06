'use client';

import React, { useState } from 'react';
import { useConnect, ConnectButton } from "thirdweb/react";
import { preAuthenticate } from "thirdweb/wallets/in-app";
import { inAppWallet } from "thirdweb/wallets";
import { createThirdwebClient } from "thirdweb";

const client = createThirdwebClient({
    clientId: "4ddc5eed2e073e550a7307845d10f348",
});

const wallet = inAppWallet();

interface ThirdwebEmailAuthProps {
    title?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function ThirdwebEmailAuth({
    title = "Connexion avec email professionnel",
    onSuccess,
    onError
}: ThirdwebEmailAuthProps) {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [message, setMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const { connect } = useConnect();

    const validateProfessionalEmail = (email: string): { valid: boolean; message: string } => {
        const personalDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'icloud.com', 'aol.com', 'protonmail.com', 'mail.com',
            'live.com', 'msn.com', 'me.com', 'mac.com'
        ];

        const domain = email.split('@')[1]?.toLowerCase();

        if (!domain) {
            return { valid: false, message: "Format d'email invalide" };
        }

        if (personalDomains.includes(domain)) {
            return {
                valid: false,
                message: "Veuillez utiliser une adresse email professionnelle"
            };
        }

        return { valid: true, message: "" };
    };

    const preLogin = async (email: string) => {
        // Validation de l'email
        const validation = validateProfessionalEmail(email);
        if (!validation.valid) {
            setMessage(validation.message);
            onError?.(validation.message);
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Envoyer le code de vérification
            await preAuthenticate({
                client,
                strategy: "email",
                email,
            });

            setIsCodeSent(true);
            setMessage('Code de vérification envoyé ! Vérifiez votre email.');
        } catch (error) {
            const errorMessage = 'Erreur lors de l\'envoi du code de vérification';
            setMessage(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (email: string, verificationCode: string) => {
        if (!verificationCode) {
            setMessage('Veuillez saisir le code de vérification');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Vérifier le code et se connecter
            await connect(async () => {
                await wallet.connect({
                    client,
                    strategy: "email",
                    email,
                    verificationCode,
                });
                return wallet;
            });

            setMessage('Connexion réussie !');
            setEmail('');
            setVerificationCode('');
            setIsCodeSent(false);
            setIsConnected(true);
            onSuccess?.();
        } catch (error) {
            const errorMessage = 'Code de vérification incorrect ou erreur de connexion';
            setMessage(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setMessage("Veuillez saisir une adresse email");
            return;
        }

        if (isCodeSent) {
            await handleLogin(email, verificationCode);
        } else {
            await preLogin(email);
        }
    };

    const handleBackToEmail = () => {
        setIsCodeSent(false);
        setVerificationCode('');
        setMessage('');
    };

    // Si connecté, afficher le ConnectButton thirdweb
    if (isConnected) {
        return (
            <div style={{
                background: '#181818',
                border: '2px solid #FFD600',
                borderRadius: 12,
                padding: 24,
                color: '#fff',
                maxWidth: 400,
                width: '100%'
            }}>
                <h3 style={{
                    color: '#FFD600',
                    marginBottom: 20,
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: 'bold'
                }}>
                    {title}
                </h3>
                <ConnectButton client={client} wallets={[wallet]} />
            </div>
        );
    }

    return (
        <div style={{
            background: '#181818',
            border: '2px solid #FFD600',
            borderRadius: 12,
            padding: 24,
            color: '#fff',
            maxWidth: 400,
            width: '100%'
        }}>
            <h3 style={{
                color: '#FFD600',
                marginBottom: 20,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold'
            }}>
                {title}
            </h3>

            {message && (
                <div style={{
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 16,
                    background: message.includes('envoyé') || message.includes('réussie') ? '#2e7d32' : '#d32f2f',
                    color: '#fff',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {!isCodeSent ? (
                    // Étape 1 : Saisie de l'email
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Votre email professionnel"
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 6,
                                border: '2px solid #FFD600',
                                background: 'none',
                                color: '#FFD600',
                                fontSize: 16,
                                marginBottom: 16,
                                boxSizing: 'border-box'
                            }}
                            required
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: 12,
                                background: '#FFD600',
                                color: '#000',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 16,
                                fontWeight: 'bold',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.6 : 1
                            }}
                        >
                            {isLoading ? 'Envoi...' : 'Recevoir un code de vérification'}
                        </button>
                    </div>
                ) : (
                    // Étape 2 : Saisie du code de vérification
                    <div>
                        <p style={{
                            fontSize: 14,
                            color: '#ccc',
                            marginBottom: 16,
                            textAlign: 'center'
                        }}>
                            Code envoyé à : <strong>{email}</strong>
                        </p>

                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Code de vérification"
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 6,
                                border: '2px solid #FFD600',
                                background: 'none',
                                color: '#FFD600',
                                fontSize: 16,
                                marginBottom: 16,
                                boxSizing: 'border-box',
                                textAlign: 'center',
                                letterSpacing: 2
                            }}
                            required
                        />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                type="button"
                                onClick={handleBackToEmail}
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    background: 'none',
                                    color: '#FFD600',
                                    border: '2px solid #FFD600',
                                    borderRadius: 6,
                                    fontSize: 16,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                            >
                                Retour
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    background: '#FFD600',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.6 : 1
                                }}
                            >
                                {isLoading ? 'Connexion...' : 'Se connecter'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            <div style={{
                background: '#2a2a2a',
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
                border: '1px solid #444'
            }}>
                <p style={{
                    margin: 0,
                    fontSize: 14,
                    color: '#ccc'
                }}>
                    <strong>Emails acceptés :</strong> theo@company.io, contact@entreprise.com, etc.
                </p>
                <p style={{
                    margin: '8px 0 0 0',
                    fontSize: 14,
                    color: '#ccc'
                }}>
                    <strong>Emails refusés :</strong> theo@gmail.com, contact@yahoo.com, etc.
                </p>
            </div>
        </div>
    );
} 