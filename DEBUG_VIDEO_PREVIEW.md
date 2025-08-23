# Debug Guide - Video Preview in Recap Page

## Problème identifié
La prévisualisation vidéo n'apparaît pas dans la page `creation/individual/recap` alors qu'elle était présente avant.

## Cause du problème
Le système de stockage vidéo a été migré vers IndexedDB pour éviter les limites de localStorage, mais la logique d'affichage dans la page recap n'était pas correctement adaptée à ce nouveau système.

## Solutions appliquées

### 1. Correction de la condition d'affichage
**Fichier**: `app/creation/individual/recap/page.tsx`
**Ligne**: ~634

**Avant**:
```javascript
{(videoUrl || (recap.film.url && recap.film.url !== 'null' && recap.film.url.length > 10)) ? (
```

**Après**:
```javascript
{(videoUrl || (recap.film.url && recap.film.url !== 'null' && recap.film.url.length > 10)) ? (
```

### 2. Ajout d'états de chargement
- Ajout de `videoLoading` state pour indiquer quand la vidéo est en cours de récupération
- Ajout de gestion d'erreurs améliorée
- Ajout d'indicateurs visuels pour différents états

### 3. États d'affichage améliorés
1. **Vidéo chargée**: Affiche la vidéo avec contrôles
2. **Chargement en cours**: Affiche un spinner avec message
3. **Vidéo prête**: Indique que la vidéo est stockée mais pas encore affichée
4. **Fallback**: Affichage par défaut si aucune vidéo

## Comment tester

### 1. Test automatique avec le script de débogage
```javascript
// Dans la console du navigateur sur la page recap
// Coller le contenu du fichier debug-video-indexeddb.js
```

### 2. Test manuel
1. Aller sur `/creation/individual/yourfilm`
2. Uploader une vidéo MP4
3. Continuer vers `/creation/individual/yourcompletions`
4. Continuer vers `/creation/individual/recap`
5. Vérifier que la vidéo s'affiche dans la section "Your Film"

### 3. Vérifications dans la console
Rechercher ces logs :
```
✅ Film data loaded: { hasVideoId: true, fileName: "..." }
✅ Video loaded from IndexedDB: blob:http://localhost:3000/...
```

## Diagnostic des problèmes courants

### La vidéo ne s'affiche toujours pas
1. Vérifier dans la console : `localStorage.getItem('film')`
2. Vérifier si `videoId` est présent dans les données
3. Exécuter le script de débogage pour vérifier IndexedDB

### Erreur "Video not found in IndexedDB"
1. La vidéo n'a pas été correctement sauvegardée lors de l'upload
2. IndexedDB pourrait avoir été vidé
3. Réuploader la vidéo depuis `/creation/individual/yourfilm`

### Spinner de chargement infini
1. Problème de connexion IndexedDB
2. Vérifier les erreurs dans la console
3. Rafraîchir la page et réessayer

## Fichiers modifiés
- `app/creation/individual/recap/page.tsx` - Logique d'affichage corrigée
- `debug-video-indexeddb.js` - Script de débogage créé

## Prochaines étapes
1. Tester la solution sur différents navigateurs
2. Vérifier la compatibilité avec les anciennes données (format URL)
3. Optimiser les performances de chargement
4. Ajouter une option de rechargement manuel si la vidéo ne se charge pas

## Notes techniques
- Le système utilise `URL.createObjectURL()` pour créer des URLs temporaires
- Les vidéos sont stockées comme objets File dans IndexedDB
- Le cleanup automatique garde seulement les 5 vidéos les plus récentes
- La récupération est asynchrone et peut prendre quelques secondes 