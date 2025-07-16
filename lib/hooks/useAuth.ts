import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Vérifier l'authentification au chargement
        const checkAuth = () => {
            const userData = localStorage.getItem("user");
            const walletData = localStorage.getItem("walletAddress");
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                } catch (error) {
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            if (walletData) {
                // On accepte une string simple (adresse) ou un objet JSON
                let address = null;
                try {
                    // Si c'est un objet JSON, on tente de parser
                    const parsedWallet = JSON.parse(walletData);
                    address = parsedWallet.address || null;
                } catch (error) {
                    // Sinon, c'est une string simple (adresse)
                    address = walletData;
                }
                setWalletAddress(address);
            } else {
                setWalletAddress(null);
            }
            // Authentifié si user OU walletAddress
            setIsAuthenticated(!!userData || !!walletData);
            setIsLoading(false);
        };

        checkAuth();

        // Écouter les changements de localStorage
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleStorageChange);
        };
    }, []);

    const login = async (email: string) => {
        try {
            const domain = email.split('@')[1] || '';
            const userData = { email };
            const companyData = { name: domain };
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("company", JSON.stringify(companyData));
            setUser(userData);
            setIsAuthenticated(true);
            window.dispatchEvent(new Event('authChange'));
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem("user");
            localStorage.removeItem("company");
            localStorage.removeItem("walletAddress");
            setUser(null);
            setWalletAddress(null);
            setIsAuthenticated(false);
            window.dispatchEvent(new Event('authChange'));
        } catch (error) {
            throw error;
        }
    };

    const requireAuth = (redirectTo = '/creation/b2c/login') => {
        if (isLoading) return null;
        if (!isAuthenticated) {
            router.push(redirectTo);
            return null;
        }
        return user || walletAddress;
    };

    return {
        user,
        walletAddress,
        isAuthenticated,
        isLoading,
        login,
        logout,
        requireAuth,
    };
} 