# 🎯 Guide de Configuration du Système de Paiement Winstory

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Configuration initiale](#configuration-initiale)
3. [Mode Test (Sandbox)](#mode-test-sandbox)
4. [Mode Production](#mode-production)
5. [Configuration des Webhooks](#configuration-des-webhooks)
6. [Test du système](#test-du-système)
7. [Gestion des paiements](#gestion-des-paiements)
8. [FAQ et Troubleshooting](#faq-et-troubleshooting)

---

## 🎨 Vue d'ensemble

Le système de paiement Winstory supporte :
- ✅ **Stripe** (CB, PayPal, Google Pay, Apple Pay)
- 🔜 **USDC sur Base** (à venir)

### Flux de paiement

```
Page MINT → Bouton de paiement → Modal Stripe → Confirmation → Page Thanks → MyWin/Creations
```

---

## ⚙️ Configuration initiale

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Stripe Configuration (MODE TEST pour commencer)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_TEST_ICI
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_TEST_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET_ICI

# Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (si pas déjà configuré)
DATABASE_URL=postgresql://user:password@localhost:5432/winstory

# Email (pour les confirmations)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@winstory.io

# Company Info (pour factures)
COMPANY_NAME=Winstory
COMPANY_IBAN=FR76 1741 8000 0100 0117 5195 874
COMPANY_BIC=SNNNFR22XXX
```

### 2. Obtenir vos clés Stripe TEST

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com)
2. Activez le **mode Test** (toggle en haut à droite)
3. Allez dans **Développeurs > Clés API**
4. Copiez :
   - `Clé publiable` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Clé secrète` → `STRIPE_SECRET_KEY`

### 3. Mise à jour de la base de données

```bash
# Générer le client Prisma avec les nouveaux modèles Payment
npm run db:generate

# Pousser le schéma vers la base de données
npm run db:push
```

---

## 🧪 Mode Test (Sandbox)

### Configuration

En mode test, vous pouvez utiliser des cartes de test Stripe :

| Carte | Numéro | Résultat |
|-------|--------|----------|
| Visa | `4242 4242 4242 4242` | ✅ Paiement réussi |
| Visa (décliné) | `4000 0000 0000 0002` | ❌ Paiement décliné |
| Mastercard | `5555 5555 5555 4444` | ✅ Paiement réussi |

**Détails de test :**
- Date d'expiration : n'importe quelle date future (ex: 12/25)
- CVC : n'importe quel code à 3 chiffres (ex: 123)
- Code postal : n'importe quel code (ex: 75001)

### Tester le flux complet

1. Démarrez le serveur : `npm run dev`
2. Allez sur `/creation/b2c/mint` ou `/creation/agencyb2c/mint`
3. Cliquez sur un moyen de paiement (sauf USDC)
4. Le modal Stripe s'ouvre
5. Entrez les coordonnées de test ci-dessus
6. Validez le paiement
7. Vous serez redirigé vers `/creation/[flowType]/thanks`
8. Puis automatiquement vers `/mywin/creations`

### Vérifier les paiements test

- Dashboard Stripe > Paiements
- Vous verrez tous les paiements de test avec l'étiquette **"TEST"**

---

## 🚀 Mode Production

### ⚠️ Important : À faire avant de passer en production

1. **Obtenir les clés LIVE** :
   - Dashboard Stripe > Désactiver le mode Test
   - Développeurs > Clés API > Section "Clés en production"

2. **Mettre à jour `.env.local`** :
```bash
# PRODUCTION
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SDr9uP2DPPLBvLEp6IXXgsqGI5oFZ7mPlm3az0GSGV7BDoVUkab3tpcxoA2eBIqIQfGbIrH4rlZuE3hQJ292hJu00HIPNDzR7
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_LIVE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET_PRODUCTION

NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

3. **Activer les moyens de paiement** :
   - Dashboard Stripe > Paramètres > Méthodes de paiement
   - Activer : Cartes, PayPal, Google Pay, Apple Pay

4. **Vérifier la compliance** :
   - Compléter les informations de votre entreprise
   - Vérifier votre compte bancaire
   - Configurer les factures et CGV

---

## 🔔 Configuration des Webhooks

Les webhooks permettent à Stripe de notifier votre application des événements de paiement.

### En local (développement)

1. Installer Stripe CLI :
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/vX.XX.X/stripe_X.XX.X_linux_x86_64.tar.gz
```

2. Se connecter :
```bash
stripe login
```

3. Écouter les webhooks :
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

4. Copiez le `webhook secret` affiché (commence par `whsec_`) dans `.env.local`

### En production

1. Dashboard Stripe > Développeurs > Webhooks
2. Cliquez sur **"Ajouter un point de terminaison"**
3. URL : `https://votre-domaine.com/api/payment/webhook`
4. Événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copiez le **"Secret de signature"** dans votre `.env.local` de production

---

## 🧪 Test du système

### 1. Test du modal de paiement

```bash
# Démarrer le serveur
npm run dev

# Ouvrir dans le navigateur
http://localhost:3000/creation/b2c/mint
```

### 2. Vérifier les logs

Les paiements sont enregistrés dans :
- **Base de données** : table `payments`
- **Console du serveur** : logs détaillés
- **Stripe Dashboard** : tous les paiements

### 3. Tester les webhooks

```bash
# Terminal 1 : Serveur Next.js
npm run dev

# Terminal 2 : Stripe CLI
stripe listen --forward-to localhost:3000/api/payment/webhook

# Terminal 3 : Déclencher un événement test
stripe trigger payment_intent.succeeded
```

---

## 💼 Gestion des paiements

### Consulter les paiements

```javascript
// Dans une API route ou composant serveur
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Récupérer tous les paiements
const payments = await prisma.payment.findMany({
  orderBy: { createdAt: 'desc' },
});

// Filtrer par statut
const settledPayments = await prisma.payment.findMany({
  where: { status: 'SETTLED' },
});

// Récupérer un paiement par ID Stripe
const payment = await prisma.payment.findUnique({
  where: { providerId: 'pi_xxxxxxxxxxxxx' },
});
```

### Remboursements

Les remboursements peuvent être effectués depuis :
1. **Stripe Dashboard** (recommandé pour la sécurité)
2. **API Stripe** (pour l'automatisation)

```typescript
import { createRefund } from '@/lib/stripe-server';

// Remboursement total
await createRefund('pi_xxxxxxxxxxxxx');

// Remboursement partiel (montant en cents)
await createRefund('pi_xxxxxxxxxxxxx', 5000); // 50 USD
```

---

## 🆘 FAQ et Troubleshooting

### ❓ Le modal ne s'ouvre pas

**Solutions :**
1. Vérifiez que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est bien défini
2. Ouvrez la console du navigateur pour voir les erreurs
3. Vérifiez que vous avez redémarré le serveur après avoir modifié `.env.local`

### ❓ Erreur "Invalid API Key"

**Solutions :**
1. Vérifiez que vous utilisez bien les clés du bon mode (Test/Production)
2. Les clés ne doivent pas contenir d'espaces
3. Redémarrez le serveur

### ❓ Les webhooks ne fonctionnent pas

**Solutions :**
1. En local, vérifiez que Stripe CLI écoute bien sur le bon port
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct
3. En production, vérifiez l'URL du webhook dans Stripe Dashboard

### ❓ Paiement bloqué à "Processing"

**Solutions :**
1. Vérifiez que les webhooks sont correctement configurés
2. Consultez les logs de Stripe Dashboard > Logs
3. Vérifiez que la base de données est accessible

### ❓ Comment tester les paiements PayPal / Google Pay / Apple Pay ?

En mode test :
- **PayPal** : Créez un compte sandbox PayPal
- **Google Pay** : Utilisez Chrome avec un compte Google
- **Apple Pay** : Utilisez Safari sur Mac/iOS avec Apple Pay configuré

### ❓ Comment voir les emails de confirmation ?

Pour l'instant, les emails ne sont pas encore implémentés (marqués TODO dans le code).
Vous pouvez :
1. Consulter `receipt_email` dans Stripe Dashboard
2. Implémenter l'envoi d'emails avec Nodemailer (déjà installé)

---

## 📊 Statuts des paiements

| Statut | Description |
|--------|-------------|
| `PENDING_SETTLEMENT` | Paiement reçu, en attente de confirmation (72h par défaut) |
| `SETTLED` | Paiement confirmé et settlement effectué |
| `ONCHAIN` | Fonds convertis en USDC et envoyés on-chain |
| `REFUNDED` | Paiement remboursé |
| `FAILED` | Paiement échoué |
| `AWAITING_REVIEW` | En attente de revue manuelle (montants élevés) |

---

## 🔐 Sécurité

### Bonnes pratiques

1. ✅ **Ne jamais commit** les clés secrètes dans Git
2. ✅ **Utiliser HTTPS** en production
3. ✅ **Vérifier les signatures** des webhooks
4. ✅ **Limiter les montants** pour détecter la fraude
5. ✅ **Monitorer les transactions** suspectes
6. ✅ **Activer 2FA** sur Stripe Dashboard

### Variables sensibles

- `.env.local` est dans `.gitignore` ✅
- Les clés secrètes ne sont jamais exposées au client ✅
- Les webhooks vérifient la signature Stripe ✅

---

## 📞 Support

- **Documentation Stripe** : https://stripe.com/docs
- **Stripe Dashboard** : https://dashboard.stripe.com
- **Support Stripe** : https://support.stripe.com

---

## 🚀 Prochaines étapes

1. ✅ Stripe intégré (CB, PayPal, Google Pay, Apple Pay)
2. 🔜 Paiements USDC sur Base
3. 🔜 Envoi d'emails de confirmation
4. 🔜 Génération automatique de factures PDF
5. 🔜 Dashboard admin pour gérer les paiements
6. 🔜 Système de coupons et promotions

---

**Date de création** : 2 octobre 2025
**Version** : 1.0 - Mode Sandbox
**Status** : ✅ Prêt pour les tests 