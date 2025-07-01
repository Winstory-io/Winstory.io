'use client';

import React from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté
        getSession().then((session) => {
            if (session) {
                router.push('/');
            }
        });
    }, [router]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            setMessage('Erreur lors de la connexion avec Google');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicrosoftSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('azure-ad', { callbackUrl: '/' });
        } catch (error) {
            setMessage('Erreur lors de la connexion avec Microsoft');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setMessage('');

        try {
            const result = await signIn('email', {
                email,
                callbackUrl: '/',
                redirect: false
            });

            if (result?.error) {
                setMessage('Erreur lors de l\'envoi de l\'email');
            } else {
                setMessage('Email envoyé ! Vérifiez votre boîte de réception.');
                setEmail('');
            }
        } catch (error) {
            setMessage('Erreur lors de l\'envoi de l\'email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <img
                        src="/logo.svg"
                        alt="Winstory"
                        className="mx-auto h-12 w-auto mb-8"
                    />
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Connexion à Winstory
                    </h2>
                    <p className="text-gray-400">
                        Choisissez votre méthode de connexion préférée
                    </p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg text-center ${message.includes('Erreur')
                            ? 'bg-red-900 text-red-200'
                            : 'bg-green-900 text-green-200'
                        }`}>
                        {message}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Google */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuer avec Google
                    </button>

                    {/* Microsoft */}
                    <button
                        onClick={handleMicrosoftSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M11.5 2.75h-8a.75.75 0 0 0-.75.75v8c0 .414.336.75.75.75h8a.75.75 0 0 0 .75-.75v-8a.75.75 0 0 0-.75-.75zm-8 1.5h7.25v6.5h-7.25v-6.5zm8.25 1.5h8a.75.75 0 0 1 .75.75v8a.75.75 0 0 1-.75.75h-8a.75.75 0 0 1-.75-.75v-8a.75.75 0 0 1 .75-.75zm0 1.5v6.5h7.25v-6.5h-7.25z" />
                        </svg>
                        Continuer avec Microsoft
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-black text-gray-400">ou</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailSignIn} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="w-full px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Envoi...' : 'Recevoir un lien de connexion'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 text-center">
                        Nous vous enverrons un lien de connexion sécurisé par email
                    </p>
                </div>

                <div className="text-center">
                    <a
                        href="/"
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                        ← Retour à l'accueil
                    </a>
                </div>
            </div>
        </div>
    );
} 