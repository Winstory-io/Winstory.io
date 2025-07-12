"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { walletConnect } from "thirdweb/wallets";
import { useEffect, useState } from "react";

const client = createThirdwebClient({
    clientId: "4ddc5eed2e073e550a7307845d10f348",
});

interface HackathonWalletConnectProps {
    onLoginSuccess?: (data: { walletAddress: string, chzBalance: string }) => void;
    onLogout?: () => void;
}

function HackathonWalletConnectContent({ onLoginSuccess, onLogout }: HackathonWalletConnectProps) {
    const [mounted, setMounted] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [chzBalance, setChzBalance] = useState<string>('0');
    const [isCheckingBalance, setIsCheckingBalance] = useState(false);
    const [hasMinimumChz, setHasMinimumChz] = useState(false);
    const account = useActiveAccount();

    // Check wallet login state
    useEffect(() => {
        const walletAddress = localStorage.getItem("hackathonWalletAddress");
        setWalletConnected(!!walletAddress);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("hackathonWalletAddress");
        localStorage.removeItem("hackathonChzBalance");
        setWalletConnected(false);
        setChzBalance('0');
        setHasMinimumChz(false);
        if (onLogout) onLogout();
    };

    // Check CHZ balance on Chiliz Spicy Testnet
    const checkChzBalance = async (address: string) => {
        setIsCheckingBalance(true);
        try {
            // Chiliz Spicy Testnet RPC
            const response = await fetch('https://spicy-rpc.chiliz.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_getBalance',
                    params: [address, 'latest'],
                    id: 1
                })
            });

            const data = await response.json();
            if (data.result) {
                // Convert from wei to CHZ (18 decimals)
                const balanceInWei = BigInt(data.result);
                const balanceInChz = Number(balanceInWei) / Math.pow(10, 18);
                const balanceString = balanceInChz.toFixed(2);
                setChzBalance(balanceString);
                
                // Check if user has minimum CHZ (e.g., 1 CHZ)
                const hasMinimum = balanceInChz >= 1;
                setHasMinimumChz(hasMinimum);
                
                // Store balance in localStorage
                localStorage.setItem("hackathonChzBalance", balanceString);
                
                if (hasMinimum && onLoginSuccess) {
                    onLoginSuccess({ walletAddress: address, chzBalance: balanceString });
                }
            }
        } catch (error) {
            console.error('Error checking CHZ balance:', error);
            setChzBalance('0');
            setHasMinimumChz(false);
        } finally {
            setIsCheckingBalance(false);
        }
    };

    // Handle wallet connection
    useEffect(() => {
        if (account && !walletConnected) {
            setWalletConnected(true);
            localStorage.setItem("hackathonWalletAddress", account.address);
            
            // Check CHZ balance
            checkChzBalance(account.address);
        } else if (!account && walletConnected) {
            // If account is disconnected, clean localStorage
            localStorage.removeItem("hackathonWalletAddress");
            localStorage.removeItem("hackathonChzBalance");
            setWalletConnected(false);
            setChzBalance('0');
            setHasMinimumChz(false);
        }
    }, [account, walletConnected]);

    if (!mounted) {
        return <div style={{ color: '#FFD600' }}>Loading...</div>;
    }

    // If wallet is connected and has minimum CHZ
    if (walletConnected && hasMinimumChz) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <ConnectButton client={client} />
                <div style={{ color: '#2eea8b', marginBottom: 8, textAlign: 'center' }}>
                    ✅ Wallet connected<br />
                    CHZ Balance: {chzBalance} CHZ<br />
                    <small style={{ color: '#FFD600' }}>Chiliz Spicy Testnet</small>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        marginTop: 8, 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        border: 'none', 
                        background: '#FF2D2D', 
                        color: '#fff', 
                        fontWeight: 600, 
                        cursor: 'pointer' 
                    }}
                >
                    Disconnect
                </button>
            </div>
        );
    }

    // If wallet is connected but doesn't have minimum CHZ
    if (walletConnected && !hasMinimumChz && !isCheckingBalance) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <ConnectButton client={client} />
                <div style={{ color: '#FF2D2D', marginBottom: 8, textAlign: 'center' }}>
                    ❌ Insufficient CHZ<br />
                    Current Balance: {chzBalance} CHZ<br />
                    Required: Minimum 1 CHZ<br />
                    <small style={{ color: '#FFD600' }}>Please get CHZ from Chiliz Spicy Testnet faucet</small>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        marginTop: 8, 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        border: 'none', 
                        background: '#FF2D2D', 
                        color: '#fff', 
                        fontWeight: 600, 
                        cursor: 'pointer' 
                    }}
                >
                    Disconnect
                </button>
            </div>
        );
    }

    // If checking balance
    if (isCheckingBalance) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <ConnectButton client={client} />
                <div style={{ color: '#FFD600', marginBottom: 8, textAlign: 'center' }}>
                    🔍 Checking CHZ balance...<br />
                    <small>Verifying on Chiliz Spicy Testnet</small>
                </div>
            </div>
        );
    }

    // Default state - wallet not connected
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ 
                background: '#181818', 
                border: '2px solid #FFD600', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 16,
                textAlign: 'center',
                maxWidth: 400
            }}>
                <h3 style={{ color: '#FFD600', marginBottom: 12 }}>Hackathon Authentication</h3>
                <p style={{ color: '#fff', fontSize: 14, marginBottom: 12 }}>
                    Connect your wallet to access hackathon moderation.<br />
                    You need at least 1 CHZ on Chiliz Spicy Testnet.
                </p>
                <div style={{ 
                    background: '#2a2a2a', 
                    padding: 12, 
                    borderRadius: 8, 
                    marginBottom: 12,
                    fontSize: 12,
                    color: '#ccc'
                }}>
                    <strong>Requirements:</strong><br />
                    • Wallet with CHZ tokens<br />
                    • Chiliz Spicy Testnet network<br />
                    • Minimum 1 CHZ balance
                </div>
            </div>
            <ConnectButton client={client} />
        </div>
    );
}

export default function HackathonWalletConnect(props: HackathonWalletConnectProps) {
    return (
        <ThirdwebProvider>
            <HackathonWalletConnectContent {...props} />
        </ThirdwebProvider>
    );
} 