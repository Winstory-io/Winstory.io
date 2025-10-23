"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Import dynamique de Thirdweb pour éviter les problèmes de chunks
const ConnectButton = dynamic(
  () => import("thirdweb/react").then((mod) => mod.ConnectButton),
  { ssr: false, loading: () => <div>Loading...</div> }
);

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
    const [thirdwebClient, setThirdwebClient] = useState<any>(null);

    // Initialiser Thirdweb de manière dynamique
    useEffect(() => {
        const initThirdweb = async () => {
            try {
                const { createThirdwebClient } = await import("thirdweb");
                const client = createThirdwebClient({
                    clientId: "4ddc5eed2e073e550a7307845d10f348",
                });
                setThirdwebClient(client);
            } catch (error) {
                console.error('Failed to initialize Thirdweb:', error);
                setMessage('Failed to initialize wallet system. Please refresh the page.');
            }
        };
        initThirdweb();
    }, []);

    // Vérifier si l'utilisateur est déjà connecté au montage
    useEffect(() => {
        try {
            const user = localStorage.getItem('user');
            const walletAddress = localStorage.getItem('walletAddress');
            
            if (user && walletAddress) {
                const userData = JSON.parse(user);
                setIsConnected(true);
                setMessage('Already connected!');
                // Appeler onSuccess immédiatement si déjà connecté
                onSuccess?.({ email: userData.email, walletAddress });
            }
        } catch (error) {
            console.error('Error checking localStorage:', error);
        }
    }, [onSuccess]);

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

        if (!thirdwebClient) {
            setMessage('Wallet system not ready. Please wait...');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Utiliser Thirdweb pour l'authentification par email
            const { preAuthenticate } = await import("thirdweb/wallets/in-app");
            
            await preAuthenticate({
                client: thirdwebClient,
                strategy: "email",
                email,
            });

            setIsCodeSent(true);
            setMessage('Verification code sent! Check your email.');
        } catch (error) {
            console.error('Pre-authentication error:', error);
            const errorMessage = 'Error sending verification code. Please try again.';
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

        if (!thirdwebClient) {
            setMessage('Wallet system not ready. Please wait...');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Utiliser Thirdweb pour la connexion
            const { inAppWallet } = await import("thirdweb/wallets");
            const { useConnect } = await import("thirdweb/react");
            
            const walletInstance = inAppWallet();
            await walletInstance.connect({
                client: thirdwebClient,
                strategy: "email",
                email,
                verificationCode,
            });

            // Récupérer l'adresse du wallet
            const account = walletInstance.getAccount();
            const walletAddress = account?.address;

            if (walletAddress) {
                // Sauvegarder dans localStorage
                localStorage.setItem('user', JSON.stringify({ email }));
                localStorage.setItem('company', JSON.stringify({ name: email.split('@')[1] || '' }));
                localStorage.setItem('walletAddress', walletAddress);

                setMessage('Login successful!');
                setEmail('');
                setVerificationCode('');
                setIsCodeSent(false);
                setIsConnected(true);
                
                // Appeler onSuccess avec les vraies données
                onSuccess?.({ email, walletAddress });
            } else {
                throw new Error('Failed to get wallet address');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = 'Invalid verification code or connection error. Please try again.';
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

    // Si connecté, afficher le message de succès sans ConnectButton
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
                <div style={{
                    padding: 12,
                    borderRadius: 6,
                    background: '#2e7d32',
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: 14
                }}>
                    Redirecting to your informations & creation story...
                </div>
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
                            disabled={isLoading || !thirdwebClient}
                            style={{
                                width: '100%',
                                padding: 12,
                                background: thirdwebClient ? '#FFD600' : '#666',
                                color: '#000',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 16,
                                fontWeight: 'bold',
                                cursor: (isLoading || !thirdwebClient) ? 'not-allowed' : 'pointer',
                                opacity: (isLoading || !thirdwebClient) ? 0.6 : 1
                            }}
                        >
                            {!thirdwebClient ? 'Initializing...' : isLoading ? 'Sending...' : 'Send verification code'}
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