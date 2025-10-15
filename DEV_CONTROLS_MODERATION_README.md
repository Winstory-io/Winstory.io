# Dev Controls - Système de Modération Winstory

## Vue d'ensemble

Le système de Dev Controls pour la modération permet de configurer tous les éléments du système de modération sans avoir à modifier le code. Tous les éléments précédemment codés en dur sont maintenant configurables via une interface de développement.

## Fonctionnalités

### ✅ Éléments rendus configurables

#### 1. **Moteur de Modération**
- Nombre minimum de votants (MIN_VOTERS)
- Ratio de seuil pour la décision (THRESHOLD_RATIO)
- Échelle pour les calculs (SCALE)
- Politique de résolution automatique
- Fenêtre de vote (heures)
- Intervalle de rafraîchissement

#### 2. **Interface Utilisateur**
- **Bulles de modération** : Taille, espacement, police, couleurs, animations
- **Boutons** : Padding, taille de police, rayon de bordure, couleurs
- **Panneau de progression** : Dimensions, couleurs, seuils

#### 3. **Messages et Textes**
- Messages de validation (initiales et complétions)
- Messages de refus (initiales et complétions)
- Messages de notation
- Statuts de modération
- Conditions de validation

#### 4. **Thème et Couleurs**
- Couleurs principales (primaire, succès, avertissement, erreur)
- Couleurs de texte
- Dégradés
- Ombres

#### 5. **Fonctionnalités**
- Modération hybride
- Facteur de victoire
- Rafraîchissement automatique
- Mises à jour en temps réel
- Notation par modérateur
- Validation des enjeux
- Calcul XP
- Calcul des paiements

#### 6. **Animations**
- Durées (rapide, normale, lente)
- Fonctions d'accélération
- Transformations (survol, focus, actif)

#### 7. **Validation**
- Plages de scores
- Plages d'enjeux
- Plages de votes
- Timeouts

## Architecture

### Fichiers créés

```
lib/config/
├── moderation-dev-controls.ts          # Configuration centrale et types
├── hooks/
│   ├── useModerationDevControls.ts      # Hook principal pour les Dev Controls
│   └── useModerationEngineSync.ts       # Synchronisation avec le moteur
components/
├── DevControlsPanel.tsx                 # Panneau de configuration
├── DevControlsButton.tsx                # Bouton d'accès aux Dev Controls
└── ModerationDevControlsTest.tsx        # Composant de test
app/api/moderation/dev-controls/
└── route.ts                             # API pour gérer la configuration
app/moderation/dev-controls-test/
└── page.tsx                             # Page de test des Dev Controls
```

### Structure de la configuration

```typescript
interface ModerationDevControls {
  engine: {
    minVoters: number;
    thresholdRatio: number;
    scale: number;
    autoResolvePolicy: string;
    voteWindowHours: number;
    refreshIntervalMs: number;
  };
  contentTypeConfig: { [key: string]: ContentTypeConfig };
  ui: {
    bubbles: BubbleConfig;
    buttons: ButtonConfig;
    progressPanel: ProgressPanelConfig;
  };
  messages: {
    validation: ValidationMessages;
    refusal: RefusalMessages;
    scoring: ScoringMessages;
    status: StatusMessages;
    conditions: ConditionMessages;
  };
  theme: ThemeConfig;
  animations: AnimationConfig;
  validation: ValidationConfig;
  features: FeatureConfig;
  integrations: IntegrationConfig;
  development: DevelopmentConfig;
}
```

## Utilisation

### 1. **Accès aux Dev Controls**

En mode développement, un bouton "⚙️ Dev Controls" apparaît en bas à droite de la page de modération.

### 2. **Configuration**

Ouvrez le panneau Dev Controls et configurez :
- **Moteur** : Paramètres du moteur de modération
- **Interface** : Styles et dimensions des composants
- **Messages** : Textes et messages d'interface
- **Thème** : Couleurs et apparence
- **Fonctionnalités** : Activation/désactivation des fonctionnalités

### 3. **Sauvegarde**

Les modifications sont sauvegardées automatiquement vers le backend via l'API `/api/moderation/dev-controls`.

### 4. **Test**

Visitez `/moderation/dev-controls-test` pour voir l'état actuel de la configuration et tester les changements.

## API Endpoints

### GET `/api/moderation/dev-controls`
Récupère la configuration actuelle.

### POST `/api/moderation/dev-controls`
Met à jour la configuration avec les changements fournis.

### PUT `/api/moderation/dev-controls`
Remplace complètement la configuration.

### DELETE `/api/moderation/dev-controls`
Réinitialise la configuration aux valeurs par défaut.

## Intégration avec les composants existants

### ModerationBubbles
```typescript
const { styles, theme } = useModerationComponentConfig('bubbles');
const finalBubbleSize = bubbleSize || styles.defaultSize || 100;
```

### ModerationButtons
```typescript
const { styles, messages } = useModerationComponentConfig('buttons');
const buttonStyle = {
  padding: styles.padding,
  fontSize: styles.fontSize,
  borderRadius: styles.borderRadius,
};
```

### ModerationProgressPanel
```typescript
const { styles, theme } = useModerationComponentConfig('progressPanel');
const panelStyle = {
  minWidth: styles.minWidth,
  maxHeight: styles.maxHeight,
  padding: styles.padding,
};
```

## Synchronisation avec le moteur

Le hook `useModerationEngineSync` synchronise automatiquement la configuration des Dev Controls avec le moteur de modération :

```typescript
const { isSynced } = useModerationEngineSync();
// Met à jour automatiquement updateEngineConfig() quand la config change
```

## Mode développement

Les Dev Controls ne sont visibles qu'en mode développement :
- `NODE_ENV === 'development'`
- `hostname === 'localhost'`
- URL contient `?dev=true`

## Avantages

### ✅ **Flexibilité**
- Tous les paramètres sont configurables sans modification du code
- Ajustements en temps réel pendant le développement
- Tests rapides de différentes configurations

### ✅ **Maintenabilité**
- Code plus propre sans valeurs codées en dur
- Configuration centralisée
- Facilite les changements futurs

### ✅ **Évolutivité**
- Facile d'ajouter de nouveaux paramètres configurables
- Structure extensible pour de nouvelles fonctionnalités
- Intégration backend prête

### ✅ **Débogage**
- Interface de test intégrée
- Visualisation de l'état de la configuration
- Synchronisation en temps réel

## Prochaines étapes

1. **Base de données** : Implémenter la persistance en base de données
2. **Validation** : Ajouter plus de validations pour les paramètres
3. **Historique** : Sauvegarder l'historique des configurations
4. **Import/Export** : Fonctionnalités d'import/export de configuration
5. **Environnements** : Support de configurations par environnement
6. **Permissions** : Système de permissions pour les Dev Controls

## Conclusion

Le système de Dev Controls transforme complètement l'approche de configuration du système de modération. Tous les éléments précédemment codés en dur sont maintenant configurables, rendant le système plus flexible, maintenable et évolutif.
