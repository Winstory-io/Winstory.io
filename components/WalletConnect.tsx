'use client';

import { ConnectButton } from "thirdweb/react";
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { walletConnect } from "thirdweb/wallets";
import { useEffect, useState } from "react";
import { useWalletConnection } from '../lib/hooks/useWalletConnection';

const client = createThirdwebClient({
    clientId: "4ddc5eed2e073e550a7307845d10f348",
});

interface WalletConnectProps {
    isEmailLogin?: boolean;
    isWalletLogin?: boolean;
    isBothLogin?: boolean;
    onConnect?: (address: string) => void;
    onDisconnect?: () => void;
    className?: string;
    showNetworkSwitch?: boolean;
}

function WalletConnectContent({ 
    isEmailLogin = false, 
    isWalletLogin = false, 
    isBothLogin = false,
    onConnect,
    onDisconnect,
    className = '',
    showNetworkSwitch = false 
}: WalletConnectProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div>Loading...</div>;
    }

    let wallets = [];

    if (isBothLogin) {
        wallets = [
            inAppWallet({
                auth: { options: ["email", "google"] },
            }),
            walletConnect(),
        ];
    } else if (isEmailLogin) {
        wallets = [
            inAppWallet({
                auth: { options: ["email", "google"] },
            }),
        ];
    } else if (isWalletLogin) {
        wallets = [
            walletConnect(),
        ];
    }

    // Si c'est pour le login (avec Thirdweb), utiliser l'ancienne interface
    if (isEmailLogin || isWalletLogin || isBothLogin) {
        return (
            <ConnectButton client={client} wallets={wallets} />
        );
    }

    // Sinon, utiliser la nouvelle architecture pour les composants de récompenses
    const { 
        address, 
        isConnected, 
        isLoading, 
        error, 
        chainId, 
        network,
        connectWallet, 
        disconnectWallet, 
        switchNetwork 
    } = useWalletConnection();

    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            const connectedAddress = await connectWallet();
            if (connectedAddress && onConnect) {
                onConnect(connectedAddress);
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        disconnectWallet();
        if (onDisconnect) {
            onDisconnect();
        }
    };

    const handleNetworkSwitch = async (targetChainId: number) => {
        try {
            await switchNetwork(targetChainId);
        } catch (error) {
            console.error('Failed to switch network:', error);
        }
    };

    if (isLoading) {
        return (
            <div className={`wallet-connect ${className}`}>
                <button 
                    disabled 
                    style={{
                        padding: '12px 24px',
                        borderRadius: 8,
                        border: '2px solid #666',
                        background: 'none',
                        color: '#666',
                        fontWeight: 600,
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <div style={{ width: 16, height: 16, border: '2px solid #666', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Connecting...
                </button>
            </div>
        );
    }

    if (isConnected && address) {
        return (
            <div className={`wallet-connect ${className}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {/* Network Display */}
                <div style={{
                    background: 'rgba(0, 196, 108, 0.1)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #00C46C',
                    fontSize: 12,
                    color: '#00C46C',
                    fontWeight: 600
                }}>
                    {network}
                </div>

                {/* Address Display */}
                <div style={{
                    background: 'rgba(255, 215, 0, 0.1)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #FFD600',
                    fontSize: 12,
                    color: '#FFD600',
                    fontWeight: 600
                }}>
                    {address.slice(0, 6)}...{address.slice(-4)}
                </div>

                {/* Network Switch (if enabled) */}
                {showNetworkSwitch && (
                    <select
                        value={chainId || ''}
                        onChange={(e) => handleNetworkSwitch(Number(e.target.value))}
                        style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid #FFD600',
                            background: 'none',
                            color: '#FFD600',
                            fontSize: 12,
                            fontWeight: 600
                        }}
                    >
                        <option value={1}>Ethereum</option>
                        <option value={137}>Polygon</option>
                        <option value={56}>BNB Chain</option>
                        <option value={43114}>Avalanche</option>
                        <option value={101}>Solana</option>
                    </select>
                )}

                {/* Disconnect Button */}
                <button
                    onClick={handleDisconnect}
                    style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: '1px solid #ff6b6b',
                        background: 'none',
                        color: '#ff6b6b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ff6b6b';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = '#ff6b6b';
                    }}
                >
                    Disconnect
                </button>
            </div>
        );
    }

    return (
        <div className={`wallet-connect ${className}`}>
            <button
                onClick={handleConnect}
                disabled={isConnecting}
                style={{
                    padding: '12px 24px',
                    borderRadius: 8,
                    border: '2px solid #00C46C',
                    background: isConnecting ? '#666' : 'none',
                    color: isConnecting ? '#999' : '#00C46C',
                    fontWeight: 600,
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    if (!isConnecting) {
                        e.currentTarget.style.background = '#00C46C';
                        e.currentTarget.style.color = '#fff';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isConnecting) {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = '#00C46C';
                    }
                }}
            >
                {isConnecting ? (
                    <>
                        <div style={{ width: 16, height: 16, border: '2px solid #999', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        Connecting...
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: 16 }}>🔗</span>
                        Connect Wallet
                    </>
                )}
            </button>

            {error && (
                <div style={{
                    color: '#ff6b6b',
                    fontSize: 12,
                    marginTop: 8,
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}
        </div>
    );
}

export default function WalletConnect(props: WalletConnectProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div>Loading...</div>;
    }

    // Si c'est pour le login (avec Thirdweb), wrapper avec ThirdwebProvider
    if (props.isEmailLogin || props.isWalletLogin || props.isBothLogin) {
        return (
            <ThirdwebProvider>
                <WalletConnectContent {...props} />
            </ThirdwebProvider>
        );
    }

    // Sinon, utiliser directement la nouvelle architecture
    return <WalletConnectContent {...props} />;
}

// CSS for spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

