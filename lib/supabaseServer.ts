import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Client Supabase côté serveur avec privilèges élevés
 * ⚠️ À utiliser UNIQUEMENT dans les API routes et fonctions serveur
 * Ne JAMAIS exposer ce client côté client
 *
 * Comportement résilient: si les variables d'environnement manquent, on exporte `null`
 * et les appels côté API doivent tester la présence avant d'insérer.
 */
export const supabaseServer = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

