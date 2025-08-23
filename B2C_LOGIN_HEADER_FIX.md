# B2C Login Pages - Header Improvements

## Modifications appliquées

### Pages concernées
- `app/creation/b2c/login/page.tsx`
- `app/creation/agencyb2c/login/page.tsx`

### Changements effectués

#### 1. Réduction de la taille du titre
**Avant :**
- `fontSize: '48px'`
- `fontWeight: '900'`

**Après :**
- `fontSize: '32px'`
- `fontWeight: '700'`

#### 2. Augmentation de la taille de l'icône company.svg
**Avant :**
```css
width: '48px',
height: '48px'
```

**Après :**
```css
width: '96px',
height: '96px'
```

#### 3. Ajout de la croix rouge de retour
Nouvelle section ajoutée après le header avec logo :

```jsx
{/* Red cross to go back to /youare */}
<Link href="/creation/youare" style={{ position: 'absolute', top: 8, right: 24, zIndex: 10 }}>
  <span title="Back to You Are">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="10" x2="30" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="10" x2="10" y2="30" stroke="#FF2D2D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </span>
</Link>
```

### Cohérence avec les autres pages
Ces modifications alignent les pages de login B2C avec la structure utilisée dans :
- `app/creation/youare/page.tsx` (pour la croix rouge)
- `app/creation/individual/login/page.tsx` (pour les proportions)

### Fonctionnalité
- **Croix rouge** : Permet de revenir à la page `/creation/youare`
- **Titre réduit** : Meilleure hiérarchie visuelle
- **Icône agrandie** : Meilleure visibilité et cohérence avec le design

### Navigation
```
/creation/youare → [Choix B2C/Agency] → /creation/b2c/login ou /creation/agencyb2c/login
                                      ↖ [Croix rouge] - Retour possible
```

## Test
1. Aller sur `/creation/youare`
2. Choisir "B2C Brand" ou "Agency B2C"
3. Vérifier la nouvelle apparence du header
4. Tester la croix rouge pour revenir à `/creation/youare` 