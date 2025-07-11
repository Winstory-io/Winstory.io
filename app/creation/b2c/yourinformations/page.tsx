"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

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
    const [company, setCompany] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        const readLocalStorage = () => {
            const companyData = JSON.parse(localStorage.getItem("company") || 'null');
            const userData = JSON.parse(localStorage.getItem("user") || 'null');
            setCompany(companyData?.name || "@company");
            setEmail(userData?.email || "adress logged");
        };
        readLocalStorage();
        window.addEventListener('focus', readLocalStorage);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') readLocalStorage();
        });
        return () => {
            window.removeEventListener('focus', readLocalStorage);
            document.removeEventListener('visibilitychange', readLocalStorage);
        };
    }, [company, email, router]);

    return (
        <ProtectedRoute>
            <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', background: '#000', borderRadius: 24, boxShadow: '0 0 24px #000', padding: '32px 24px 64px 24px', width: 400, maxWidth: '90vw', border: '2px solid #18C964' }}>
                    <CloseIcon onClick={() => router.push('/welcome')} />
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                        <img src="/company.svg" alt="Company" style={{ width: 48, height: 48, marginRight: 12 }} />
                        <span style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>Your informations</span>
                        <img src="/tooltip.svg" alt="Aide" style={{ width: 28, height: 28, marginLeft: 12 }} />
                    </div>
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
                    <GreenArrowButton onClick={() => router.push('/creation/b2c/yourwinstory')} />
                </div>
            </div>
        </ProtectedRoute>
    );
} 