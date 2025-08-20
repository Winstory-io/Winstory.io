# Système de Tarification Winstory - Implémentation

## Vue d'ensemble

Ce document décrit l'implémentation du système de tarification pour les pages de mint des processus B2C et Agency B2C de Winstory.

## Structure de Prix

### Prix de Base
- **1 000 USD** : Coût de base pour la création d'une histoire sur Winstory

### Options Supplémentaires
1. **Winstory creates the film** : +500 USD
   - Film généré par IA basé sur l'histoire de départ
   
2. **No rewards to give** : +1 000 USD
   - Complétions gratuites pour la communauté
   - Aucune récompense à configurer

## Composants Implémentés

### 1. PricingBubbles Component (`/components/PricingBubbles.tsx`)

Composant réutilisable qui affiche :
- Bulle du prix de base (1 000 USD)
- Bulles des options sélectionnées avec design différencié
- Bulle du prix total avec effet de brillance
- Informations de sécurité du paiement

**Caractéristiques UX/UI :**
- Dégradés de couleurs pour différencier les types d'options
- Effets d'ombre et de brillance
- Lignes de connexion pour montrer l'addition
- Design responsive et moderne

### 2. Pages de Mint Mises à Jour

#### B2C Mint Page (`/app/creation/b2c/mint/page.tsx`)
#### Agency B2C Mint Page (`/app/creation/agencyb2c/mint/page.tsx`)

**Nouvelles fonctionnalités :**
- Détection automatique des options sélectionnées via localStorage
- Calcul dynamique du prix total
- Affichage des bulles de tarification stylisées
- Suppression des émojis des modes de paiement
- Effets hover sur les boutons de paiement
- Sauvegarde du prix final et de la méthode de paiement

## Logique de Détection des Prix

### Sources de Données localStorage

1. **Film Data** (`localStorage.getItem("film")`)
   ```json
   {
     "aiRequested": boolean,
     "videoId": string,
     "fileName": string,
     "fileSize": number,
     "format": string
   }
   ```

2. **Campaign Reward Data** (`localStorage.getItem("campaignReward")`)
   ```json
   {
     "rewardType": "none",
     "rewardLabel": "No Reward to give? No Problem, free completions +$1000"
   }
   ```

3. **ROI Data** (`localStorage.getItem("roiData")`)
   ```json
   {
     "unitValue": number,
     "netProfit": number,
     "maxCompletions": number,
     "isFreeReward": boolean,
     "noReward": boolean
   }
   ```

### Calcul du Prix

```javascript
let price = 1000; // Prix de base
if (aiRequested) price += 500;
if (noRewards) price += 1000;
```

## Améliorations UX/UI Appliquées

### Design des Bulles de Prix
- **Base Story Creation** : Dégradé jaune/orange avec bordure dorée
- **Winstory creates film** : Dégradé vert avec effets de lumière
- **No rewards** : Dégradé violet avec design distinctif
- **Total Amount** : Design noir avec bordure dorée et effet de brillance

### Interactions Utilisateur
- Suppression des émojis des modes de paiement pour un look plus professionnel
- Effets hover subtils sur les boutons de paiement
- Feedback visuel clair sur le prix total
- Information de sécurité pour rassurer l'utilisateur

## Intégration avec le Système de Paiement

Le prix final est stocké dans `localStorage.setItem("finalPrice", price.toString())` et la méthode de paiement dans `localStorage.setItem("paymentMethod", method)` pour être utilisés par le système de paiement.

## Cas d'Usage

### Scénario 1 : B2C Standard
- Prix de base : 1 000 USD
- Utilisateur upload sa propre vidéo
- Configure des récompenses
- **Total : 1 000 USD**

### Scénario 2 : B2C avec IA
- Prix de base : 1 000 USD
- Winstory crée le film : +500 USD
- Configure des récompenses
- **Total : 1 500 USD**

### Scénario 3 : B2C sans récompenses
- Prix de base : 1 000 USD
- Utilisateur upload sa propre vidéo
- Aucune récompense : +1 000 USD
- **Total : 2 000 USD**

### Scénario 4 : Agency B2C Complet
- Prix de base : 1 000 USD
- Winstory crée le film : +500 USD (par défaut pour les agences)
- Aucune récompense : +1 000 USD
- **Total : 2 500 USD**

## Tests et Validation

Pour tester le système :
1. Parcourir le processus de création B2C ou Agency B2C
2. Sélectionner différentes options (AI film, no rewards)
3. Arriver sur la page de mint
4. Vérifier que les bulles de prix correspondent aux options choisies
5. Confirmer que le prix total est correct
6. Tester la sélection des modes de paiement

## Maintenance

Le système est conçu pour être facilement maintenable :
- Prix configurables via les constantes dans les composants
- Logique de détection centralisée
- Composant PricingBubbles réutilisable
- Documentation claire des sources de données localStorage 