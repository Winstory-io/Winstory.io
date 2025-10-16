# Console Logging - Processus de Création de Campagne

## Résumé

Des `console.log()` ont été ajoutés à toutes les étapes du processus de création de campagne pour afficher dans la console du navigateur toutes les variables saisies par l'utilisateur lors du clic sur les boutons.

## Comment visualiser les logs

1. Ouvrez les outils de développement de votre navigateur (F12)
2. Allez dans l'onglet "Console"
3. Suivez le processus de création de campagne
4. Toutes les variables seront affichées à chaque étape

## Étapes couvertes (Flow B2C Company)

### ✅ Étape 1 : Vos Informations
**Fichier** : `app/creation/b2c/yourinformations/page.tsx`

Affiche :
- Nom de l'entreprise
- Email de contact

### ✅ Étape 2 : Votre Winstory
**Fichier** : `app/creation/b2c/yourwinstory/page.tsx`

Affiche :
- Titre de départ (Starting Title)
- Histoire de départ (Starting Story)
- Ligne directrice (Guideline)

### ✅ Étape 3 : Votre Film A.I.
**Fichier** : `app/creation/b2c/yourfilm/page.tsx`

Affiche :
- Nom du fichier vidéo
- Taille de la vidéo (en MB)
- Format de la vidéo (horizontal/vertical)
- Si Winstory crée le film (true/false)

### ✅ Étape 4 : Rewards or Not
**Fichier** : `components/RewardsOrNot.tsx`

Affiche :
- Valeur unitaire (Unit Value)
- Profit net (Net Profit)
- Récompense gratuite (Free Reward)
- Pas de récompense (No Reward)
- Nombre maximum de completions

### ✅ Étape 5 : Standard Token Rewards
**Fichier** : `app/creation/b2c/standardrewards/TokenRewardConfig.tsx`

Affiche :
- Nom du token
- Adresse du contrat
- Blockchain
- Standard du token (ERC20, etc.)
- Montant par utilisateur
- Montant total
- Si le wallet a assez de balance

### ✅ Étape 6 : MINT & Paiement
**Fichier** : `app/creation/b2c/mint/page.tsx`

Affiche :
- Méthode de paiement sélectionnée
- Prix total
- Options de prix sélectionnées
- Email de l'utilisateur

### ✅ Récapitulatif Final
**Fichier** : `app/creation/b2c/recap/page.tsx`

Affiche un résumé complet de TOUTES les données :
- Informations utilisateur
- Informations de l'histoire
- Informations du film
- Données ROI/Rewards
- Récompenses Standard (si configurées)
- Récompenses Premium (si configurées)

## Flow Individual Creator

Les mêmes logs ont été ajoutés pour le flow des créateurs individuels :

### ✅ Étape 1 : Votre Winstory
**Fichier** : `app/creation/individual/yourwinstory/page.tsx`
- Titre, histoire, ligne directrice

### ✅ Étape 2 : Votre Film
**Fichier** : `app/creation/individual/yourfilm/page.tsx`
- Fichier vidéo, taille, format

## Format des logs

Tous les logs suivent ce format :
```
=== CREATE CAMPAIGN - [Nom de l'étape] ===
Variable 1: valeur
Variable 2: valeur
==========================================
```

## Exemple de sortie console

Voici ce que vous verrez dans la console lors d'un processus complet :

```
=== CREATE CAMPAIGN - Step 1: Your Informations ===
Company Name: Nike
Contact Email: contact@nike.com
==========================================

=== CREATE CAMPAIGN - Step 2: Your Winstory ===
Starting Title: Just Do It
Starting Story: Une histoire inspirante...
Guideline: Contenu motivant et positif...
==========================================

=== CREATE CAMPAIGN - Step 3: Your A.I. Film ===
Video File: campaign_video.mp4
Video Size: 25.50 MB
Video Format: horizontal
Winstory Creates Film: false
==========================================

[... et ainsi de suite pour chaque étape ...]
```

## Fichiers modifiés

### Flow B2C
1. ✅ `app/creation/b2c/yourinformations/page.tsx`
2. ✅ `app/creation/b2c/yourwinstory/page.tsx`
3. ✅ `app/creation/b2c/yourfilm/page.tsx`
4. ✅ `components/RewardsOrNot.tsx`
5. ✅ `app/creation/b2c/standardrewards/TokenRewardConfig.tsx`
6. ✅ `app/creation/b2c/recap/page.tsx`
7. ✅ `app/creation/b2c/mint/page.tsx`

### Flow Individual
1. ✅ `app/creation/individual/yourwinstory/page.tsx`
2. ✅ `app/creation/individual/yourfilm/page.tsx`

## Tests réalisés

✅ Aucune erreur de lint détectée
✅ Les logs sont correctement formatés
✅ Toutes les variables importantes sont capturées
✅ Format cohérent entre tous les fichiers

## Utilisation

### Pour les développeurs
- Ouvrez la console avant de commencer le processus
- Tous les logs apparaîtront automatiquement lors des clics sur les boutons
- Utilisez le filtre "CREATE CAMPAIGN" dans la console pour voir uniquement ces logs

### Pour les tests
- Vérifiez que toutes les données saisies apparaissent correctement
- Assurez-vous que les valeurs correspondent à ce qui a été saisi
- Testez chaque étape du processus

## Notes importantes

- Les logs n'apparaissent que lors des clics sur les boutons (soumission de formulaire)
- Aucune information de paiement sensible n'est loggée
- Les logs sont visibles uniquement dans le navigateur (côté client)
- Format cohérent sur toutes les pages

---

Date de création : 16 janvier 2025
Version : 1.0

