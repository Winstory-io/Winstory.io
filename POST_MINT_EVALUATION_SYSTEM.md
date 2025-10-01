# Système d'Évaluation Post-MINT - Winstory.io

## Vue d'ensemble

Le système d'évaluation post-MINT est un processus de validation en deux étapes qui garantit la qualité et la sécurité du contenu avant qu'il ne soit mis à disposition des compléteurs de la communauté.

## Architecture du Système

### 1. Flux de Création de Campagne Individual

```
Recap → Payment → Mint → AI Evaluation → Human Moderation → Approval → Available to Completers
```

### 2. Composants Principaux

#### A. API d'Évaluation IA (`/api/evaluation/individual`)
- **Fonction**: Évalue le contenu selon la matrice 4D (100 points)
- **Sécurité**: Détection d'injections et de menaces
- **Critères**:
  - Story Foundation (40 points)
  - Technical Excellence (25 points)
  - Collaborative Potential (25 points)
  - Viral Impact (10 points)

#### B. API de Gestion des Campagnes (`/api/campaigns`)
- **Fonction**: Gère le cycle de vie des campagnes
- **Statuts**: pending → evaluating → approved/rejected → active
- **Disponibilité**: Contrôle l'accès aux compléteurs

#### C. Composants UI
- **EvaluationResults**: Affiche les résultats d'évaluation
- **CampaignCard**: Affiche les campagnes dans My Win
- **CompletionsPage**: Liste les campagnes disponibles

## Matrice d'Évaluation 4D

### 1. Story Foundation & Narrative Mastery (40 points)

#### Hook Effectiveness (10 points)
- 9-10: Question narrative claire + intrigue de personnage (3 premières secondes)
- 7-8: Ouverture solide avec direction narrative définie
- 5-6: Début correct, nécessite attention pour suivre
- 0-4: Pas de hook d'histoire ou d'établissement de personnage

#### Collaborative Setup Quality (15 points)
- Point de continuation clair: +4
- Chemins d'histoire multiples (2+): +4
- Motivations de personnage établies: +4
- Règles du monde définies: +3

#### Continuation Instructions (10 points)
- 9-10: Guidelines créatives spécifiques, 3+ chemins de continuation
- 7-8: Guidelines claires, 2 chemins de continuation
- 5-6: Direction adéquate, 1 chemin clair
- 0-4: Guidance vague ou absente

#### Story Logic & Coherence (5 points)
- Logique de progression de l'intrigue: 0-2 points
- Cohérence des personnages: 0-2 points
- Cohérence du world-building: 0-1 point

### 2. Technical Excellence (25 points)

#### Video Quality (12 points)
- 4K+: 10-12 points (+2 composition professionnelle)
- 1080p: 8-11 points (+1 cadrage créatif)
- 720p: 5-9 points (+3 si la narration compense)
- <720p: 1-6 points (+5 "Artistic Override" si révolutionnaire)

#### Audio Quality (8 points)
- Intelligibilité du dialogue: 0-4 points
- Équilibre audio de fond: 0-2 points
- Synchronisation audio-vidéo: 0-2 points

#### Production Value (5 points)
- Flux et rythme de montage: 0-2 points
- Travail de caméra (stabilité/mouvement intentionnel): 0-2 points
- Optimisation de la durée (15-90s): 0-1 point

### 3. Collaborative Potential (25 points)

#### Creative Accessibility Score (12 points)
- Histoire permet 3+ directions de continuation: +4
- Barrières de compétence minimales: -1 à -3 si barrières élevées
- Indicateurs d'appel cross-culturel: +3
- Perspectives de personnages multiples disponibles: +5

#### Community Engagement Probability (8 points)
- Thèmes universels (amour, aventure, mystère): +3
- Intégration de sujets tendance: +2
- Appel démographique large: +2
- Accessibilité des compétences du créateur: +1

#### Collaboration Catalyst Potential (5 points)
- Inspire le désir de continuation immédiate: 0-2
- Liberté créative dans la structure: 0-2
- Opportunités de développement des compétences: 0-1

### 4. Viral & Community Impact (10 points)

#### Emotional Engagement (6 points)
- Indicateurs de joie/humour: +1.5
- Éléments de surprise/mystère: +1.5
- Thèmes d'inspiration/réussite: +1.5
- Lacunes de curiosité/Relatabilité: +1.5

