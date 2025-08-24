"use client";

import React, { useState } from 'react';
import { preAuthenticate, inAppWallet } from "thirdweb/wallets/in-app";
import { useConnect } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";

interface B2CVerificationProps {
    b2cContactEmail: string;
    b2cCompanyName: string;
    onVerificationSuccess: () => void;
    onBack: () => void;
}

export default function B2CVerification({ 
    b2cContactEmail, 
    b2cCompanyName, 
    onVerificationSuccess, 
    onBack 
}: B2CVerificationProps) {
    const { connect } = useConnect();
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);

    const sendCode = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            await preAuthenticate({
                client,
                strategy: "email",
                email: b2cContactEmail,
            });

            setIsCodeSent(true);
            setMessage('Verification code sent! Check the B2C client\'s email.');
        } catch (error) {
            console.error('Error sending code:', error);
            setMessage('Error sending verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyCode = async () => {
        if (!verificationCode.trim()) {
            setMessage('Please enter the verification code');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            await connect(async () => {
                const wallet = inAppWallet();
                await wallet.connect({
                    client,
                    strategy: "email",
                    email: b2cContactEmail,
                    verificationCode,
                });
                return wallet;
            });

            setMessage('Verification successful! B2C client confirmed.');
            
            // Sauvegarder les informations validées
            localStorage.setItem("b2cClient", JSON.stringify({
                companyName: b2cCompanyName,
                contactEmail: b2cContactEmail,
                verified: true
            }));

            // Notifier le succès
            setTimeout(() => {
                onVerificationSuccess();
            }, 1000);

        } catch (error) {
            console.error('Error verifying code:', error);
            setMessage('Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            background: '#181818',
            border: '2px solid #FFD600',
            borderRadius: 12,
            padding: 24,
            color: '#fff',
            maxWidth: 500,
            width: '100%',
            margin: '20px auto'
        }}>
            <h3 style={{
                color: '#FFD600',
                marginBottom: 20,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold'
            }}>
                B2C Client Verification
            </h3>

            <div style={{
                background: '#2a2a2a',
                padding: 16,
                borderRadius: 8,
                marginBottom: 20,
                border: '1px solid #444'
            }}>
                <p style={{ margin: '0 0 8px 0', color: '#ccc' }}>
                    <strong>Company:</strong> {b2cCompanyName}
                </p>
                <p style={{ margin: 0, color: '#ccc' }}>
                    <strong>Contact Email:</strong> {b2cContactEmail}
                </p>
            </div>

            {message && (
                <div style={{
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 16,
                    background: message.includes('successful') ? '#2e7d32' : '#d32f2f',
                    color: '#fff',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}

            {!isCodeSent ? (
                <div>
                    <p style={{
                        fontSize: 14,
                        color: '#ccc',
                        marginBottom: 16,
                        textAlign: 'center'
                    }}>
                        Click the button below to send a verification code to the B2C client.
                    </p>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={onBack}
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
                            onClick={sendCode}
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
                            {isLoading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p style={{
                        fontSize: 14,
                        color: '#00C46C',
                        marginBottom: 16,
                        textAlign: 'center',
                        fontWeight: 600
                    }}>
                        Code sent to: <strong>{b2cContactEmail}</strong>
                    </p>

                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter verification code"
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 6,
                            border: '2px solid #FFD600',
                            background: 'none',
                            color: '#FFD600',
                            fontSize: 18,
                            marginBottom: 16,
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            letterSpacing: 2
                        }}
                        required
                    />

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => {
                                setIsCodeSent(false);
                                setVerificationCode('');
                                setMessage('');
                            }}
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
                            onClick={verifyCode}
                            disabled={isLoading || !verificationCode.trim()}
                            style={{
                                flex: 1,
                                padding: 12,
                                background: '#FFD600',
                                color: '#000',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 16,
                                fontWeight: 'bold',
                                cursor: isLoading || !verificationCode.trim() ? 'not-allowed' : 'pointer',
                                opacity: isLoading || !verificationCode.trim() ? 0.6 : 1
                            }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 