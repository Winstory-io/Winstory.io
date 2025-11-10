"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [verificationSucceeded, setVerificationSucceeded] = useState(false);

    useEffect(() => {
        // Gate: require agency login first
        const userData = JSON.parse(localStorage.getItem("user") || 'null');
        if (!userData?.email) {
            router.replace('/creation/agencyb2c/login');
            return;
        }

        // Always start fresh on this step: clear any previous B2C state
        localStorage.removeItem('b2cClient');
        localStorage.removeItem('agencyB2CContext');

        const companyData = JSON.parse(localStorage.getItem("company") || 'null');
        setAgencyEmail(userData.email);
        const domain = userData.email.split('@')[1];
        setAgencyName(`@${domain}`);

        if (companyData?.name) {
            setAgencyName(`@${companyData.name}`);
        }

        // Reset form fields explicitly
        setB2cCompanyName('');
        setB2cContactEmail('');
        setVerificationCode('');
        setIsCodeSent(false);
        setMessage('');
        setVerificationSucceeded(false);
    }, [router]);

    // Redirect only after a fresh verification has just succeeded
    useEffect(() => {
        if (verificationSucceeded && !isRedirecting) {
            setIsRedirecting(true);
            // Save combined info for the next steps
            const combined = {
                agency: { name: agencyName, email: agencyEmail },
                b2c: { companyName: b2cCompanyName, contactEmail: b2cContactEmail, verified: true }
            };
            localStorage.setItem('agencyB2CContext', JSON.stringify(combined));
            localStorage.setItem('b2cClient', JSON.stringify(combined.b2c));
            setTimeout(() => {
                router.push('/creation/agencyb2c/yourwinstory');
            }, 800);
        }
    }, [verificationSucceeded, isRedirecting, router, agencyName, agencyEmail, b2cCompanyName, b2cContactEmail]);

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
                setMessage("Verification code sent successfully!");
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
                // Mark fresh success (will trigger redirect)
                setVerificationSucceeded(true);
            } else {
                setMessage(data.message || "Incorrect verification code");
            }
        } catch (error) {
            setMessage("Error verifying code");
        } finally {
            setIsVerifying(false);
        }
    };

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
                            background: '#181818', 
                            color: '#fff', 
                            padding: 32, 
                            borderRadius: 16, 
                            maxWidth: 500, 
                            maxHeight: '80vh', 
                            overflowY: 'auto', 
                            position: 'relative',
                            border: '2px solid #FFD600'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CloseIcon onClick={() => setShowTooltip(false)} />
                        <h2 style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 16 }}>B2C Client Verification</h2>
                        <div style={{ fontSize: 16, lineHeight: 1.6 }}>
                            <p style={{ marginBottom: 12 }}>
                                <strong>Purpose:</strong> Verify that you have permission to create campaigns on behalf of your B2C client.
                            </p>
                            <p style={{ marginBottom: 12 }}>
                                <strong>Process:</strong>
                            </p>
                            <ul style={{ marginLeft: 20, marginBottom: 16 }}>
                                <li>Enter the B2C client's company name</li>
                                <li>Provide the client's professional email address</li>
                                <li>Send verification code to the client</li>
                                <li>Client enters the code to confirm authorization</li>
                            </ul>
                            <p style={{ marginBottom: 12 }}>
                                <strong>Requirements:</strong>
                            </p>
                            <ul style={{ marginLeft: 20 }}>
                                <li>Professional email address (no personal domains like Gmail)</li>
                                <li>Client must have access to the email address</li>
                                <li>Client must enter the verification code within the time limit</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Agency Information - Green Card (Authenticated) */}
            <div style={{ 
                maxWidth: 500, 
                width: '90vw', 
                background: '#0f2818', 
                borderRadius: 16, 
                padding: 24, 
                border: '2px solid #00C46C',
                marginBottom: 24
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ color: '#00C46C', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                            Agency:
                        </h3>
                        <div style={{ color: '#00C46C', fontSize: 16, fontWeight: 600 }}>
                            {agencyName}
                        </div>
                        <div style={{ color: '#00C46C', fontSize: 14, opacity: 0.8, marginTop: 4 }}>
                            {agencyEmail}
                        </div>
                    </div>
                    <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%', 
                        background: '#00C46C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* B2C Client Information - Yellow Card (To be verified) */}
            <div style={{ 
                maxWidth: 500, 
                width: '90vw', 
                background: '#2a2416', 
                borderRadius: 16, 
                padding: 32, 
                border: '2px solid #FFD600',
                marginBottom: 24
            }}>
                <h2 style={{ color: '#FFD600', fontWeight: 700, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>
                    B2C Client Information
                </h2>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                        B2C Client Company Name
                    </label>
                    <input
                        type="text"
                        value={b2cCompanyName}
                        onChange={(e) => setB2cCompanyName(e.target.value)}
                        placeholder="Company name"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 6,
                            border: '2px solid #FFD600',
                            background: 'none',
                            color: '#FFD600',
                            fontSize: 16,
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', color: '#FFD600', fontWeight: 600, marginBottom: 8 }}>
                        B2C Client Contact Email
                    </label>
                    <input
                        type="email"
                        value={b2cContactEmail}
                        onChange={(e) => setB2cContactEmail(e.target.value)}
                        placeholder="client@company.com"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: 6,
                            border: '2px solid #FFD600',
                            background: 'none',
                            color: '#FFD600',
                            fontSize: 16,
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

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
                                marginBottom: 8,
                                boxSizing: 'border-box',
                                textAlign: 'center',
                                letterSpacing: 2
                            }}
                        />
                        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 16, textAlign: 'center' }}>
                            Ask your B2C client for the code they received by email.
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => {
                                    setIsCodeSent(false);
                                    setVerificationCode('');
                                    setMessage('');
                                    setVerificationSucceeded(false);
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

            {/* Message Display */}
            {message && (
                <div style={{
                    maxWidth: 500,
                    width: '90vw',
                    background: message.includes('successful') ? '#173c2a' : '#3c1717',
                    border: `2px solid ${message.includes('successful') ? '#18C964' : '#FF2D2D'}`,
                    color: message.includes('successful') ? '#18C964' : '#FF2D2D',
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center',
                    fontWeight: 700,
                    marginBottom: 24
                }}>
                    {message}
                </div>
            )}

            {/* Continue Button */}
            <button
                onClick={() => router.push('/welcome')}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF2D2D',
                    cursor: 'pointer',
                    marginBottom: 24
                }}
            >
                Cancel
            </button>
        </div>
    );
} 