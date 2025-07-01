# Configuration de l'Authentification Email

Ce guide vous explique comment configurer l'authentification par email avec Google, Microsoft/Outlook et email classique.

## Variables d'Environnement Requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# NextAuth.js
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/winstory"

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft Azure AD
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id

# Email Provider (SMTP)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@winstory.io
```

## Configuration des Providers

### 1. Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ API
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URIs de redirection autorisés :
   - `http://localhost:3000/api/auth/callback/google` (développement)
   - `https://votre-domaine.com/api/auth/callback/google` (production)

### 2. Microsoft Azure AD

1. Allez sur [Azure Portal](https://portal.azure.com/)
2. Créez une nouvelle application dans Azure Active Directory
3. Configurez les redirections URI :
   - `http://localhost:3000/api/auth/callback/azure-ad` (développement)
   - `https://votre-domaine.com/api/auth/callback/azure-ad` (production)
4. Créez un secret client et notez l'ID du tenant

### 3. Email Provider (SMTP)

Pour Gmail :
1. Activez l'authentification à 2 facteurs
2. Générez un mot de passe d'application
3. Utilisez ce mot de passe dans `EMAIL_SERVER_PASSWORD`

Pour Outlook/Office 365 :
```env
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
```

## Base de Données

1. Installez PostgreSQL
2. Créez une base de données
3. Exécutez les migrations Prisma :
```bash
npx prisma generate
npx prisma db push
```

## Utilisation

Le composant `EmailAuth` remplace maintenant `WalletConnect` et offre :

- **Connexion Google** : Authentification OAuth avec Google
- **Connexion Microsoft** : Authentification avec Azure AD (Outlook, Office 365)
- **Email Magic Link** : Connexion sans mot de passe par email

## Remplacement de WalletConnect

Pour utiliser le nouveau système d'authentification, remplacez :

```tsx
import WalletConnect from '@/components/WalletConnect';

// Par :
import EmailAuth from '@/components/EmailAuth';

// Et utilisez :
<EmailAuth title="Se connecter" />
```

## Pages d'Authentification

Les pages suivantes sont automatiquement créées :
- `/auth/signin` - Page de connexion personnalisée
- `/auth/signout` - Page de déconnexion
- `/auth/error` - Page d'erreur
- `/auth/verify-request` - Page de vérification email

## Sécurité

- Tous les tokens sont sécurisés avec JWT
- Les sessions sont gérées côté serveur
- Les emails de vérification sont envoyés via SMTP sécurisé
- Les redirections sont validées pour éviter les attaques 