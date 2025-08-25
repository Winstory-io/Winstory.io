"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
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
    const account = useActiveAccount();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (account && onLoginSuccess) {
            onLoginSuccess({ 
                email: '', 
                walletAddress: account.address 
            });
        }
    }, [account, onLoginSuccess]);

    if (!mounted) {
        return <div>Loading...</div>;
    }

    // Si c'est uniquement pour l'email login (B2C flow)
    if (isEmailLogin) {
        return <ThirdwebEmailAuth title="Login with professional email" onSuccess={onLoginSuccess} />;
    }

    // Pour les autres cas (wallet login ou both login)
    if (isBothLogin || isWalletLogin) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ConnectButton 
                    client={client}
                    theme="dark"
                />
            </div>
        );
    }

    return null;
}

export default function WalletConnect(props: WalletConnectProps) {
    return <WalletConnectContent {...props} />;
}

