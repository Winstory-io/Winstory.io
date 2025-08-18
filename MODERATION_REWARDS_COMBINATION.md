# Moderation Rewards Bubbles Combination

## Overview

Cette modification combine les bulles "Standard Rewards" et "Premium Rewards" en une seule bulle "Rewards" dans l'interface de modération, améliorant ainsi la lisibilité et l'ergonomie en réduisant le nombre de bulles de 5 à 4 pour les campagnes B2C avec récompenses.

## Modifications apportées

### 1. Nouveau composant `RewardsModal.tsx`

- **Créé** : `components/RewardsModal.tsx`
- **Fonctionnalité** : Modal qui affiche les récompenses Standard et Premium côte à côte
- **Design** : Interface élégante avec deux colonnes distinctes
- **Icônes** : 🥉 pour Standard Rewards, 🏆 pour Premium Rewards

### 2. Composant `ModerationBubbles.tsx`

**Modifications :**
- Remplacement des deux bulles séparées par une seule bulle "Rewards"
- Mise à jour de la logique pour les campagnes `initial` et `completion`
- Conservation du même comportement pour les créateurs individuels (pas de bulles de récompenses)

**Avant :**
```typescript
{ key: 'premiumRewards', label: 'Premium Reward', onClick: () => onBubbleClick('premiumRewards') },
{ key: 'standardRewards', label: 'Standard Reward', onClick: () => onBubbleClick('standardRewards') },
```

**Après :**
```typescript
{ key: 'rewards', label: 'Rewards', onClick: () => onBubbleClick('rewards') },
```

### 3. Page de modération `app/moderation/page.tsx`

**Ajouts :**
- Import du nouveau composant `RewardsModal`
- Nouvel état `showRewardsModal`
- Fonction `handleBubbleClick` pour intercepter le clic sur "rewards"
- Intégration du modal RewardsModal à la fin du composant

**Suppressions :**
- Références aux anciens types de bulles `standardRewards` et `premiumRewards` dans les pop-ups existants

### 4. Composant `ModerationCard.tsx`

**Modifications :**
- Remplacement des deux bulles par une seule bulle "Rewards" centrée
- Positionnement ajusté : `left: '50%', transform: 'translateX(-50%)'`

### 5. Composant `CompletionInfo.tsx`

**Modifications :**
- Remplacement des deux bulles par une seule bulle "Rewards" plus large
- Style CSS ajusté avec classe `.rewards-bubble`
- Centrage de la bulle dans la rangée

### 6. Composant `CompletionInfoPopup.tsx`

**Ajouts :**
- Support du nouveau type `rewards` dans les fonctions `getPopupTitle()` et `getPopupIcon()`

## Bénéfices

### Amélioration de l'ergonomie
- **Réduction visuelle** : Passage de 5 à 4 bulles pour les campagnes B2C
- **Interface plus claire** : Moins d'encombrement visuel
- **Navigation simplifiée** : Un seul clic pour accéder aux informations de récompenses

### Meilleure présentation des informations
- **Vue comparative** : Les récompenses Standard et Premium sont présentées côte à côte
- **Interface cohérente** : Design uniforme avec le reste de l'application
- **Informations complètes** : Toutes les informations de récompenses restent accessibles

### Flexibilité
- **Rétrocompatibilité** : Les anciens types de bulles sont encore supportés dans certains composants
- **Extensibilité** : Le modal peut facilement être étendu pour d'autres types d'informations

## Structure des fichiers modifiés

```
components/
├── RewardsModal.tsx (NOUVEAU)
├── ModerationBubbles.tsx (MODIFIÉ)
├── ModerationCard.tsx (MODIFIÉ)
├── CompletionInfo.tsx (MODIFIÉ)
└── CompletionInfoPopup.tsx (MODIFIÉ)

app/moderation/
└── page.tsx (MODIFIÉ)
```

## Test et validation

Pour tester les modifications :

1. Naviguer vers `/moderation` avec une campagne B2C ayant des récompenses
2. Vérifier que seulement 4 bulles sont affichées (au lieu de 5)
3. Cliquer sur la bulle "Rewards"
4. Vérifier que le modal s'ouvre avec les deux colonnes Standard/Premium
5. Tester la fermeture du modal

## Impact sur les autres composants

- ✅ `ModerationInfoModal.tsx` : Pas d'impact, continue de fonctionner normalement
- ✅ Autres pages de création : Pas d'impact sur les flux de création de récompenses
- ✅ Types TypeScript : Pas de modification des interfaces principales

Cette modification améliore significativement l'expérience utilisateur en simplifiant l'interface tout en conservant l'accès complet aux informations de récompenses. 