# Dockerfile pour Winstory.io - Next.js avec Prisma

# Étape 1 : Image de base avec Node.js 20 (Alpine pour une image légère)
FROM node:20-alpine AS base

# Installer les dépendances système nécessaires pour Prisma et les builds natifs
RUN apk add --no-cache libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Étape 2 : Installer les dépendances
FROM base AS deps

# Copier les fichiers de gestion des dépendances
COPY package.json package-lock.json* yarn.lock* ./

# Installer les dépendances (utiliser npm ci pour une installation reproductible)
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Étape 3 : Builder l'application
FROM base AS builder

# Copier les dépendances installées depuis l'étape deps
COPY --from=deps /app/node_modules ./node_modules

# Copier le reste du code source
COPY . .

# Copier le schéma Prisma
COPY prisma ./prisma

# Générer le client Prisma (CRITIQUE pour éviter les erreurs de build)
RUN npx prisma generate

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Construire l'application Next.js
RUN npm run build

# Étape 4 : Image de production (runtime)
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires depuis le builder
# Le mode standalone de Next.js crée un dossier .next/standalone avec tout ce qui est nécessaire
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copier le schéma Prisma (nécessaire pour les migrations en production)
COPY --from=builder /app/prisma ./prisma

# Le client Prisma est déjà généré dans le build standalone, mais on s'assure qu'il est présent
# En mode standalone, node_modules/.prisma est déjà inclus dans .next/standalone

# Changer la propriété des fichiers
RUN chown -R nextjs:nodejs /app

# Passer à l'utilisateur non-root
USER nextjs

# Exposer le port 3000
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Commande pour démarrer l'application
CMD ["node", "server.js"]

