/**
 * Exemples d'utilisation du client Supabase
 * Ces exemples montrent les cas d'usage courants de l'API REST Supabase
 */

import { supabase } from '@/lib/supabaseClient';

// ==========================================
// EXEMPLES DE REQUÊTES (QUERIES)
// ==========================================

/**
 * Exemple 1: Récupérer tous les utilisateurs
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return null;
  }
  
  return data;
}

/**
 * Exemple 2: Récupérer un utilisateur par ID avec des relations
 */
export async function getUserWithPosts(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      posts (
        id,
        title,
        content,
        created_at
      )
    `)
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Erreur:', error);
    return null;
  }
  
  return data;
}

/**
 * Exemple 3: Requête avec filtres multiples
 */
export async function getActiveUsersFiltered() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('active', true)
    .gte('created_at', '2024-01-01')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Erreur:', error);
    return [];
  }
  
  return data;
}

/**
 * Exemple 4: Recherche textuelle (full-text search)
 */
export async function searchUsers(searchTerm: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .textSearch('name', searchTerm);
  
  if (error) {
    console.error('Erreur de recherche:', error);
    return [];
  }
  
  return data;
}

// ==========================================
// EXEMPLES D'INSERTIONS (INSERT)
// ==========================================

/**
 * Exemple 5: Créer un nouvel utilisateur
 */
export async function createUser(userData: { name: string; email: string }) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la création:', error);
    return null;
  }
  
  return data;
}

/**
 * Exemple 6: Insertion multiple
 */
export async function createMultipleUsers(users: Array<{ name: string; email: string }>) {
  const { data, error } = await supabase
    .from('users')
    .insert(users)
    .select();
  
  if (error) {
    console.error('Erreur lors de l\'insertion multiple:', error);
    return [];
  }
  
  return data;
}

// ==========================================
// EXEMPLES DE MISES À JOUR (UPDATE)
// ==========================================

/**
 * Exemple 7: Mettre à jour un utilisateur
 */
export async function updateUser(userId: string, updates: Partial<{ name: string; email: string }>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return null;
  }
  
  return data;
}

/**
 * Exemple 8: Mise à jour conditionnelle
 */
export async function deactivateOldUsers(dateThreshold: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ active: false })
    .lt('last_login', dateThreshold)
    .select();
  
  if (error) {
    console.error('Erreur:', error);
    return [];
  }
  
  return data;
}

// ==========================================
// EXEMPLES DE SUPPRESSION (DELETE)
// ==========================================

/**
 * Exemple 9: Supprimer un utilisateur
 */
export async function deleteUser(userId: string) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  
  if (error) {
    console.error('Erreur lors de la suppression:', error);
    return false;
  }
  
  return true;
}

// ==========================================
// EXEMPLES DE TEMPS RÉEL (REALTIME)
// ==========================================

/**
 * Exemple 10: S'abonner aux changements en temps réel
 */
export function subscribeToUserChanges(callback: (payload: any) => void) {
  const channel = supabase
    .channel('user-changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      },
      (payload) => {
        console.log('Changement détecté:', payload);
        callback(payload);
      }
    )
    .subscribe();
  
  // Retourner une fonction de nettoyage
  return () => {
    supabase.removeChannel(channel);
  };
}

// ==========================================
// EXEMPLES D'AUTHENTIFICATION
// ==========================================

/**
 * Exemple 11: Inscription utilisateur
 */
export async function signUpUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Erreur d\'inscription:', error);
    return null;
  }
  
  return data;
}

/**
 * Exemple 12: Connexion
 */
export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('Erreur de connexion:', error);
    return null;
  }
  
  return data;
}

/**
 * Exemple 13: Récupérer l'utilisateur connecté
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Erreur:', error);
    return null;
  }
  
  return user;
}

/**
 * Exemple 14: Déconnexion
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Erreur de déconnexion:', error);
    return false;
  }
  
  return true;
}

// ==========================================
// EXEMPLES DE STORAGE (FICHIERS)
// ==========================================

/**
 * Exemple 15: Upload d'un fichier
 */
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) {
    console.error('Erreur d\'upload:', error);
    return null;
  }
  
  return data;
}

/**
 * Exemple 16: Récupérer l'URL publique d'un fichier
 */
export function getPublicFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Exemple 17: Télécharger un fichier
 */
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);
  
  if (error) {
    console.error('Erreur de téléchargement:', error);
    return null;
  }
  
  return data;
}

/**
 * Exemple 18: Supprimer un fichier
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    console.error('Erreur de suppression:', error);
    return false;
  }
  
  return true;
}

// ==========================================
// EXEMPLES DE RPC (FONCTIONS PERSONNALISÉES)
// ==========================================

/**
 * Exemple 19: Appeler une fonction PostgreSQL personnalisée
 */
export async function callCustomFunction(functionName: string, params: any) {
  const { data, error } = await supabase
    .rpc(functionName, params);
  
  if (error) {
    console.error('Erreur RPC:', error);
    return null;
  }
  
  return data;
}

// ==========================================
// EXEMPLES D'UTILISATION DANS UN COMPOSANT REACT
// ==========================================

/**
 * Exemple 20: Hook personnalisé pour gérer l'état
 */
import { useState, useEffect } from 'react';

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*');
        
        if (error) throw error;
        
        setUsers(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
    
    // S'abonner aux changements en temps réel
    const unsubscribe = subscribeToUserChanges(() => {
      fetchUsers();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  return { users, loading, error };
}

