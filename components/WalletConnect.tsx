'use client';

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { walletConnect } from "thirdweb/wallets";
import { useEffect, useState } from "react";
import ThirdwebEmailAuth from "./ThirdwebEmailAuth";

const client = createThirdwebClient({
    clientId: "4ddc5eed2e073e550a7307845d10f348",
});

interface WalletConnectProps {
    isEmailLogin?: boolean;
    isWalletLogin?: boolean;
    isBothLogin?: boolean;
    onLoginSuccess?: (email: string) => void;
    onLogout?: () => void;
}

function WalletConnectContent({ isEmailLogin = false, isWalletLogin = false, isBothLogin = false, onLoginSuccess, onLogout }: WalletConnectProps) {
    const [mounted, setMounted] = useState(false);
    const [emailConnected, setEmailConnected] = useState(false);
    const account = useActiveAccount();

    // Check email login state
    useEffect(() => {
        const user = localStorage.getItem("user");
        setEmailConnected(!!user);
    }, []);

    // Listen to storage changes (for logout in other tabs)
    useEffect(() => {
        const handler = () => {
            const user = localStorage.getItem("user");
            setEmailConnected(!!user);
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle logout (wallet or email)
    const handleLogout = () => {
        localStorage.removeItem("user");
        setEmailConnected(false);
        if (onLogout) onLogout();
        // For wallet, user should disconnect via widget
    };

    // Handle email login success
    const handleEmailLogin = () => {
        setEmailConnected(true);
        if (onLoginSuccess) onLoginSuccess(""); // email non disponible ici
    };

    if (!mounted) {
        return <div>Loading...</div>;
    }

    // If connected (wallet or email), show disconnect UI
    if (account || emailConnected) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                {account && (
                    <ConnectButton client={client} wallets={[walletConnect()]} />
                )}
                {emailConnected && (
                    <div style={{ color: '#fff', marginBottom: 8 }}>Connecté avec email professionnel</div>
                )}
                <button onClick={handleLogout} style={{ marginTop: 8, padding: '8px 16px', borderRadius: 6, border: 'none', background: '#FFD600', color: '#181818', fontWeight: 600, cursor: 'pointer' }}>
                    Se déconnecter
                </button>
            </div>
        );
    }

    // If not connected, show email login
    if (isEmailLogin || isBothLogin) {
        return <ThirdwebEmailAuth title="Connexion avec email professionnel" onSuccess={handleEmailLogin} />;
    }

    // Optionally, show wallet login if requested
    if (isWalletLogin) {
        return <ConnectButton client={client} wallets={[walletConnect()]} />;
    }

    return null;
}

export default function WalletConnect(props: WalletConnectProps) {
    return (
        <ThirdwebProvider>
            <WalletConnectContent {...props} />
        </ThirdwebProvider>
    );
}

