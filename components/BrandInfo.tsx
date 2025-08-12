import React from 'react';

interface BrandInfoProps {
  companyName: string;
  agencyName?: string;
  userType: 'b2c' | 'agency' | 'individual';
  walletAddress?: string;
}

const BrandInfo: React.FC<BrandInfoProps> = ({ companyName, agencyName, userType, walletAddress }) => {
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (userType === 'individual') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <img 
            src="/individual.svg" 
            alt="Individual Creator" 
            style={{ 
              width: '48px', 
              height: '48px',
              filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
            }} 
          />
          {walletAddress && (
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#FFD600',
              fontFamily: 'monospace',
              letterSpacing: '0.5px',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
            }}>
              {formatWalletAddress(walletAddress)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
      border: '1px solid rgba(255, 215, 0, 0.3)',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '20px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'
    }}>
      {userType === 'agency' && agencyName && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <img 
            src="/company.svg" 
            alt="Agency" 
            style={{ 
              width: '40px', 
              height: '40px',
              filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.5))'
            }} 
          />
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#FFD600',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
          }}>
            Agency: {agencyName}
          </div>
        </div>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <img 
          src="/company.svg" 
          alt="Company" 
          style={{ 
            width: '48px', 
            height: '48px',
            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
          }} 
        />
        <div style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#FFD600',
          textShadow: '0 0 15px rgba(255, 215, 0, 0.6)'
        }}>
          {userType === 'agency' ? `Client: ${companyName}` : companyName}
        </div>
      </div>
    </div>
  );
};

export default BrandInfo; 