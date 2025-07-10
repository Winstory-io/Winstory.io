# Authentification avec Validation d'Email Professionnel

## Vue d'ensemble

Cette solution utilise **thirdweb** pour l'authentification avec validation d'email professionnel **avant connexion**. L'utilisateur doit saisir un email professionnel pour recevoir un code de vérification, et seuls les emails professionnels sont acceptés.

## Fonctionnalités

### ✅ Validation pré-connexion avec thirdweb
- **Authentification thirdweb** : Utilise `preAuthenticate` et `connect` pour l'authentification email
- **Validation immédiate** : Vérification de l'email avant envoi du code
- **Code de vérification** : Envoi d'un code par email pour sécuriser la connexion
- **Interface en 2 étapes** : Saisie email → Code de vérification
- **Design cohérent** : Interface utilisateur avec le thème Winstory

### ✅ Emails bloqués
Les domaines suivants sont automatiquement rejetés :
- gmail.com
- yahoo.com
- hotmail.com
- outlook.com
- icloud.com
- aol.com
- protonmail.com
- mail.com
- live.com
- msn.com
- me.com
- mac.com

### ✅ Interface utilisateur
- Design cohérent avec le thème Winstory (noir/jaune)
- Messages d'erreur clairs
- États de chargement
- Gestion des sessions

## Utilisation

### 1. Authentification par email avec validation
```tsx
import WalletConnect from '@/components/WalletConnect';

// Dans votre composant
<WalletConnect isEmailLogin={true} />
```

### 2. Utilisation directe du composant
```tsx
import ThirdwebEmailAuth from '@/components/ThirdwebEmailAuth';

<ThirdwebEmailAuth 
    title="Connexion professionnelle"
    onSuccess={() => console.log('Connexion réussie')}
    onError={(error) => console.error('Erreur:', error)}
/>
```

### 3. Test de la validation
Allez sur `/test-email-validation` pour tester la fonctionnalité.

### 4. Flux d'authentification
1. L'utilisateur saisit son email professionnel
2. Le système valide l'email (rejette les emails personnels)
3. Un code de vérification est envoyé par email
4. L'utilisateur saisit le code pour se connecter

## Configuration requise

### Variables d'environnement
Assurez-vous d'avoir configuré ces variables dans votre `.env.local` :

```env
# Thirdweb (déjà configuré)
THIRDWEB_CLIENT_ID=4ddc5eed2e073e550a7307845d10f348

# Pas besoin de configuration email supplémentaire
# Thirdweb gère automatiquement l'envoi d'emails
```

## Personnalisation

### Ajouter de nouveaux domaines bloqués
Modifiez la liste `personalDomains` dans `components/ThirdwebEmailAuth.tsx`.

### Modifier le design
Le composant utilise des styles inline. Vous pouvez les modifier directement dans `ThirdwebEmailAuth.tsx`.

### Modifier les messages
Les messages d'erreur et de succès peuvent être personnalisés dans `ThirdwebEmailAuth.tsx`.

## Sécurité

- Validation immédiate de l'email avant envoi du code
- Code de vérification envoyé par email
- Authentification sécurisée via thirdweb
- Interface utilisateur claire et informative
- Protection contre les emails personnels
- Flux d'authentification en 2 étapes

## Support

Pour toute question ou problème, consultez la documentation NextAuth ou contactez l'équipe de développement. 