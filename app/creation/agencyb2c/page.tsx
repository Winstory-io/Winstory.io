"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

const AgencyB2CPage = () => {
    const router = useRouter();
    const [agencyName, setAgencyName] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientContact, setClientContact] = useState('');

    const isFormValid = agencyName.trim() !== '' && clientName.trim() !== '' && clientContact.trim() !== '';

    const handleNext = () => {
        if (isFormValid) {
            router.push('/creation/agencyb2c/yourwinstory');
        }
    };
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      padding: '20px',
      fontFamily: 'sans-serif',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '40px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 20px',
      color: '#fff',
    },
    icon: {
      filter: 'invert(1)',
    },
    card: {
      border: '2px solid #ffd700',
      borderRadius: '10px',
      padding: '30px',
      marginBottom: '30px',
      width: '100%',
      maxWidth: '400px',
      backgroundColor: '#1a1a1a',
    },
    label: {
      display: 'block',
      marginBottom: '10px',
      color: '#ffd700',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ffd700',
      backgroundColor: '#000',
      color: '#fff',
      marginBottom: '20px',
      boxSizing: 'border-box',
    },
    addressDisplay: {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #00ff00',
      backgroundColor: '#000',
      color: '#fff',
      marginBottom: '20px',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Image src="/company.svg" alt="briefcase icon" width={40} height={40} style={styles.icon} />
        <h1 style={styles.title}>Your informations 💡</h1>
      </div>

      <div style={styles.card}>
        <label htmlFor="agencyName" style={styles.label}>Your Agency Name</label>
        <input type="text" id="agencyName" placeholder="@agencyname" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} style={styles.input} />

        <label htmlFor="contactEmail" style={styles.label}>Your Contact Email</label>
        <div id="contactEmail" style={styles.addressDisplay}>
          adress logged
        </div>
      </div>

      <div style={styles.card}>
        <label htmlFor="clientName" style={styles.label}>Your B2C Company Client</label>
        <input type="text" id="clientName" placeholder="@companyname" value={clientName} onChange={(e) => setClientName(e.target.value)} style={styles.input} />

        <label htmlFor="clientContact" style={styles.label}>Main Contact B2C Client</label>
        <input type="text" id="clientContact" placeholder="@proemailcompanyname" value={clientContact} onChange={(e) => setClientContact(e.target.value)} style={styles.input} />
      </div>
      <GreenArrowButton onClick={handleNext} disabled={!isFormValid} />
    </div>
  );
};

export default AgencyB2CPage; 