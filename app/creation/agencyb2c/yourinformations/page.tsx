"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const GreenArrowButton = ({ onClick, disabled }: { onClick: () => void, disabled: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        aria-label="Next"
        style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 0,
            outline: 'none',
            opacity: disabled ? 0.6 : 1,
            transform: 'rotate(270deg)'
        }}
    >
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" fill="#18C964"/>
            <path d="M16 22L24 30L32 22" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </button>
);

const CloseIcon = ({ onClick }: { onClick: () => void }) => (
    <svg onClick={onClick} width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
        <line x1="10" y1="10" x2="22" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
        <line x1="22" y1="10" x2="10" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

export default function AgencyB2CYourInformations() {
    const router = useRouter();
    const [agencyName, setAgencyName] = useState<string>("");
    const [agencyEmail, setAgencyEmail] = useState<string>("");
    const [b2cCompanyName, setB2cCompanyName] = useState<string>("");
    const [b2cContactEmail, setB2cContactEmail] = useState<string>("");
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [message, setMessage] = useState("");
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        // Récupérer les informations de l'agence depuis le localStorage
        const userData = JSON.parse(localStorage.getItem("user") || 'null');
        const companyData = JSON.parse(localStorage.getItem("company") || 'null');
        
        if (userData?.email) {
            setAgencyEmail(userData.email);
            // Extraire le nom de domaine de l'email pour l'agence
            const domain = userData.email.split('@')[1];
            setAgencyName(`@${domain}`);
        }
        
        if (companyData?.name) {
            setAgencyName(`@${companyData.name}`);
        }
    }, []);

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

    const sendVerificationCode = async () => {
        if (!b2cContactEmail) {
            setMessage("Please enter the B2C client contact email");
            return;
        }

        const validation = validateProfessionalEmail(b2cContactEmail);
        if (!validation.valid) {
            setMessage(validation.message);
            return;
        }

        setIsVerifying(true);
        setMessage("");

        try {
            const response = await fetch('/api/auth/b2c-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: b2cContactEmail,
                    action: 'send'
                }),
            });

            const data = await response.json();

            if (data.success) {
                setIsCodeSent(true);
                setMessage("Verification code sent! Check the B2C client's email.");
            } else {
                setMessage(data.message || "Error sending verification code");
            }
        } catch (error) {
            setMessage("Error sending verification code");
        } finally {
            setIsVerifying(false);
        }
    };

    const verifyCode = async () => {
        if (!verificationCode) {
            setMessage("Please enter the verification code");
            return;
        }

        setIsVerifying(true);
        setMessage("");

        try {
            const response = await fetch('/api/auth/b2c-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: b2cContactEmail,
                    action: 'verify',
                    verificationCode: verificationCode
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage("Verification successful! B2C client confirmed.");
                // Sauvegarder les informations validées
                localStorage.setItem("b2cClient", JSON.stringify({
                    companyName: b2cCompanyName,
                    contactEmail: b2cContactEmail,
                    verified: true
                }));
            } else {
                setMessage(data.message || "Incorrect verification code");
            }
        } catch (error) {
            setMessage("Error verifying code");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleNext = () => {
        if (b2cCompanyName && b2cContactEmail && isCodeSent && message.includes("successful")) {
            router.push('/creation/agencyb2c/yourwinstory');
        }
    };

    const isFormValid = b2cCompanyName.trim() !== '' && 
                       b2cContactEmail.trim() !== '' && 
                       isCodeSent && 
                       message.includes("successful");

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#000', 
            color: '#fff', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            position: 'relative', 
            paddingTop: 48 
        }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '100%', 
                maxWidth: 600, 
                margin: '0 auto 24px auto', 
                position: 'relative' 
            }}>
                <Image src="/company.svg" alt="Company" width={40} height={40} style={{ marginRight: 18 }} />
                <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Your informations</span>
                <button 
                    onClick={() => setShowTooltip(true)} 
                    style={{ background: 'none', border: 'none', marginLeft: 18, cursor: 'pointer', padding: 0 }} 
                    aria-label="Help"
                >
                    <Image src="/tooltip.svg" alt="Aide" width={40} height={40} />
                </button>
            </div>

            {/* Tooltip Popup */}
            {showTooltip && (
                <div
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        width: '100vw', 
                        height: '100vh', 
                        background: 'rgba(0,0,0,0.7)', 
                        zIndex: 3000, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}
                    onClick={() => setShowTooltip(false)}
                >
                    <div
                        style={{
                            position: 'relative',
                            maxWidth: 600,
                            width: '90vw',
                            background: '#000',
                            border: '4px solid #FFD600',
                            borderRadius: 24,
                            padding: '32px 24px 28px 24px',
                            boxShadow: '0 0 32px #000',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            color: '#FFD600',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowTooltip(false)}
                            style={{
                                position: 'absolute',
                                top: 18,
                                right: 18,
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                zIndex: 10,
                            }}
                            aria-label="Close"
                        >
                            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
                                <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </button>
                        <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>
                            Agency B2C Client Information
                        </h2>
                        <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 18, textAlign: 'center' }}>
                            Enter your B2C client company information. The main contact will receive a verification code by email to validate the process.
                        </div>
                    </div>
                </div>
            )}

            {/* Agency Information Section (Non-modifiable) */}
            <div style={{ 
                position: 'relative', 
                background: '#000', 
                borderRadius: 24, 
                boxShadow: '0 0 24px #000', 
                padding: '32px 24px 32px 24px', 
                width: 400, 
                maxWidth: '90vw', 
                border: '2px solid #fff', 
                marginBottom: 24 
            }}>
                <CloseIcon onClick={() => router.push('/welcome')} />
                <div style={{ marginBottom: 24 }}>
                    <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your Agency Name</div>
                    <div style={{ 
                        border: '2px solid #FFD600', 
                        borderRadius: 6, 
                        padding: '12px 0', 
                        textAlign: 'center', 
                        fontStyle: 'italic', 
                        fontSize: 18, 
                        color: '#fff', 
                        background: 'none', 
                        marginBottom: 24 
                    }}>
                        {agencyName}
                    </div>
                    <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your Contact Email</div>
                    <div style={{ 
                        border: '2px solid #00C46C', 
                        borderRadius: 6, 
                        padding: '12px 0', 
                        textAlign: 'center', 
                        fontStyle: 'italic', 
                        fontSize: 18, 
                        color: '#fff', 
                        background: 'none' 
                    }}>
                        {agencyEmail}
                    </div>
                </div>
            </div>

            {/* B2C Client Information Section (Modifiable) */}
            <div style={{ 
                position: 'relative', 
                background: '#000', 
                borderRadius: 24, 
                boxShadow: '0 0 24px #000', 
                padding: '32px 24px 32px 24px', 
                width: 400, 
                maxWidth: '90vw', 
                border: '2px solid #fff', 
                marginBottom: 24 
            }}>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Your B2C Company Client</div>
                    <input
                        type="text"
                        value={b2cCompanyName}
                        onChange={(e) => setB2cCompanyName(e.target.value)}
                        placeholder="@companyname"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 6,
                            border: '2px solid #FFD600',
                            background: 'none',
                            color: '#FFD600',
                            fontSize: 18,
                            marginBottom: 24,
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            fontStyle: 'italic'
                        }}
                    />
                    <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Main Contact B2C Client</div>
                    <input
                        type="email"
                        value={b2cContactEmail}
                        onChange={(e) => setB2cContactEmail(e.target.value)}
                        placeholder="@proemailcompanyname"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 6,
                            border: '2px solid #FFD600',
                            background: 'none',
                            color: '#FFD600',
                            fontSize: 18,
                            marginBottom: 24,
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            fontStyle: 'italic'
                        }}
                    />
                    
                    {!isCodeSent ? (
                        <button
                            onClick={sendVerificationCode}
                            disabled={isVerifying || !b2cContactEmail}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#FFD600',
                                color: '#000',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 16,
                                fontWeight: 'bold',
                                cursor: isVerifying || !b2cContactEmail ? 'not-allowed' : 'pointer',
                                opacity: isVerifying || !b2cContactEmail ? 0.6 : 1
                            }}
                        >
                            {isVerifying ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    ) : (
                        <div>
                            <div style={{ color: '#00C46C', fontWeight: 600, fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
                                Code sent to: {b2cContactEmail}
                            </div>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Verification code"
                                style={{
                                    width: '100%',
                                    padding: '12px',
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
                            />
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    onClick={() => {
                                        setIsCodeSent(false);
                                        setVerificationCode('');
                                        setMessage('');
                                    }}
                                    disabled={isVerifying}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'none',
                                        color: '#FFD600',
                                        border: '2px solid #FFD600',
                                        borderRadius: 6,
                                        fontSize: 16,
                                        cursor: isVerifying ? 'not-allowed' : 'pointer',
                                        opacity: isVerifying ? 0.6 : 1
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={verifyCode}
                                    disabled={isVerifying || !verificationCode}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#FFD600',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        cursor: isVerifying || !verificationCode ? 'not-allowed' : 'pointer',
                                        opacity: isVerifying || !verificationCode ? 0.6 : 1
                                    }}
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div style={{
                    padding: 12,
                    borderRadius: 6,
                    marginBottom: 16,
                    background: message.includes('sent') || message.includes('successful') ? '#2e7d32' : '#d32f2f',
                    color: '#fff',
                    textAlign: 'center',
                    maxWidth: 400,
                    width: '90vw'
                }}>
                    {message}
                </div>
            )}

            <GreenArrowButton onClick={handleNext} disabled={!isFormValid} />
        </div>
    );
} 