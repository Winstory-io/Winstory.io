'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="mb-8">
                        <img
                            src="/logo.svg"
                            alt="Winstory"
                            className="mx-auto h-12 w-auto mb-4"
                        />
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Accès requis
                        </h2>
                        <p className="text-gray-400">
                            Vous devez être connecté pour accéder à cette page.
                        </p>
                    </div>

                    <a
                        href="/creation/b2c/login"
                        className="inline-block px-6 py-3 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                    >
                        Se connecter
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 