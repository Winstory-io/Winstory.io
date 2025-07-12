# Configuration Pinata API pour le Hackathon

## Problème
L'erreur "Failed to fetch" sur le bouton "Hackathon Chiliz FREE 🌶️" est causée par des clés API Pinata invalides ou expirées.

## Solution

### 1. Obtenir des clés API Pinata
1. Allez sur [https://app.pinata.cloud/](https://app.pinata.cloud/)
2. Créez un compte ou connectez-vous
3. Allez dans "API Keys" dans le menu
4. Créez une nouvelle clé API
5. Copiez la `API Key` et la `Secret API Key`

### 2. Configurer les clés dans votre projet

Créez un fichier `.env.local` à la racine de votre projet :

```bash
# Pinata API Keys
NEXT_PUBLIC_PINATA_API_KEY=votre_api_key_ici
NEXT_PUBLIC_PINATA_API_SECRET=votre_secret_api_key_ici
```

### 3. Redémarrer le serveur de développement

```bash
npm run dev
```

### 4. Vérification

Après avoir configuré les clés, le bouton "Hackathon Chiliz FREE 🌶️" devrait fonctionner correctement.

## Dépannage

### Si l'erreur persiste :

1. **Vérifiez vos clés API** : Assurez-vous qu'elles sont correctes et actives
2. **Vérifiez votre connexion internet** : L'API Pinata nécessite une connexion stable
3. **Vérifiez les quotas** : Assurez-vous que votre compte Pinata n'a pas dépassé ses limites
4. **Vérifiez la vidéo** : Assurez-vous qu'une vidéo a été uploadée dans la section `/yourfilm`

### Messages d'erreur courants :

- `401 Unauthorized` : Clés API incorrectes
- `403 Forbidden` : Permissions insuffisantes
- `429 Too Many Requests` : Limite de requêtes dépassée
- `Network error` : Problème de connexion internet

## Clés par défaut (pour test uniquement)

Les clés actuelles dans le code sont des clés de test qui peuvent ne pas fonctionner. Pour un usage en production, utilisez toujours vos propres clés API. 