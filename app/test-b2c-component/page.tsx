"use client";

import React, { useState } from 'react';
import B2CVerification from '@/components/B2CVerification';

export default function TestB2CComponent() {
    const [showComponent, setShowComponent] = useState(false);
    const [testEmail, setTestEmail] = useState('test@company.com');
    const [testCompany, setTestCompany] = useState('Test Company');

    const handleVerificationSuccess = () => {
        alert('B2C Verification successful!');
        setShowComponent(false);
    };

    const handleBack = () => {
        setShowComponent(false);
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#000', 
            color: '#fff', 
            padding: '20px',
            fontFamily: 'Inter, sans-serif'
        }}>
            <h1 style={{ 
                color: '#FFD600', 
                textAlign: 'center', 
                marginBottom: '40px' 
            }}>
                Test B2C Verification Component
            </h1>

            {!showComponent ? (
                <div style={{
                    maxWidth: 500,
                    margin: '0 auto',
                    background: '#181818',
                    border: '2px solid #FFD600',
                    borderRadius: 12,
                    padding: 24
                }}>
                    <h3 style={{ color: '#FFD600', marginBottom: 20 }}>
                        Test Configuration
                    </h3>
                    
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, color: '#ccc' }}>
                            Company Name:
                        </label>
                        <input
                            type="text"
                            value={testCompany}
                            onChange={(e) => setTestCompany(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 6,
                                border: '2px solid #FFD600',
                                background: 'none',
                                color: '#FFD600',
                                fontSize: 16
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, color: '#ccc' }}>
                            Contact Email:
                        </label>
                        <input
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 12,
                                borderRadius: 6,
                                border: '2px solid #FFD600',
                                background: 'none',
                                color: '#FFD600',
                                fontSize: 16
                            }}
                        />
                    </div>

                    <button
                        onClick={() => setShowComponent(true)}
                        style={{
                            width: '100%',
                            padding: 12,
                            background: '#FFD600',
                            color: '#000',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 16,
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Test B2C Verification
                    </button>
                </div>
            ) : (
                <B2CVerification
                    b2cContactEmail={testEmail}
                    b2cCompanyName={testCompany}
                    onVerificationSuccess={handleVerificationSuccess}
                    onBack={handleBack}
                />
            )}

            <div style={{
                marginTop: 40,
                textAlign: 'center',
                color: '#ccc',
                fontSize: 14
            }}>
                <p>This page tests the B2C Verification component with Thirdweb authentication.</p>
                <p>The verification code will be sent to the specified email address.</p>
            </div>
        </div>
    );
} 