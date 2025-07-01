'use client';

import React from 'react';
import Link from 'next/link';

export default function VerifyRequest() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="max-w-md w-full space-y-8 p-8 text-center">
                <div>
                    <img
                        src="/logo.svg"
                        alt="Winstory"
                        className="mx-auto h-12 w-auto mb-8"
                    />
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Vérifiez votre email
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Nous avons envoyé un lien de connexion à votre adresse email.
                    </p>

                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Email envoyé !
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Cliquez sur le lien dans l'email pour vous connecter à votre compte Winstory.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou
                        </p>
                        <Link
                            href="/auth/signin"
                            className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
                        >
                            essayez avec une autre adresse email
                        </Link>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-700">
                    <Link
                        href="/"
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
} 