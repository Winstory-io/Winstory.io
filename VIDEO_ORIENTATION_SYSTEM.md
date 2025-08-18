# Système d'Orientation des Vidéos - Interface de Modération

## 🎯 Principe Fondamental

**L'orientation de la vidéo doit TOUJOURS respecter le format original importé par le créateur.**

- ✅ **Vidéo horizontale** → Affichage horizontal (16:9)
- ✅ **Vidéo verticale** → Affichage vertical (9:16)
- ❌ **JAMAIS forcer** une orientation différente de l'originale

## 🔧 Fonctionnement Technique

### 1. Détection Automatique
```javascript
// Détection basée sur les métadonnées de la vidéo
const aspectRatio = video.videoWidth / video.videoHeight;
const orientation = aspectRatio > 1 ? 'horizontal' : 'vertical';
```

### 2. Configuration Manuelle
```typescript
// Dans les données de campagne
content: {
  videoUrl: 'url-de-la-video.mp4',
  videoOrientation: 'vertical', // ou 'horizontal'
}
```

### 3. Styles CSS Adaptatifs
- **Horizontal** : `aspect-ratio: 16/9`, largeur 90%
- **Vertical** : largeur 60%, `object-fit: contain`
- **Responsive** : Adaptation automatique mobile/desktop

## 📋 Sources des Vidéos

### Processus de Création (/creation)
- **B2C Companies** : Vidéo importée par l'entreprise
- **Agencies B2C** : Vidéo fournie par l'agence pour le client
- **Individual Creators** : Vidéo uploadée par le créateur individuel

### Vidéos Créées par Winstory
- Selon les **volontés de l'entreprise** cliente
- Respect des **spécifications techniques** demandées
- Format choisi en fonction du **contexte d'usage** (mobile vs desktop)

## 🎨 Exemple de Test - Street Art Revolution

```typescript
{
  title: 'Street Art Revolution',
  creatorType: 'INDIVIDUAL_CREATORS',
  creatorInfo: {
    walletAddress: '0x98...3210'
  },
  content: {
    videoOrientation: 'vertical', // Test d'ergonomie verticale
    // URL temporaire - à remplacer par vraie vidéo 9:16
  }
}
```

## ✅ Bonnes Pratiques

1. **Respecter l'original** : Ne jamais déformer ou forcer l'orientation
2. **Détecter automatiquement** : Utiliser les métadonnées vidéo
3. **Fallback intelligent** : Si détection échoue, utiliser la valeur configurée
4. **Test d'ergonomie** : Vérifier l'affichage sur différents formats
5. **Responsive design** : Adapter l'affichage selon l'appareil

## 🔍 Tests Recommandés

- [ ] Vidéo horizontale 16:9 (paysage)
- [ ] Vidéo verticale 9:16 (portrait)
- [ ] Vidéo carrée 1:1
- [ ] Affichage mobile vs desktop
- [ ] Performance de chargement 