import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Vérifier l'authentification au chargement
        const checkAuth = () => {
            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Erreur parsing user data:', error);
                    localStorage.removeItem("user");
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            setIsLoading(false);
        };

        checkAuth();

        // Écouter les changements de localStorage
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);

        // Écouter les événements personnalisés pour les changements locaux
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

            // Déclencher un événement pour notifier les autres composants
            window.dispatchEvent(new Event('authChange'));

            return userData;
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem("user");
            localStorage.removeItem("company");
            setUser(null);
            setIsAuthenticated(false);

            // Déclencher un événement pour notifier les autres composants
            window.dispatchEvent(new Event('authChange'));
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
            throw error;
        }
    };

    const requireAuth = (redirectTo = '/creation/b2c/login') => {
        if (isLoading) return null;
        if (!isAuthenticated) {
            router.push(redirectTo);
            return null;
        }
        return user;
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        requireAuth,
    };
} 