# Configuration Supabase - API REST Native

Ce guide explique comment configurer et utiliser l'API REST native de Supabase dans le projet Winstory.io.

## 📦 Installation

Le package `@supabase/supabase-js` a déjà été installé via :

```bash
npm install @supabase/supabase-js
```

## ⚙️ Configuration

### Variables d'environnement

Les credentials Supabase sont stockés dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://tfeuqyuajcluwkcazytx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Note** : Les variables préfixées par `NEXT_PUBLIC_` sont accessibles côté client dans Next.js.

### Client Supabase

Le client est configuré dans `lib/supabaseClient.ts` avec :
- ✅ Validation des variables d'environnement
- ✅ Configuration de l'authentification automatique
- ✅ Gestion des sessions persistantes
- ✅ Rafraîchissement automatique des tokens

## 🚀 Utilisation

### Import du client

```typescript
import { supabase } from '@/lib/supabaseClient';
```

### Exemples d'utilisation

#### 1. Lecture de données (SELECT)

```typescript
// Récupérer tous les enregistrements
const { data, error } = await supabase
  .from('users')
  .select('*');

// Avec filtres
const { data, error } = await supabase
  .from('users')
  .select('id, name, email')
  .eq('active', true)
  .order('created_at', { ascending: false });
```

#### 2. Insertion de données (INSERT)

```typescript
const { data, error } = await supabase
  .from('users')
  .insert([
    { name: 'John Doe', email: 'john@example.com' }
  ])
  .select();
```

#### 3. Mise à jour (UPDATE)

```typescript
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane Doe' })
  .eq('id', userId)
  .select();
```

#### 4. Suppression (DELETE)

```typescript
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId);
```

#### 5. Temps réel (Realtime)

```typescript
// S'abonner aux changements
const channel = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('Changement détecté:', payload);
    }
  )
  .subscribe();

// Se désabonner
await supabase.removeChannel(channel);
```

#### 6. Authentification

```typescript
// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Déconnexion
const { error } = await supabase.auth.signOut();

// Récupérer l'utilisateur actuel
const { data: { user } } = await supabase.auth.getUser();
```

#### 7. Storage (Fichiers)

```typescript
// Upload d'un fichier
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-avatar.png', file);

// Télécharger un fichier
const { data, error } = await supabase.storage
  .from('avatars')
  .download('user-avatar.png');

// Obtenir l'URL publique
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-avatar.png');
```

## 📁 Structure du projet

```
lib/
  └── supabaseClient.ts    # Client Supabase configuré
.env.local                 # Variables d'environnement (ne pas commiter)
.env.example              # Template des variables d'environnement
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Variables d'environnement** : Ne jamais commiter `.env.local` dans Git
2. **Row Level Security (RLS)** : Toujours activer RLS sur vos tables Supabase
3. **Clés API** : Utiliser la clé anonyme (`anon key`) côté client uniquement
4. **Service Role Key** : Utiliser la clé service uniquement côté serveur (API routes)

### Configuration côté serveur

Pour les opérations sensibles, créez un client serveur :

```typescript
// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

Ajoutez à `.env.local` :
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🛠️ Gestion des erreurs

Toujours vérifier les erreurs retournées :

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*');

if (error) {
  console.error('Erreur Supabase:', error.message);
  // Gérer l'erreur
  return;
}

// Utiliser les données
console.log(data);
```

## 🔗 Ressources

- [Documentation Supabase JS](https://supabase.com/docs/reference/javascript/introduction)
- [API Reference](https://supabase.com/docs/reference/javascript/supabase-client)
- [Authentification](https://supabase.com/docs/guides/auth)
- [Storage](https://supabase.com/docs/guides/storage)
- [Realtime](https://supabase.com/docs/guides/realtime)

## 📝 Notes

- Le client est configuré avec `persistSession: true` pour maintenir la session utilisateur
- `autoRefreshToken: true` rafraîchit automatiquement les tokens expirés
- `detectSessionInUrl: true` permet la détection automatique des sessions via URL (OAuth)

## 🚨 Dépannage

### Erreur : "Variables d'environnement non définies"

Vérifiez que `.env.local` existe et contient :
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Redémarrez le serveur de développement après modification :
```bash
npm run dev
```

### Erreur CORS

Si vous rencontrez des erreurs CORS, vérifiez dans Supabase Dashboard :
- Settings > API > API URL
- Ajoutez votre domaine dans les URL autorisées

