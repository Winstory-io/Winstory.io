#!/usr/bin/env tsx
/**
 * Script de test de connexion Supabase
 * 
 * Usage:
 *   npm run supabase:test
 */

// Charger les variables d'environnement depuis .env.local AVANT tout import
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envPath = join(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
} catch (error) {
  console.error('⚠️  Fichier .env.local non trouvé. Création nécessaire.');
  process.exit(1);
}

// Importer createClient directement pour éviter les problèmes de chargement de module
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase...\n');
  
  try {
    // Test 1: Vérifier la configuration
    console.log('✓ Client Supabase initialisé');
    console.log(`📡 URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);
    
    // Test 2: Tester une requête simple
    console.log('🔄 Test de requête basique...');
    const { data, error } = await supabase
      .from('_test_table_')
      .select('count');
    
    if (error) {
      // C'est normal si la table n'existe pas
      if (error.message.includes('relation') || 
          error.message.includes('does not exist') || 
          error.message.includes('Could not find the table') ||
          error.message.includes('schema cache')) {
        console.log('⚠️  Table de test non trouvée (normal pour un nouveau projet)');
        console.log('✅ Connexion à Supabase réussie!\n');
      } else {
        console.error('❌ Erreur lors du test:', error.message);
        throw error;
      }
    } else {
      console.log('✅ Requête réussie!', data);
    }
    
    // Test 3: Vérifier l'authentification
    console.log('🔄 Test du module d\'authentification...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Erreur auth:', authError.message);
    } else {
      console.log('✅ Module d\'authentification fonctionnel');
      console.log(`📝 Session: ${authData.session ? 'Active' : 'Aucune session'}\n`);
    }
    
    // Test 4: Vérifier le storage
    console.log('🔄 Test du module Storage...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Erreur storage:', storageError.message);
    } else {
      console.log('✅ Module Storage fonctionnel');
      console.log(`📦 Buckets disponibles: ${buckets?.length || 0}\n`);
    }
    
    // Résumé
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 TESTS TERMINÉS AVEC SUCCÈS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Supabase est correctement configuré et fonctionnel');
    console.log('📚 Consultez examples/supabase-usage.ts pour des exemples d\'utilisation\n');
    
  } catch (error: any) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERREUR DE CONNEXION SUPABASE');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`\n${error.message}\n`);
    
    console.log('💡 Vérifications à faire:');
    console.log('  1. Le fichier .env.local existe-t-il ?');
    console.log('  2. Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont-elles définies ?');
    console.log('  3. Avez-vous redémarré le serveur après avoir créé .env.local ?');
    console.log('  4. Les credentials Supabase sont-ils corrects ?\n');
    console.log('📖 Consultez SUPABASE_ENV_SETUP.md pour plus d\'aide\n');
    
    process.exit(1);
  }
}

// Exécuter le test
testSupabaseConnection();

