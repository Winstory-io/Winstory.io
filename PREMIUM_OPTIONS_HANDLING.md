# Gestion des options payantes Winstory pour les entreprises B2C

## Problème résolu

L'erreur suivante se produisait lors de la création de campagnes avec les options payantes :
```
null value in column "video_url" of relation "campaign_contents" violates not-null constraint
```

## Options payantes identifiées

Les entreprises B2C peuvent choisir deux options payantes principales :

### 1. **"Winstory creates the Film"** (Délégation vidéo)
- L'entreprise ne fournit pas de vidéo personnalisée
- Winstory se charge de créer la vidéo
- `video_url` peut être `null` ou avoir une valeur spéciale

### 2. **"Winstory manages rewards"** (Gestion des récompenses)
- L'entreprise ne paramètre pas de récompenses personnalisées
- Winstory gère automatiquement les récompenses
- `campaign_rewards` peut être vide

## Solution implémentée

### 1. Gestion des vidéos déléguées

```typescript
// Gérer le cas où l'entreprise délègue la création vidéo à Winstory
const videoUrl = data.film?.videoId ? `indexeddb:${data.film.videoId}` : 
                 data.film?.delegatedToWinstory ? 'winstory_delegated' : null;

const { error: contentError } = await supabase
  .from('campaign_contents')
  .insert({
    campaign_id: campaignId,
    video_url: videoUrl || 'winstory_delegated', // Valeur par défaut si pas de vidéo
    video_orientation: data.film?.format === '9:16' ? 'vertical' : 'horizontal',
    starting_story: data.story?.startingStory || '',
    guidelines: data.story?.guideline || ''
  });
```

### 2. Gestion des récompenses déléguées

```typescript
// Créer les récompenses (toujours créer un enregistrement, même vide)
const hasRewards = data.standardToken || data.standardItem || data.premiumToken || data.premiumItem;

const { error: rewardsError } = await supabase
  .from('campaign_rewards')
  .insert({
    campaign_id: campaignId,
    standard_reward: data.standardToken ? JSON.stringify(data.standardToken) : 
                    data.standardItem ? JSON.stringify(data.standardItem) : null,
    premium_reward: data.premiumToken ? JSON.stringify(data.premiumToken) : 
                   data.premiumItem ? JSON.stringify(data.premiumItem) : null,
    completion_price: data.roiData?.unitValue?.toString() || 
                     data.completions?.wincValue?.toString() || null
  });

if (hasRewards) {
  console.log('✅ Campaign rewards created');
} else {
  console.log('✅ Campaign rewards created (Winstory managed)');
}
```

### 3. Métadonnées enrichies

```typescript
const metadata = {
  // ... métadonnées existantes ...
  
  // Nouvelles métadonnées pour les options payantes
  winstory_creates_film: !data.film?.videoId,
  winstory_manages_rewards: !hasRewards,
  campaign_options: {
    video_delegation: !data.film?.videoId,
    reward_management: !hasRewards,
    premium_features: {
      custom_video: !!data.film?.videoId,
      custom_rewards: hasRewards
    }
  }
};
```

### 4. Logs détaillés

```typescript
console.log('=== PREMIUM OPTIONS CHOSEN ===');
console.log('Video ID (custom video):', data.film?.videoId ? 'YES' : 'NO - Winstory creates film');
console.log('Has Custom Rewards:', hasRewards ? 'YES' : 'NO - Winstory manages rewards');
console.log('Video File Name:', data.film?.fileName || 'N/A');
console.log('AI Requested:', data.film?.aiRequested || false);
```

## Valeurs spéciales utilisées

### Pour les vidéos déléguées
- **`winstory_delegated`** : Indique que Winstory se charge de créer la vidéo
- **`indexeddb:${videoId}`** : Vidéo personnalisée fournie par l'entreprise

### Pour les récompenses déléguées
- **`null`** dans `standard_reward` et `premium_reward` : Winstory gère les récompenses
- **JSON stringifié** : Récompenses personnalisées définies par l'entreprise

## Métadonnées capturées

### Options de délégation
- `winstory_creates_film`: `true` si Winstory crée la vidéo
- `winstory_manages_rewards`: `true` si Winstory gère les récompenses

### Fonctionnalités premium
- `custom_video`: `true` si l'entreprise fournit sa propre vidéo
- `custom_rewards`: `true` si l'entreprise définit ses propres récompenses

## Avantages de cette solution

- ✅ **Flexibilité** : Gère tous les cas (vidéo personnalisée vs déléguée)
- ✅ **Traçabilité** : Capture les options payantes choisies
- ✅ **Robustesse** : Plus d'erreur de contrainte `NOT NULL`
- ✅ **Logs détaillés** : Facilite le debugging et le suivi
- ✅ **Métadonnées riches** : Permet l'analyse des options choisies

## Test de la solution

Pour tester avec les options payantes :

1. **Créer une campagne B2C** sans importer de vidéo
2. **Vérifier les logs** : "NO - Winstory creates film"
3. **Créer une campagne B2C** sans paramétrer de récompenses
4. **Vérifier les logs** : "NO - Winstory manages rewards"
5. **Confirmer** : Plus d'erreur de contrainte, données correctement insérées

Cette solution permet de capturer et gérer toutes les options payantes choisies par les entreprises B2C ! 🎉
