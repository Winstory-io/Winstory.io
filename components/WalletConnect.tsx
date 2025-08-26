"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { useEffect, useState } from "react";

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

function WalletConnectContent({ isEmailLogin = false, isWalletLogin = false, isBothLogin = false, onLoginSuccess }: WalletConnectProps) {
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
        return <div />;
    }

    // Unifier l'expérience: un seul bouton Thirdweb avec wallets web3 et méthodes in-app par défaut
    if (isBothLogin || isWalletLogin || isEmailLogin) {
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

