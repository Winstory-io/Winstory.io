'use client';

import { ConnectButton } from "thirdweb/react";
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
    clientId: "4ddc5eed2e073e550a7307845d10f348",
});

const wallets = [
    inAppWallet({
        auth: { options: ["email", "google"] },
        // imag: {
        //     name: "Winstory",
        //     image: {
        //         src: "/logo.svg",
        //         width: 100,
        //         height: 100,
        //     },
        // },
        // executionMode: {
        //     mode: "EIP7702",
        //     sponsorGas: true,
        // },
    }),
];

function WalletConnectContent() {
    return (
        <ConnectButton client={client} wallets={wallets} />
    );
}

export default function WalletConnect() {
    return (
        <ThirdwebProvider>
            <WalletConnectContent />
        </ThirdwebProvider>
    );
}
