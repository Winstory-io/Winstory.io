'use client';

import React, { useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface EmailAuthProps {
    title?: string;
}

export default function EmailAuth({ title = "Sign in" }: EmailAuthProps) {
    const { data: session, status } = useSession();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            console.error('Google connection error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicrosoftSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('azure-ad', { callbackUrl: '/' });
        } catch (error) {
            console.error('Microsoft connection error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await signIn('email', {
                email,
                callbackUrl: '/',
                redirect: false
            });
            setShowEmailForm(false);
            setEmail('');
        } catch (error) {
            console.error('Email connection error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-w-[140px] h-10 px-4 py-2 bg-transparent border-2 border-yellow-400 rounded-lg text-yellow-400 font-semibold">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    {session.user?.image && (
                        <img
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <span className="text-sm text-white font-medium">
                        {session.user?.name || session.user?.email}
                    </span>
                </div>
                <button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="px-4 py-2 bg-transparent border-2 border-red-400 text-red-400 rounded-lg font-semibold text-sm hover:bg-red-400 hover:text-black transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'Disconnecting...' : 'Disconnect'}
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                disabled={isLoading}
                className="px-4 py-2 bg-transparent border-2 border-yellow-400 text-yellow-400 rounded-lg font-semibold text-sm hover:bg-yellow-400 hover:text-black transition-colors disabled:opacity-50 min-w-[140px] h-10 flex items-center justify-center"
            >
                {title}
            </button>

            {showEmailForm && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white text-center">
                            Choose your connection method
                        </h3>

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
                            Continue with Google
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
                            Continue with Microsoft
                        </button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-900 text-gray-400">or</span>
                            </div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleEmailSignIn} className="space-y-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending...' : 'Receive a secure login link'}
                            </button>
                        </form>

                        <p className="text-xs text-gray-400 text-center">
                            We will send you a secure login link by email
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
} 