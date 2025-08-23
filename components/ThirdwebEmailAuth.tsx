"use client";

import { ConnectButton, useConnect } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { useState } from "react";
import { preAuthenticate } from "thirdweb/wallets/in-app";
import { client } from "@/lib/thirdwebClient";

interface ThirdwebEmailAuthProps {
    title?: string;
    onSuccess?: (data: { email: string; walletAddress: string }) => void;
    onError?: (error: string) => void;
}

export default function ThirdwebEmailAuth({
    title = "Login with professional email",
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
            setMessage('Verification code sent! Check your email.');
        } catch (error) {
            const errorMessage = 'Error sending verification code';
            setMessage(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (email: string, verificationCode: string) => {
        if (!verificationCode) {
            setMessage('Please enter the verification code');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Vérifier le code et se connecter
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

            setMessage('Login successful!');
            setEmail('');
            setVerificationCode('');
            setIsCodeSent(false);
            setIsConnected(true);
            onSuccess?.({ email, walletAddress: 'connected' });
        } catch (error) {
            const errorMessage = 'Invalid verification code or connection error';
            setMessage(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setMessage("Please enter an email address");
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
                <div style={{
                    padding: 16,
                    background: '#222',
                    borderRadius: 8,
                    color: '#00C46C',
                    fontWeight: 700,
                    marginBottom: 16,
                    textAlign: 'center',
                    border: '1px solid #00C46C'
                }}>
                    Login successful!
                </div>
                <ConnectButton client={client} />
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
                    background: message.includes('sent') || message.includes('successful') ? '#2e7d32' : '#d32f2f',
                    color: '#fff',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {!isCodeSent ? (
                    // Step 1: Email input
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your professional email"
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
                            {isLoading ? 'Sending...' : 'Send verification code'}
                        </button>
                    </div>
                ) : (
                    // Step 2: Verification code input
                    <div>
                        <p style={{
                            fontSize: 14,
                            color: '#ccc',
                            marginBottom: 16,
                            textAlign: 'center'
                        }}>
                            Code sent to: <strong>{email}</strong>
                        </p>

                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Verification code"
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
                                Back
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
                                {isLoading ? 'Connecting...' : 'Connect'}
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
                border: '1px solid #444',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
            }}>
                <div style={{
                    background: '#173c2a',
                    border: '1px solid #18C964',
                    borderRadius: 6,
                    padding: '10px 14px',
                    color: '#18C964',
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 4
                }}>
                    Accepted only pro emails: <span style={{ color: '#fff', fontWeight: 400 }}>@company, contact@company.com, etc.</span>
                </div>
                <div style={{
                    background: '#3c1717',
                    border: '1px solid #FF2D2D',
                    borderRadius: 6,
                    padding: '10px 14px',
                    color: '#FF2D2D',
                    fontSize: 14,
                    fontWeight: 600
                }}>
                    Rejected perso emails: <span style={{ color: '#fff', fontWeight: 400 }}>@gmail.com, @outlook.com, contact@yahoo.com, etc.</span>
                </div>
            </div>
        </div>
    );
} 