import { NextRequest, NextResponse } from 'next/server';
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { preAuthenticate } from "thirdweb/wallets/in-app";

const client = createThirdwebClient({
    clientId: "4ddc5eed2e073e550a7307845d10f348",
});

export async function POST(request: NextRequest) {
    try {
        const { email, action, verificationCode } = await request.json();

        if (action === 'send') {
            // Envoyer le code de vérification
            try {
                await preAuthenticate({
                    client,
                    strategy: "email",
                    email,
                });

                return NextResponse.json({ 
                    success: true, 
                    message: "Verification code sent successfully" 
                });
            } catch (error) {
                console.error('Error sending verification code:', error);
                return NextResponse.json({ 
                    success: false, 
                    message: "Error sending verification code" 
                }, { status: 500 });
            }
        }

        if (action === 'verify') {
            // Vérifier le code
            if (!verificationCode) {
                return NextResponse.json({ 
                    success: false, 
                    message: "Verification code is required" 
                }, { status: 400 });
            }

            try {
                // Connecter avec le code de vérification
                const wallet = inAppWallet();
                await wallet.connect({
                    client,
                    strategy: "email",
                    email,
                    verificationCode,
                });

                return NextResponse.json({ 
                    success: true, 
                    message: "Verification successful" 
                });
            } catch (error) {
                console.error('Error verifying code:', error);
                return NextResponse.json({ 
                    success: false, 
                    message: "Incorrect verification code" 
                }, { status: 400 });
            }
        }

        return NextResponse.json({ 
            success: false, 
            message: "Invalid action" 
        }, { status: 400 });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    }
} 