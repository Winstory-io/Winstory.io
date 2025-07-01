'use client';

import React from 'react';
import Image from 'next/image';
import EmailAuth from './EmailAuth';

export default function Header() {
    return (
        <header className="bg-black border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Image
                            src="/logo.svg"
                            alt="Winstory"
                            width={120}
                            height={32}
                            className="h-8 w-auto"
                        />
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <a href="/" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                            Accueil
                        </a>
                        <a href="/creation" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                            Création
                        </a>
                        <a href="/explorer" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                            Explorer
                        </a>
                        <a href="/moderation" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                            Modération
                        </a>
                    </nav>

                    {/* Auth Button */}
                    <div className="flex items-center">
                        <EmailAuth title="Se connecter" />
                    </div>
                </div>
            </div>
        </header>
    );
}
