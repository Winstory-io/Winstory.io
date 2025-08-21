# Système de Notation Spécifique par Modérateur - Winstory.io

## Vue d'ensemble

Le système de notation des complétions de Winstory.io implémente une logique de hiérarchisation par modérateur, où chaque modérateur ne peut utiliser chaque score (0-100) qu'une seule fois par campagne initiale.

## Logique de Fonctionnement

### Principe Fondamental

**Contrainte par Modérateur :** Les scores marqués comme "⚠️ You have already used this score for another completion from this campaign" sont uniquement ceux que **ce modérateur spécifique** (adresse wallet connectée) a déjà utilisés pour d'autres complétions appartenant à la même campagne initiale.

### Objectif

Cette logique **oblige les modérateurs à hiérarchiser** les différentes complétions appartenant à une même initiation, créant un système de classement relatif et équitable.

## Implémentation Technique

### Structure de Base de Données

```sql
-- Nouvelle table pour traquer les scores par modérateur
CREATE TABLE moderator_completion_scores (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  moderator_wallet TEXT NOT NULL,
  completion_id TEXT, -- Optionnel pour l'instant
  score INTEGER NOT NULL,
  scored_at TIMESTAMP DEFAULT NOW(),
  
  -- Contrainte unique : un modérateur ne peut utiliser le même score qu'une fois par campagne
  UNIQUE(campaign_id, moderator_wallet, score)
);
```

### API Endpoints

#### GET `/api/moderation/moderator-scores`
Récupère les scores déjà utilisés par un modérateur pour une campagne donnée.

**Paramètres :**
- `campaignId` : ID de la campagne
- `moderatorWallet` : Adresse wallet du modérateur

**Réponse :**
```json
{
  "usedScores": [25, 67, 89]
}
```

#### POST `/api/moderation/moderator-scores`
Enregistre un nouveau score utilisé par un modérateur.

**Body :**
```json
{
  "campaignId": "campaign_123",
  "moderatorWallet": "0x...",
  "score": 75,
  "completionId": "completion_456" // Optionnel
}
```

### Hook useModeration

Le hook `useModeration` a été étendu pour gérer les scores spécifiques au modérateur :

```typescript
const {
  moderatorUsedScores, // Scores utilisés par le modérateur actuel
  fetchModeratorUsedScores, // Fonction pour recharger les scores
  submitCompletionScore, // Fonction mise à jour avec validation
  // ... autres propriétés
} = useModeration();
```

### Interface Utilisateur

#### CompletionScoringModal

Le modal de notation affiche :
- **Slider 0-100** avec les scores déjà utilisés par ce modérateur marqués comme indisponibles
- **Message d'avertissement** spécifique : "⚠️ You have already used this score for another completion from this campaign"
- **Explication claire** : "Each score can only be used once per campaign by the same moderator"

## Flux de Modération

### 1. Chargement d'une Campagne
1. Le modérateur accède à une campagne de complétion
2. Le système récupère automatiquement les scores déjà utilisés par ce modérateur
3. L'interface se met à jour pour marquer les scores indisponibles

### 2. Notation d'une Complétion
1. Le modérateur clique sur "Valid & Score"
2. Le modal de notation s'ouvre avec les scores disponibles
3. Les scores déjà utilisés par ce modérateur sont visuellement marqués
4. Le modérateur sélectionne un score disponible
5. Le système valide et enregistre le score
6. Le score devient indisponible pour les futures complétions de cette campagne

### 3. Validation et Contraintes
- **Validation côté client** : Vérification immédiate des scores disponibles
- **Validation côté serveur** : Contrainte unique en base de données
- **Gestion d'erreur** : Message explicite si tentative d'utilisation d'un score déjà utilisé

## Avantages du Système

### 1. Hiérarchisation Forcée
- Oblige les modérateurs à classer relativement les complétions
- Évite les notes "moyennes" répétitives
- Crée un système de ranking naturel

### 2. Équité
- Chaque modérateur a ses propres contraintes
- Pas d'impact des décisions d'autres modérateurs sur les scores disponibles
- Système de notation indépendant par modérateur

### 3. Qualité de Modération
- Encourage une évaluation réfléchie
- Pousse à la différenciation entre les complétions
- Améliore la granularité des évaluations

## Évolutions Futures

### 1. Intégration Base de Données Complète
- Liaison avec les IDs de complétion réels
- Historique détaillé des notations
- Statistiques par modérateur

### 2. Analytics
- Analyse des patterns de notation par modérateur
- Identification des modérateurs les plus discriminants
- Métriques de qualité de modération

### 3. Gamification
- Récompenses pour la diversité de notation
- Badges pour les modérateurs équitables
- Système de réputation basé sur la hiérarchisation

## Notes d'Implémentation

- ✅ Structure Prisma mise à jour
- ✅ API endpoints créés
- ✅ Hook useModeration étendu
- ✅ Interface utilisateur adaptée
- ✅ Messages d'explication mis à jour
- 🔄 Intégration complète avec la base de données (à affiner)

## Exemple d'Usage

```typescript
// Dans le composant de modération
const { moderatorUsedScores } = useModeration();

// moderatorUsedScores contient [25, 67, 89] pour ce modérateur
// Le slider marquera ces scores comme indisponibles
// Le modérateur peut utiliser tous les autres scores (0-24, 26-66, 68-88, 90-100)
```

Cette implémentation respecte parfaitement votre logique : **chaque modérateur ne peut utiliser chaque score qu'une fois par campagne, l'obligeant à hiérarchiser les complétions de manière relative et équitable**. 