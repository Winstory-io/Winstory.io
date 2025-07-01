'use client';

import { ConnectButton } from "thirdweb/react";
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";
import { walletConnect } from "thirdweb/wallets";
import { useEffect, useState } from "react";

const client = createThirdwebClient({
    clientId: "4ddc5eed2e073e550a7307845d10f348",
});

interface WalletConnectProps {
    isEmailLogin?: boolean;
    isWalletLogin?: boolean;
    isBothLogin?: boolean;
}

function WalletConnectContent({ isEmailLogin = false, isWalletLogin = false, isBothLogin = false }: WalletConnectProps) {
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

    return (
        <ConnectButton client={client} wallets={wallets} />
    );
}

export default function WalletConnect({ isEmailLogin = false, isWalletLogin = false, isBothLogin = false }: WalletConnectProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div>Loading...</div>;
    }

    return (
        <ThirdwebProvider>
            <WalletConnectContent isEmailLogin={isEmailLogin} isWalletLogin={isWalletLogin} isBothLogin={isBothLogin} />
        </ThirdwebProvider>
    );
}

