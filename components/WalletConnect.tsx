"use client";

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
    onLoginSuccess?: (data: { email: string, walletAddress: string }) => void;
    onLogout?: () => void;
}

function WalletConnectContent({ isEmailLogin = false, isWalletLogin = false, isBothLogin = false, onLoginSuccess, onLogout }: WalletConnectProps) {
    const [mounted, setMounted] = useState(false);
    const [emailConnected, setEmailConnected] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const account = useActiveAccount();

    // Check email and wallet login state
    useEffect(() => {
        const user = localStorage.getItem("user");
        const walletAddress = localStorage.getItem("walletAddress");
        setEmailConnected(!!user);
        setWalletConnected(!!walletAddress);
    }, []);

    // Listen to storage changes (for logout in other tabs)
    useEffect(() => {
        const handler = () => {
            const user = localStorage.getItem("user");
            const walletAddress = localStorage.getItem("walletAddress");
            setEmailConnected(!!user);
            setWalletConnected(!!walletAddress);
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
        localStorage.removeItem("company");
        localStorage.removeItem("walletAddress");
        setEmailConnected(false);
        setWalletConnected(false);
        if (onLogout) onLogout();
        // For wallet, user should disconnect via widget
    };

    // Handle email login success
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);
    const [pendingWallet, setPendingWallet] = useState<string | null>(null);
    const handleEmailLogin = (data: { email: string; walletAddress: string }) => {
        setEmailConnected(true);
        setPendingEmail(data.email);
        // Si le wallet est déjà connecté, on peut déclencher la synchro immédiatement
        if (account && data.email) {
            localStorage.setItem("user", JSON.stringify({ email: data.email }));
            localStorage.setItem("company", JSON.stringify({ name: data.email.split('@')[1] || '' }));
            localStorage.setItem("walletAddress", account.address);
            setWalletConnected(true);
            if (onLoginSuccess) onLoginSuccess({ email: data.email, walletAddress: account.address });
        }
    };

    // Nouvelle logique de synchronisation email + wallet
    useEffect(() => {
        // Si on a un email ET un wallet, on déclenche la synchro
        if (pendingEmail && account) {
            localStorage.setItem("user", JSON.stringify({ email: pendingEmail }));
            localStorage.setItem("company", JSON.stringify({ name: pendingEmail.split('@')[1] || '' }));
            localStorage.setItem("walletAddress", account.address);
            setWalletConnected(true);
            if (onLoginSuccess) onLoginSuccess({ email: pendingEmail, walletAddress: account.address });
            setPendingEmail(null); // On reset pour éviter les doublons
        }
    }, [pendingEmail, account, onLoginSuccess]);

    // Handle wallet connection (uniquement pour le cas où le wallet est connecté avant l'email)
    useEffect(() => {
        if (account && !walletConnected) {
            setWalletConnected(true);
            localStorage.setItem("walletAddress", account.address);
            // Si on a un pendingEmail, on stocke aussi l'email et le nom d'entreprise
            if (pendingEmail) {
                localStorage.setItem("user", JSON.stringify({ email: pendingEmail }));
                localStorage.setItem("company", JSON.stringify({ name: pendingEmail.split('@')[1] || '' }));
            }
            // Si on a un email déjà stocké, on déclenche la synchro
            const user = JSON.parse(localStorage.getItem("user") || 'null');
            if (user?.email && onLoginSuccess) {
                onLoginSuccess({ email: user.email, walletAddress: account.address });
            }
        } else if (!account && walletConnected) {
            // Si le compte est déconnecté, on nettoie le localStorage
            localStorage.removeItem("walletAddress");
            setWalletConnected(false);
        }
    }, [account, walletConnected, onLoginSuccess, pendingEmail]);

    if (!mounted) {
        return <div>Loading...</div>;
    }

    // Si isBothLogin, proposer les deux options
    if (isBothLogin) {
        // Si connecté (wallet OU email OU account abstraction), afficher le bouton de déconnexion et l'état
        if (account || emailConnected || walletConnected) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    {account && (
                        <ConnectButton client={client} />
                    )}
                    {emailConnected && !account && (
                        <div style={{ color: '#fff', marginBottom: 8 }}>Connected with professional email (Account Abstraction)</div>
                    )}
                    {walletConnected && !account && (
                        <div style={{ color: '#fff', marginBottom: 8 }}>Wallet connected</div>
                    )}
                    <button onClick={handleLogout} style={{ marginTop: 8, padding: '8px 16px', borderRadius: 6, border: 'none', background: '#FFD600', color: '#181818', fontWeight: 600, cursor: 'pointer' }}>
                        Disconnect
                    </button>
                </div>
            );
        }
        // Sinon, proposer le choix
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                <ThirdwebEmailAuth title="Login with professional email (Account Abstraction)" onSuccess={handleEmailLogin} />
                <div style={{ color: '#FFD600', fontWeight: 600, margin: 8 }}>or</div>
                <ConnectButton client={client} />
            </div>
        );
    }

    // Si isEmailLogin uniquement
    if (isEmailLogin) {
        return <ThirdwebEmailAuth title="Login with professional email" onSuccess={handleEmailLogin} />;
    }

    // Appeler onLoginSuccess dès qu'un wallet est connecté en mode isWalletLogin
    useEffect(() => {
        if (isWalletLogin && account && onLoginSuccess) {
            onLoginSuccess({ email: '', walletAddress: account.address });
        }
    }, [isWalletLogin, account, onLoginSuccess]);

    // Si isWalletLogin uniquement
    if (isWalletLogin) {
        return <ConnectButton client={client} />;
    }

    return null;
}

export default function WalletConnect(props: WalletConnectProps) {
    return <WalletConnectContent {...props} />;
}

