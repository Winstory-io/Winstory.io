import { NextRequest, NextResponse } from 'next/server';
import { createThirdwebClient } from "thirdweb";
import { inAppWallet } from "thirdweb/wallets";
import { preAuthenticate } from "thirdweb/wallets/in-app";

export const runtime = 'nodejs';

function getServerThirdwebClient() {
    const secretKey = process.env.THIRDWEB_SECRET_KEY;
    if (secretKey) {
        return createThirdwebClient({ secretKey });
    }
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "4ddc5eed2e073e550a7307845d10f348";
    return createThirdwebClient({ clientId });
}

export async function POST(request: NextRequest) {
    try {
        const { email, action, verificationCode } = await request.json();
        const client = getServerThirdwebClient();

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
            } catch (error: any) {
                console.error('Error sending verification code:', error?.message || error);
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
                // Connecter avec le code de vérification (vérification uniquement)
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
            } catch (error: any) {
                console.error('Error verifying code:', error?.message || error);
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

    } catch (error: any) {
        console.error('API error:', error?.message || error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    }
} 