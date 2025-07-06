# 🧪 Guide de Test - Validation Email Professionnel

## Comment tester la validation d'email

### 1. **Démarrer l'application**
```bash
cd Winstory.io
npm run dev
```

### 2. **Aller sur la page de test**
Ouvrez votre navigateur et allez sur :
```
http://localhost:3000/test-email-validation
```

### 3. **Test avec email personnel (DOIT ÉCHOUER)**
1. Cliquez sur "Connexion avec email professionnel"
2. Saisissez un email personnel : `test@gmail.com`
3. Cliquez sur "Recevoir un lien de connexion"
4. Vérifiez votre email et cliquez sur le lien de connexion
5. **RÉSULTAT ATTENDU** : Une modal rouge apparaît avec le message "Email non autorisé"
6. Vous êtes automatiquement déconnecté après 3 secondes

### 4. **Test avec email professionnel (DOIT RÉUSSIR)**
1. Cliquez sur "Connexion avec email professionnel"
2. Saisissez un email professionnel : `test@company.com`
3. Cliquez sur "Recevoir un lien de connexion"
4. Vérifiez votre email et cliquez sur le lien de connexion
5. **RÉSULTAT ATTENDU** : Vous restez connecté, pas de modal d'erreur

### 5. **Test sur une page existante**
Vous pouvez aussi tester sur une page qui utilise déjà l'authentification :
```
http://localhost:3000/creation/agencyb2c/login
```

## 🔧 Configuration requise

### Variables d'environnement
Créez un fichier `.env.local` dans le dossier `Winstory.io` :

```env
# Thirdweb (déjà configuré)
THIRDWEB_CLIENT_ID=4ddc5eed2e073e550a7307845d10f348
```

### Pas de configuration email supplémentaire
Thirdweb gère automatiquement l'envoi d'emails, pas besoin de configurer SMTP.

## 🐛 Dépannage

### Problème : Pas de modal d'erreur
- Vérifiez que `EmailValidationHandler` est bien importé dans `Providers.tsx`
- Vérifiez que thirdweb est bien configuré

### Problème : Modal d'erreur mais pas de déconnexion
- Vérifiez que le localStorage est bien nettoyé
- Vérifiez les logs de la console

### Problème : Validation ne se déclenche pas
- Vérifiez que l'utilisateur se connecte bien avec inAppWallet (email)
- Vérifiez que les données sont bien stockées dans le localStorage

## ✅ Résultat attendu

- **Email personnel** → Modal d'erreur + déconnexion automatique
- **Email professionnel** → Connexion réussie, pas d'erreur
- **Interface** → Design cohérent avec le thème Winstory (noir/jaune/rouge) 