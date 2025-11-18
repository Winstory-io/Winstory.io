# 🐳 Guide Docker pour Winstory.io

Ce guide explique comment utiliser Docker pour résoudre les problèmes de compatibilité entre environnements et déployer sur un serveur dédié.

## 📋 Prérequis

- Docker installé ([Installation Docker](https://docs.docker.com/get-docker/))
- Docker Compose installé (généralement inclus avec Docker Desktop)

## 🚀 Utilisation Rapide

### 1. Résoudre l'erreur de build pour votre associé

Votre associé doit simplement exécuter :

```bash
# Construire et démarrer les conteneurs
docker-compose up --build
```

Cela va :
- ✅ Installer toutes les dépendances dans un environnement standardisé
- ✅ Générer le client Prisma automatiquement
- ✅ Construire l'application Next.js
- ✅ Démarrer l'application sur le port 3000

### 2. Accéder à l'application

Une fois les conteneurs démarrés, l'application sera accessible sur :
- **Application** : http://localhost:3000
- **Redis** : Accessible uniquement depuis le réseau Docker interne

## 🔧 Configuration des Variables d'Environnement

### Option 1 : Fichier `.env` (Recommandé)

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon

# AWS S3 (si utilisé)
AWS_ACCESS_KEY_ID=votre-access-key
AWS_SECRET_ACCESS_KEY=votre-secret-key
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=winstory-videos

# Thirdweb (si utilisé)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=votre-client-id

# Autres variables nécessaires...
```

### Option 2 : Variables dans docker-compose.yml

Vous pouvez aussi définir les variables directement dans `docker-compose.yml` dans la section `environment` du service `app`.

## 📝 Commandes Utiles

### Démarrer les conteneurs
```bash
docker-compose up
```

### Démarrer en arrière-plan (détaché)
```bash
docker-compose up -d
```

### Reconstruire les images
```bash
docker-compose up --build
```

### Arrêter les conteneurs
```bash
docker-compose down
```

### Arrêter et supprimer les volumes (⚠️ supprime les données Redis)
```bash
docker-compose down -v
```

### Voir les logs
```bash
docker-compose logs -f app
```

### Exécuter une commande dans le conteneur
```bash
# Exécuter une migration Prisma
docker-compose exec app npx prisma migrate deploy

# Accéder au shell du conteneur
docker-compose exec app sh
```

## 🏗️ Structure des Services

### Service `app` (Application Next.js)
- **Port** : 3000
- **Image** : Construite depuis le Dockerfile
- **Dépendances** : Redis

### Service `redis` (Base de données Redis)
- **Port interne** : 6379
- **Image** : redis:6-alpine
- **Volume persistant** : `redis-data`

## 🔍 Dépannage

### Erreur : "Cannot find module"
**Solution** : Reconstruisez l'image
```bash
docker-compose down
docker-compose up --build
```

### Erreur : "Prisma Client not generated"
**Solution** : Le Dockerfile génère automatiquement le client Prisma. Si le problème persiste :
```bash
docker-compose exec app npx prisma generate
```

### Erreur : "Port already in use"
**Solution** : Changez le port dans `docker-compose.yml`
```yaml
ports:
  - "3001:3000"  # Utilisez le port 3001 sur votre machine
```

### Erreur de connexion à la base de données
**Solution** : Vérifiez que `DATABASE_URL` est correctement définie dans votre `.env` ou `docker-compose.yml`

## 🚢 Déploiement sur Serveur Dédié

### 1. Préparer le serveur

Sur votre serveur dédié, installez Docker et Docker Compose :

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Transférer les fichiers

```bash
# Sur votre machine locale
scp -r . user@serveur:/chemin/vers/winstory

# Ou utiliser Git
git clone votre-repo
cd winstory
```

### 3. Configurer les variables d'environnement

Créez le fichier `.env` sur le serveur avec les valeurs de production.

### 4. Démarrer l'application

```bash
docker-compose up -d --build
```

### 5. Configurer un reverse proxy (Nginx)

Pour exposer l'application sur le port 80/443, configurez Nginx :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Sécurité

- ✅ L'application s'exécute avec un utilisateur non-root (`nextjs`)
- ✅ Les variables sensibles ne doivent jamais être commitées dans Git
- ✅ Utilisez des secrets Docker ou un gestionnaire de secrets pour la production
- ✅ Configurez un firewall sur votre serveur

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)

## ✅ Avantages de cette Solution

1. **Environnement Standardisé** : Même environnement pour tous les développeurs
2. **Résolution des Erreurs de Build** : Plus de problèmes de versions Node.js différentes
3. **Déploiement Facile** : Une seule commande pour déployer sur le serveur
4. **Isolation** : L'application et ses dépendances sont isolées
5. **Scalabilité** : Facile d'ajouter d'autres services (base de données, etc.)