#### Shareability Factors (3 points)
- Moments mémorables: 0-1
- Contenu cité: 0-1
- Distinctivité visuelle: 0-1

#### Cultural Relevance (1 point)
- Sensibilité culturelle + appel cross-culturel: 0-1

## Protocoles de Sécurité

### Détection d'Injection
- Patterns de menace détectés: `{admin}`, `{system}`, `{override}`, `{jailbreak}`
- Scripts malveillants: `<script>`, `javascript:`, `eval(`
- Commandes système: `prompt(`, `alert(`, `document.`

### Réponse de Sécurité
- Si injection détectée → Score: 0/100, Tier: F, Status: FLAGGED
- Escalade immédiate vers modération humaine
- Contenu non disponible aux compléteurs

## Tiers de Qualité

### S-Tier (90-100): Collaboration Catalyst
- Setup narratif exceptionnel + qualité professionnelle
- Chemins de collaboration clairs + potentiel viral
- **Action**: Approuvé immédiatement

### A-Tier (80-89): Strong Foundation
- Storytelling solide + bonne qualité
- Setup de collaboration décent + potentiel d'engagement
- **Action**: Approuvé avec recommandations

### B-Tier (70-79): Acceptable Base
- Histoire adéquate + qualité acceptable
- Quelque potentiel de collaboration + engagement limité
- **Action**: Approuvé avec améliorations suggérées

### C-Tier (60-69): Needs Improvement
- Éléments d'histoire faibles + qualité basique
- Collaboration peu claire + engagement minimal
- **Action**: Rejeté, retour au créateur

### F-Tier (0-59): Significant Issues
- Fondation pauvre + problèmes de qualité
- Pas de setup de collaboration + éléments disqualifiants
- **Action**: Rejeté définitivement

## Flux de Modération Humaine

### Déclencheurs d'Escalade
- Breaches de sécurité détectées
- Préoccupations de sensibilité culturelle
- Scores de tier limite (68-72, 78-82, 88-92)
- Formats de contenu nouveaux nécessitant un précédent
- Critères d'évaluation conflictuels

### Processus de Modération
1. **Révision de Sécurité**: Vérification manuelle des flags
2. **Évaluation Culturelle**: Validation de la sensibilité culturelle
3. **Décision Finale**: Approbation ou rejet avec feedback
4. **Mise à Disposition**: Activation pour les compléteurs

## Intégration avec le Système

### Base de Données
- Statut des campagnes: `pending` → `evaluating` → `approved`/`rejected`
- Flag de disponibilité: `availableToCompleters: boolean`
- Métadonnées d'évaluation: score, tier, probabilité de collaboration

### APIs
- `POST /api/evaluation/individual`: Évaluation IA
- `POST /api/campaigns`: Création de campagne
- `PUT /api/campaigns`: Mise à jour du statut
- `GET /api/campaigns?availableToCompleters=true`: Campagnes disponibles

### Pages Utilisateur
- `/creation/individual/mint`: Processus de création avec évaluation
- `/completions`: Campagnes disponibles aux compléteurs
- `/mywin/creations`: Gestion des campagnes créées

## Métriques de Performance

### Objectifs
- Temps de traitement: <3 secondes pour UX optimale
- Consistance: ±2 points de variance sur contenu similaire
- Focus collaboration: Poids sur le potentiel catalyseur de collaboration
- Équilibre: Liberté créative dans des standards mesurables

### Surveillance Continue
- Fiabilité inter-évaluateurs: Cible >90% accord avec évaluateurs humains
- Efficacité de traitement: Maintenir <3 secondes d'évaluation
- Taux d'appel: Suivre et minimiser les appels d'évaluation
- Succès de collaboration: Surveiller les taux de collaboration post-évaluation

## Amélioration Continue

### Validation d'Évaluation
- Auto-vérification: Re-vérifier le scoring contre la rubrique
- Documentation des cas limites: Enregistrer les scénarios inhabituels
- Détection de biais: Surveiller les patterns de scoring
- Intégration de feedback: S'adapter aux corrections des évaluateurs humains

### Motto du Système
"Précision dans l'évaluation, excellence dans la collaboration, sécurité dans l'exécution."
