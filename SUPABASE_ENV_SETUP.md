# Configuration des Variables d'Environnement Supabase

## 📋 Instructions de Configuration

### Étape 1 : Créer le fichier `.env.local`

À la racine du projet, créez un fichier `.env.local` (s'il n'existe pas déjà).

### Étape 2 : Ajouter les variables Supabase

Ajoutez ces lignes dans votre fichier `.env.local` :

```env
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================

# URL de votre projet Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tfeuqyuajcluwkcazytx.supabase.co

# Clé publique anonyme (safe pour le client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZXVxeXVhamNsdXdrY2F6eXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjM4MzEsImV4cCI6MjA3MTI5OTgzMX0.zWEkdUJdAyum7DMyLmglaOjmMrbcDJlmotmeNkRZYNw

# Clé service role (UNIQUEMENT pour le serveur - NE PAS exposer côté client)
# Décommentez et ajoutez votre clé service si nécessaire
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Étape 3 : Redémarrer le serveur

Après avoir ajouté les variables, redémarrez votre serveur de développement :

```bash
npm run dev
```

## 🔒 Sécurité

### ⚠️ Important : Fichiers à ne JAMAIS commiter

Assurez-vous que votre `.gitignore` contient :

```gitignore
# Fichiers d'environnement
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 🔑 Types de clés Supabase

1. **ANON KEY (Clé Anonyme)** - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ Safe pour le client (navigateur)
   - ✅ Respecte les Row Level Security (RLS) policies
   - ✅ Accès limité selon les règles de sécurité
   - Utilisation : Client-side et Server-side

2. **SERVICE ROLE KEY (Clé Service)** - `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ NE JAMAIS exposer côté client
   - ⚠️ Bypass les Row Level Security policies
   - ⚠️ Accès complet à la base de données
   - Utilisation : UNIQUEMENT Server-side (API routes)

## 📁 Localisation des clés dans Supabase Dashboard

1. Connectez-vous à [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Vous trouverez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (gardez-la secrète!)

## 🚀 Environnements Multiples

### Développement Local

`.env.local` (déjà configuré ci-dessus)

### Production (Vercel, Netlify, etc.)

Ajoutez les variables d'environnement dans le dashboard de votre plateforme :

**Vercel:**
- Settings → Environment Variables
- Ajoutez `NEXT_PUBLIC_SUPABASE_URL`
- Ajoutez `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ajoutez `SUPABASE_SERVICE_ROLE_KEY` (si nécessaire)

**Netlify:**
- Site settings → Environment variables
- Même processus que Vercel

## ✅ Vérification de la Configuration

Pour vérifier que tout fonctionne, créez un fichier de test :

```typescript
// test-supabase.ts
import { supabase } from '@/lib/supabaseClient';

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('your_table_name')
      .select('count');
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
    } else {
      console.log('✅ Connexion réussie!', data);
    }
  } catch (err) {
    console.error('❌ Erreur:', err);
  }
}

testConnection();
```

## 🆘 Dépannage

### Erreur : "Variables d'environnement non définies"

**Solution :**
1. Vérifiez que `.env.local` existe à la racine du projet
2. Vérifiez l'orthographe des noms de variables
3. Redémarrez le serveur après modification

### Erreur : "Invalid API key"

**Solution :**
1. Vérifiez que vous avez copié la clé complète (sans espaces)
2. Vérifiez que la clé correspond au bon projet Supabase
3. Générez une nouvelle clé si nécessaire

### Variables non chargées

**Solution :**
1. Les variables `NEXT_PUBLIC_*` doivent être définies au moment du build
2. Redémarrez complètement le serveur (`Ctrl+C` puis `npm run dev`)
3. Vérifiez qu'il n'y a pas de caractères cachés ou d'espaces

## 📝 Template Complet

Voici un template complet de `.env.local` pour votre projet :

```env
# ==========================================
# SUPABASE
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://tfeuqyuajcluwkcazytx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZXVxeXVhamNsdXdrY2F6eXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjM4MzEsImV4cCI6MjA3MTI5OTgzMX0.zWEkdUJdAyum7DMyLmglaOjmMrbcDJlmotmeNkRZYNw
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ==========================================
# NEXTAUTH
# ==========================================
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# ==========================================
# DATABASE (Si vous utilisez Prisma avec Supabase)
# ==========================================
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.tfeuqyuajcluwkcazytx.supabase.co:5432/postgres"

# ==========================================
# OAUTH PROVIDERS
# ==========================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id

# ==========================================
# EMAIL (SMTP)
# ==========================================
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@winstory.io
```

## 📞 Support

Pour plus d'informations :
- [Documentation Supabase](https://supabase.com/docs)
- [Guide d'authentification](https://supabase.com/docs/guides/auth)
- [Variables d'environnement Next.js](https://nextjs.org/docs/basic-features/environment-variables)

