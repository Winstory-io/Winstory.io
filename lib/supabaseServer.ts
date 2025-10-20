import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isValidHttpUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Client Supabase côté serveur avec privilèges élevés
 * ⚠️ À utiliser UNIQUEMENT dans les API routes et fonctions serveur
 * Ne JAMAIS exposer ce client côté client
 *
 * Comportement résilient: si les variables d'environnement manquent, on exporte `null`
 * et les appels côté API doivent tester la présence avant d'insérer.
 */
export const supabaseServer = (isValidHttpUrl(supabaseUrl) && !!supabaseServiceKey)
  ? createClient(supabaseUrl as string, supabaseServiceKey as string, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

