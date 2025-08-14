import React, { useState, useRef, useEffect } from 'react';
import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { useRouter } from 'next/navigation';

const client = createThirdwebClient({
  clientId: "4ddc5eed2e073e550a7307845d10f348",
});

// Composant CloseButton réutilisable
export const CloseButton: React.FC = () => {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.push('/welcome')}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 0, 0, 0.2)';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M18 6L6 18M6 6L18 18" 
          stroke="#FF0000" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

interface ModeratorHeaderProps {
  activeTab: 'initial' | 'completion';
  activeSubTab: string;
  onTabChange: (tab: 'initial' | 'completion') => void;
  onSubTabChange: (subTab: string) => void;
  onIconClick: () => void;
  onBulbClick: () => void;
}

const ModeratorHeader: React.FC<ModeratorHeaderProps> = ({ 
  activeTab, 
  activeSubTab, 
  onTabChange, 
  onSubTabChange, 
  onIconClick, 
  onBulbClick 
}) => {
  const router = useRouter();
  const account = useActiveAccount();
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const [isForceDisconnected, setIsForceDisconnected] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleForceDisconnect = () => {
    setIsForceDisconnected(true);
    setShowDisconnectMenu(false);
    router.push('/welcome');
  };

  const toggleMenu = () => {
    setShowDisconnectMenu(!showDisconnectMenu);
  };

  // Reset disconnect state if a new account connects
  useEffect(() => {
    if (account && account.address) {
      setIsForceDisconnected(false);
    }
  }, [account]);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDisconnectMenu(false);
      }
    };
    if (showDisconnectMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDisconnectMenu]);

  const getSubTabs = () => {
    if (activeTab === 'initial') {
      return [
        { 
          key: 'b2c-agencies', 
          label: 'B2C & Agencies',
          tooltip: 'Moderate content created by B2C companies and agencies'
        },
        { 
          key: 'individual-creators', 
          label: 'Individual Creators',
          tooltip: 'Moderate content created by individual creators'
        }
      ];
    } else {
      return [
        { 
          key: 'for-b2c', 
          label: 'For B2C',
          tooltip: 'Moderate content created by individuals completing campaigns from B2C companies'
        },
        { 
          key: 'for-individuals', 
          label: 'For Individuals',
          tooltip: 'Moderate content created by individuals completing campaigns from other individuals'
        }
      ];
    }
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 1rem 1rem 1rem', background: '#000', color: '#FFD600', borderBottom: '2px solid #FFD600', position: 'relative', zIndex: 10
    }}>
      {/* Croix rouge fixe en haut à droite */}
      <CloseButton />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onIconClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <img src="/moderation.svg" alt="Moderation" style={{ width: 120, height: 120, borderRadius: '50%', marginTop: '20px' }} />
        </button>
      </div>
      
      <div style={{ flex: 1, textAlign: 'center', marginLeft: '-80px' }}>
        <span style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: 1 }}>
          Moderate{' '}
          <img 
            src="/tooltip.svg" 
            alt="tooltip" 
            style={{ 
              cursor: 'pointer', 
              width: '24px', 
              height: '24px', 
              verticalAlign: 'middle',
              marginLeft: '8px'
            }} 
            onClick={onBulbClick}
          />
        </span>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 32 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: activeTab === 'initial' ? '#FFD600' : '#665c2e',
              borderBottom: activeTab === 'initial' ? '3px solid #FFD600' : 'none',
              cursor: 'pointer',
              marginRight: 16
            }}
            onClick={() => onTabChange('initial')}
          >
            Initial Story
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: activeTab === 'completion' ? '#FFD600' : '#665c2e',
              borderBottom: activeTab === 'completion' ? '3px solid #FFD600' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => onTabChange('completion')}
          >
            Completion
          </span>
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 16 }}>
          {getSubTabs().map((subTab) => (
            <span
              key={subTab.key}
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: activeSubTab === subTab.key ? '#FFD600' : '#665c2e',
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: '12px',
                background: activeSubTab === subTab.key ? 'rgba(255, 214, 0, 0.1)' : 'transparent',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onClick={() => onSubTabChange(subTab.key)}
              title={subTab.tooltip}
            >
              {subTab.label}
            </span>
          ))}
        </div>
      </div>

      {/* Wallet Address Display with Disconnect Menu */}
      {account && account.address && (
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={toggleMenu}
            style={{
              background: showDisconnectMenu ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 255, 0, 0.1)',
              border: '2px solid #00FF00',
              borderRadius: '20px',
              padding: '8px 16px',
              color: '#00FF00',
              fontWeight: 700,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              background: '#00FF00',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            {truncateAddress(account.address)}
            <span style={{ 
              fontSize: '12px', 
              transition: 'transform 0.3s ease',
              transform: showDisconnectMenu ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </button>
          
          {/* Disconnect Menu */}
          {showDisconnectMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                background: 'rgba(0, 0, 0, 0.95)',
                border: '2px solid #00FF00',
                borderRadius: '12px',
                padding: '8px 0',
                minWidth: '200px',
                zIndex: 1000,
                boxShadow: '0 4px 20px rgba(0, 255, 0, 0.3)'
              }}
            >
              <div style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#00FF00',
                textAlign: 'center',
                borderBottom: '1px solid rgba(0, 255, 0, 0.3)',
                marginBottom: '8px'
              }}>
                Connected
              </div>
              <div style={{ padding: '0 8px' }}>
                <ConnectButton 
                  client={client}
                  onDisconnect={handleForceDisconnect}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default ModeratorHeader;

// Styles CSS pour l'animation de pulsation
const styles = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

// Injecter les styles dans le head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
} 