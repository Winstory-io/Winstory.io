'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ErrorPageContent = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Authentication Error</h1>
        <p className="text-xl mb-4">
          {error === 'Configuration' && 'There is a problem with the server configuration.'}
          {error === 'AccessDenied' && 'You do not have permission to sign in.'}
          {error === 'Verification' && 'The verification token has expired or has already been used.'}
          {!error && 'An error occurred during authentication.'}
        </p>
        <a href="/" className="text-blue-400 hover:text-blue-300 underline">
          Return to home page
        </a>
      </div>
    </div>
  );
};

const ErrorPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorPageContent />
    </Suspense>
  );
};

export default ErrorPage; 