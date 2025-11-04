# Guide d'accès aux APIs Admin

## Problème : "Unauthorized: Admin access required"

Lorsque vous accédez à `/api/admin/*`, vous devez être authentifié. Voici les solutions :

## Solution 1 : Mode développement (automatique)

Si vous êtes en **mode développement** (`NODE_ENV !== 'production'`), l'accès est **automatiquement autorisé** après redémarrage du serveur.

**Vérification :**
- Le serveur Next.js doit être lancé avec `npm run dev` (pas `npm run build && npm start`)
- Redémarrer le serveur après modification de `lib/adminAuth.ts`

**Test :**
```bash
# Redémarrer le serveur
# Puis tester :
curl http://localhost:3000/api/admin/pending-videos
```

## Solution 2 : Clé secrète admin

Ajoutez dans `.env.local` à la racine du projet :

```env
ADMIN_SECRET_KEY=mon-super-secret-key-12345
```

**Puis utilisez dans vos requêtes :**

### Via curl :
```bash
curl -H "x-admin-key: mon-super-secret-key-12345" \
  http://localhost:3000/api/admin/pending-videos
```

### Via navigateur (extension) :
Installez une extension comme "ModHeader" et ajoutez :
- Header: `x-admin-key`
- Value: `mon-super-secret-key-12345`

### Via JavaScript :
```javascript
fetch('http://localhost:3000/api/admin/pending-videos', {
  headers: {
    'x-admin-key': 'mon-super-secret-key-12345'
  }
})
```

## Solution 3 : Wallet address

Ajoutez dans `.env.local` :

```env
ADMIN_WALLETS=0x1234...,0x5678...
```

**Puis utilisez dans vos requêtes :**

### Via URL :
```
http://localhost:3000/api/admin/pending-videos?wallet=0x1234...
```

### Via header :
```bash
curl -H "x-wallet-address: 0x1234..." \
  http://localhost:3000/api/admin/pending-videos
```

## Vérification rapide

Pour tester rapidement si vous êtes en mode développement :

```bash
# Dans votre terminal, vérifier NODE_ENV
echo $NODE_ENV

# Si vide ou "development", vous êtes en dev mode
# Si "production", utilisez Solution 2 ou 3
```

## Pages admin (UI)

Pour accéder à `/admin/video-creation` :
- Connectez-vous avec un wallet
- Le wallet doit être dans `ADMIN_WALLETS` OU
- Vous devez être en mode développement

## Dépannage

1. **Erreur persiste après redémarrage :**
   - Vérifier que `NODE_ENV` n'est pas défini sur `production`
   - Vérifier les logs du serveur pour voir les messages d'authentification

2. **Clé secrète ne fonctionne pas :**
   - Vérifier que `.env.local` est bien à la racine du projet
   - Redémarrer le serveur après modification de `.env.local`
   - Vérifier l'orthographe exacte de la clé

3. **Wallet ne fonctionne pas :**
   - Vérifier que le wallet est en minuscules dans `.env.local`
   - Vérifier que le wallet dans la requête correspond exactement

