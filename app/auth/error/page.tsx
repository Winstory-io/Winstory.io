'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration.';
            case 'AccessDenied':
                return 'You do not have permission to connect.';
            case 'Verification':
                return 'The verification link has expired or has already been used.';
            case 'Default':
            default:
                return 'An unexpected error occurred.';
        }
    };

    return (
        <div className="max-w-md w-full space-y-8 p-8 text-center">
            <div>
                <img
                    src="/logo.svg"
                    alt="Winstory"
                    className="mx-auto h-12 w-auto mb-8"
                />
                <h2 className="text-3xl font-bold text-white mb-4">
                    Connection Error
                </h2>

                <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Oops! Something went wrong
                    </h3>
                    <p className="text-red-200 text-sm">
                        {getErrorMessage(error)}
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/auth/signin"
                        className="block w-full px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                    >
                        Try Again
                    </Link>

                    <Link
                        href="/"
                        className="block text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}

function ErrorFallback() {
    return (
        <div className="max-w-md w-full space-y-8 p-8 text-center">
            <div>
                <img
                    src="/logo.svg"
                    alt="Winstory"
                    className="mx-auto h-12 w-auto mb-8"
                />
                <h2 className="text-3xl font-bold text-white mb-4">
                    Connection Error
                </h2>

                <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                        Oops! Something went wrong
                    </h3>
                    <p className="text-red-200 text-sm">
                        An unexpected error occurred.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/auth/signin"
                        className="block w-full px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
                    >
                        Try Again
                    </Link>

                    <Link
                        href="/"
                        className="block text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Error() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <Suspense fallback={<ErrorFallback />}>
                <ErrorContent />
            </Suspense>
        </div>
    );
} 