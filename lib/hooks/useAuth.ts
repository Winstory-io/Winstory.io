import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const login = async (provider: 'google' | 'azure-ad' | 'email', email?: string) => {
        try {
            if (provider === 'email' && email) {
                await signIn('email', {
                    email,
                    callbackUrl: '/',
                    redirect: false
                });
            } else {
                await signIn(provider, { callbackUrl: '/' });
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut({ callbackUrl: '/' });
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
            throw error;
        }
    };

    const requireAuth = (redirectTo = '/auth/signin') => {
        if (status === 'loading') return null;
        if (!session) {
            router.push(redirectTo);
            return null;
        }
        return session;
    };

    return {
        session,
        status,
        isAuthenticated: !!session,
        isLoading: status === 'loading',
        login,
        logout,
        requireAuth,
    };
} 