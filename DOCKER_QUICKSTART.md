# 🚀 Docker - Démarrage Rapide

## Pour résoudre l'erreur de build de votre associé

```bash
# 1. Cloner le projet (si pas déjà fait)
git clone <votre-repo>
cd Winstory.io-main

# 2. Créer le fichier .env avec vos variables d'environnement
# (Copiez depuis .env.local ou créez-le avec les valeurs nécessaires)

# 3. Construire et démarrer
docker-compose up --build
```

C'est tout ! L'application sera accessible sur http://localhost:3000

## Commandes essentielles

```bash
# Démarrer
docker-compose up

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f app

# Reconstruire après des changements
docker-compose up --build
```

## Variables d'environnement requises

Créez un fichier `.env` à la racine avec au minimum :

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Pour la liste complète, voir `DOCKER_GUIDE.md`

## Problème ?

1. **Erreur de build** : `docker-compose down && docker-compose up --build`
2. **Port occupé** : Changez `3000:3000` dans `docker-compose.yml` en `3001:3000`
3. **Variables manquantes** : Vérifiez votre fichier `.env`

Pour plus de détails, consultez `DOCKER_GUIDE.md`

