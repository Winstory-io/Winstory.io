# Implémentation des Logos d'Entreprises B2C

## Vue d'ensemble

Cette fonctionnalité permet d'afficher automatiquement les logos des entreprises B2C dans la page `/completion` en utilisant l'API Logo.dev (anciennement Clearbit).

## Configuration

### Variables d'environnement

Ajoutez la clé publique Logo.dev dans votre fichier `.env.local` :

```env
NEXT_PUBLIC_LOGO_DEV_KEY=pk_IrdsG2s1Ryu63FXBK-A53Q
```

**Note** : Une clé par défaut est déjà configurée dans le code, mais il est recommandé de la définir dans les variables d'environnement pour faciliter la gestion.

### Configuration Next.js

Le fichier `next.config.js` a été mis à jour pour autoriser les images depuis `img.logo.dev` :

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.logo.dev',
    },
  ],
}
```

## Fonctionnement

### Extraction du domaine

Le système extrait automatiquement le domaine de l'entreprise à partir de :

1. **URL de l'entreprise** (si fournie dans `localStorage.getItem('companyUrl')`)
2. **Adresse email de l'utilisateur** (depuis `localStorage.getItem('user')`)
3. **Email du client B2C** (pour les agences, depuis `localStorage.getItem('clientB2CEmail')`)

### Affichage du logo

Les logos sont affichés dans la page `/completion` :
- **Onglet "B2C Companies"** uniquement
- À côté du nom de l'entreprise (à droite du titre de la campagne)
- Format : 40x40px avec bordure arrondie
- Thème : `dark` (adapté pour les fonds sombres)

### Fallback

Si le logo ne peut pas être chargé :
- Le système affiche automatiquement l'icône par défaut `/company.svg`
- Logo.dev retourne un monogramme (première lettre du domaine) si aucun logo n'est trouvé

## Fichiers modifiés

1. **`lib/utils/companyLogo.ts`** (nouveau)
   - Fonctions utilitaires pour extraire les domaines et générer les URLs Logo.dev

2. **`app/completion/page.tsx`**
   - Ajout de la fonction `getCompanyLogo()`
   - Modification de l'affichage du nom de l'entreprise pour inclure le logo

3. **`next.config.js`**
   - Ajout de `img.logo.dev` dans `remotePatterns`

## Utilisation

### Dans le code

```typescript
import { getCompanyLogoFromUser, getCompanyDomain } from '../../lib/utils/companyLogo';

// Obtenir le logo depuis un email
const logoUrl = getCompanyLogoFromUser('user@company.com', undefined, 'dark');

// Obtenir le logo depuis une URL
const logoUrl = getCompanyLogoFromUser(undefined, 'https://company.com', 'dark');

// Utiliser dans un composant Image Next.js
<Image
  src={logoUrl}
  alt="Company logo"
  width={40}
  height={40}
  onError={(e) => {
    e.currentTarget.src = '/company.svg'; // Fallback
  }}
/>
```

### Paramètres Logo.dev

L'API Logo.dev supporte plusieurs paramètres :

- `theme=dark` : Adapte les couleurs pour les fonds sombres
- `theme=light` : Adapte les couleurs pour les fonds clairs
- `format=png` : Format PNG (par défaut)
- `format=svg` : Format SVG
- `size=128` : Taille de l'image
- `fallback=404` : Retourne 404 au lieu d'un monogramme si aucun logo n'est trouvé

## Prochaines étapes

- [ ] Implémenter les logos dans `/explorer`
- [ ] Ajouter un champ "URL de l'entreprise" dans le formulaire B2C
- [ ] Mettre en cache les logos chargés avec succès
- [ ] Support du mode light/dark selon le contexte

## Ressources

- [Logo.dev Documentation](https://logo.dev)
- Clé publique : `pk_IrdsG2s1Ryu63FXBK-A53Q`
- Clé secrète (pour usage serveur uniquement) : `sk_IyS3CxgCSwqotRq-B5CiNA`

