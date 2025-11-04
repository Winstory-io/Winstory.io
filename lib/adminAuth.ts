/**
 * Utilitaires d'authentification pour l'interface admin Winstory
 * Protège les routes /admin/* contre les accès non autorisés
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Liste des wallets autorisés pour l'accès admin (à configurer dans .env.local)
const ADMIN_WALLETS = (process.env.ADMIN_WALLETS || '').split(',').map(w => w.trim().toLowerCase()).filter(Boolean);

// Clé secrète admin (alternative à la vérification wallet)
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

/**
 * Vérifie si un wallet est autorisé à accéder à l'interface admin
 */
export async function verifyAdminAccess(walletAddress: string | null): Promise<boolean> {
  // En développement, permettre l'accès (pour les tests)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧪 [ADMIN AUTH] Development mode: Admin access allowed');
    return true;
  }

  // Si aucune configuration admin, refuser l'accès
  if (ADMIN_WALLETS.length === 0 && !ADMIN_SECRET_KEY) {
    console.warn('⚠️ [ADMIN AUTH] No admin configuration found. Please set ADMIN_WALLETS or ADMIN_SECRET_KEY in .env.local');
    return false;
  }

  // Vérifier par wallet address
  if (walletAddress && ADMIN_WALLETS.length > 0) {
    const isAuthorized = ADMIN_WALLETS.includes(walletAddress.toLowerCase());
    console.log(`🔐 [ADMIN AUTH] Wallet ${walletAddress} ${isAuthorized ? 'authorized' : 'not authorized'}`);
    return isAuthorized;
  }

  // Si pas de wallet mais une clé secrète, retourner false (la clé doit être vérifiée séparément)
  return false;
}

/**
 * Vérifie une clé secrète admin
 */
export function verifyAdminSecretKey(secretKey: string | null): boolean {
  if (!ADMIN_SECRET_KEY) {
    return false;
  }

  return secretKey === ADMIN_SECRET_KEY;
}

/**
 * Vérifie l'accès admin depuis une requête Next.js
 */
export async function checkAdminAccess(request: NextRequest): Promise<boolean> {
  // En développement, permettre l'accès (pour les tests)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧪 [ADMIN AUTH] Development mode: Admin access allowed');
    return true;
  }

  // Vérifier la clé secrète dans les headers (pour les API calls)
  const adminKey = request.headers.get('x-admin-key');
  if (adminKey && verifyAdminSecretKey(adminKey)) {
    return true;
  }

  // Vérifier le wallet dans les query params ou headers
  const wallet = request.nextUrl.searchParams.get('wallet') || request.headers.get('x-wallet-address');
  if (wallet) {
    return await verifyAdminAccess(wallet);
  }

  // Si aucune configuration admin, refuser l'accès
  if (ADMIN_WALLETS.length === 0 && !ADMIN_SECRET_KEY) {
    console.warn('⚠️ [ADMIN AUTH] No admin configuration found. Please set ADMIN_WALLETS or ADMIN_SECRET_KEY in .env.local');
    return false;
  }

  // Par défaut, refuser l'accès
  return false;
}

/**
 * Composant de protection pour les pages admin (client-side)
 */
export function isAdminWallet(walletAddress: string | null): boolean {
  if (!walletAddress) return false;
  if (process.env.NODE_ENV !== 'production') return true; // Dev mode
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
}

