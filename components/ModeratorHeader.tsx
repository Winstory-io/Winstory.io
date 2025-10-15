import { useActiveAccount, ConnectButton } from 'thirdweb/react';
import { createThirdwebClient } from "thirdweb";
import { useState, useEffect, useRef } from 'react';
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
  // Nouveau: compteurs par sous-onglet pour badges
  subTabCounts?: {
    initial: { 'b2c-agencies': number; 'individual-creators': number };
    completion: { 'for-b2c': number; 'for-individuals': number };
  };
}

const ModeratorHeader: React.FC<ModeratorHeaderProps> = ({ 
  activeTab, 
  activeSubTab, 
  onTabChange, 
  onSubTabChange, 
  onIconClick, 
  onBulbClick,
  subTabCounts
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
    if (account) {
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

  const getBadgeCount = (key: string) => {
    if (!subTabCounts) return 0;
    if (key === 'b2c-agencies') return subTabCounts.initial['b2c-agencies'];
    if (key === 'individual-creators') return subTabCounts.initial['individual-creators'];
    if (key === 'for-b2c') return subTabCounts.completion['for-b2c'];
    if (key === 'for-individuals') return subTabCounts.completion['for-individuals'];
    return 0;
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
        {(() => {
          const initialSum = (subTabCounts?.initial['b2c-agencies'] || 0) + (subTabCounts?.initial['individual-creators'] || 0);
          const completionSum = (subTabCounts?.completion['for-b2c'] || 0) + (subTabCounts?.completion['for-individuals'] || 0);
          const initialSubs = [
            { key: 'b2c-agencies', label: 'B2C & Agencies', tooltip: 'Moderate content created by B2C companies and agencies' },
            { key: 'individual-creators', label: 'Individual Creators', tooltip: 'Moderate content created by individual creators' }
          ];
          const completionSubs = [
            { key: 'for-b2c', label: 'For B2C', tooltip: 'Moderate content created by individuals completing campaigns from B2C companies' },
            { key: 'for-individuals', label: 'For Individuals', tooltip: 'Moderate content created by individuals completing campaigns from other individuals' }
          ];
          const mainTab = (label: string, sum: number, isActive: boolean, onClick: () => void) => (
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: isActive ? '#FFD600' : '#665c2e',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: 12,
                background: isActive ? 'rgba(255,214,0,0.08)' : 'transparent',
                borderBottom: isActive ? '3px solid #FFD600' : '3px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
              onClick={onClick}
            >
              {label}
              {sum > 0 && (
                <span style={{ background: '#FFD600', color: '#111', borderRadius: 999, fontSize: 12, fontWeight: 900, padding: '0 10px', lineHeight: '20px', opacity: isActive ? 1 : 0.6 }}>{sum}</span>
              )}
            </span>
          );
          const subItem = (sub: { key: string; label: string; tooltip: string }, targetTab: 'initial' | 'completion') => {
            const isSelected = activeSubTab === sub.key && activeTab === targetTab;
            const count = getBadgeCount(sub.key);
            const isActiveGroup = targetTab === activeTab;
            const itemOpacity = isSelected ? 1 : (isActiveGroup ? 0.75 : 0.6);
            const badgeOpacity = isSelected ? 1 : (isActiveGroup ? 0.75 : 0.6);
            return (
              <span
                key={sub.key}
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: isSelected ? '#FFD600' : '#665c2e',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 12,
                  background: isSelected ? 'rgba(255, 214, 0, 0.08)' : 'transparent',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: itemOpacity
                }}
                onClick={() => {
                  onTabChange(targetTab);
                  onSubTabChange(sub.key);
                }}
                title={sub.tooltip}
              >
                {sub.label}
                {count > 0 && (
                  <span style={{ background: '#FFD600', color: '#111', borderRadius: 999, fontSize: 12, fontWeight: 800, padding: '0 8px', lineHeight: '18px', opacity: badgeOpacity }}>{count}</span>
                )}
              </span>
            );
          };
          return (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 16 }}>
                {/* Initial group */}
                <div style={{ minWidth: 360, opacity: activeTab === 'initial' ? 1 : 0.85 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    {mainTab('Initial Story', initialSum, activeTab === 'initial', () => onTabChange('initial'))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {initialSubs.map((s) => subItem(s, 'initial'))}
                  </div>
                </div>
                {/* Completion group */}
                <div style={{ minWidth: 360, opacity: activeTab === 'completion' ? 1 : 0.85 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    {mainTab('Completion', completionSum, activeTab === 'completion', () => onTabChange('completion'))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {completionSubs.map((s) => subItem(s, 'completion'))}
                  </div>
                </div>
              </div>
        </div>
          );
        })()}
      </div>

      {/* Wallet Address Display with Disconnect Menu */}
      {account && (
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
                  theme="dark"
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