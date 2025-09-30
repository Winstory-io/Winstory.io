"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAccessibilityFix } from '@/lib/hooks/useAccessibilityFix';

const GreenArrowButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        aria-label="Next"
        style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
            position: 'absolute',
            right: 32,
            bottom: 32,
        }}
    >
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="18" fill="#18C964" />
            <path d="M16 22L24 30L32 22" stroke="#111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </button>
);

const CloseIcon = ({ onClick }: { onClick: () => void }) => (
    <svg onClick={onClick} width={32} height={32} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', position: 'absolute', top: 24, right: 24, zIndex: 100 }}>
        <line x1="10" y1="10" x2="22" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
        <line x1="22" y1="10" x2="10" y2="22" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
    </svg>
);

export default function YourInformationsB2C() {
    const router = useRouter();
    const { suppressWarning } = useAccessibilityFix();
    const [company, setCompany] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const readLocalStorage = () => {
            const companyData = JSON.parse(localStorage.getItem("company") || 'null');
            const userData = JSON.parse(localStorage.getItem("user") || 'null');
            setCompany(companyData?.name || "@company");
            setEmail(userData?.email || "adress logged");
        };
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') readLocalStorage();
        };
        readLocalStorage();
        window.addEventListener('focus', readLocalStorage);
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            window.removeEventListener('focus', readLocalStorage);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);

    return (
        <ProtectedRoute>
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', paddingTop: 48 }}>
                {/* Header en haut de la page */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 600, margin: '0 auto 24px auto', position: 'relative' }}>
                    <img src="/company.svg" alt="Company" style={{ width: 96, height: 96, marginRight: 18 }} />
                    <span style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Your informations</span>
                    <button onClick={() => setShowTooltip(true)} style={{ background: 'none', border: 'none', marginLeft: 18, cursor: 'pointer', padding: 0 }} aria-label="Help">
                        <img src="/tooltip.svg" alt="Aide" style={{ width: 40, height: 40 }} />
                    </button>
                </div>
                {/* Pop-up tooltip */}
                {showTooltip && (
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                            <h2 style={{ color: '#FFD600', fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 18, letterSpacing: 1 }}>Your informations</h2>
                            <div style={{ color: '#fff', fontSize: 16, fontWeight: 400, marginBottom: 18, textAlign: 'center' }}>
                                This page lets you check and confirm your company and contact details before launching your campaign.<br /><br />
                                Make sure your information is correct to ensure a smooth campaign setup.
                            </div>
                        </div>
                    </div>
                )}
                {/* Encart principal */}
                <div style={{ position: 'relative', background: '#000', borderRadius: 24, boxShadow: '0 0 24px #000', padding: '32px 24px 64px 24px', width: 400, maxWidth: '90vw', border: '2px solid #18C964', marginBottom: 32 }}>
                    <CloseIcon onClick={() => router.push('/welcome')} />
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Company Name</div>
                        <div style={{ border: '2px solid #18C964', borderRadius: 6, padding: '12px 0', textAlign: 'center', fontStyle: 'italic', fontSize: 18, color: '#fff', background: 'none', marginBottom: 24 }}>
                            {company}
                        </div>
                        <div style={{ color: '#FFD600', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Contact Email</div>
                        <div style={{ border: '2px solid #18C964', borderRadius: 6, padding: '12px 0', textAlign: 'center', fontStyle: 'italic', fontSize: 18, color: '#fff', background: 'none' }}>
                            {email}
                        </div>
                    </div>
                </div>
                {/* Flèche verte à l'extérieur en bas à droite de l'encart */}
                <div style={{ position: 'relative', width: 400, maxWidth: '90vw', height: 0 }}>
                    <div style={{ position: 'absolute', right: -32, bottom: -64, zIndex: 10 }}>
                        <GreenArrowButton onClick={() => router.push('/creation/b2c/yourwinstory')} />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
