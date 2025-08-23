# Restauration du Tooltip dans les pages B2C Login

## Problème identifié
Le `tooltip.svg` avait disparu des pages de login B2C, alors qu'il était présent auparavant.

## Pages corrigées
- `app/creation/b2c/login/page.tsx`
- `app/creation/agencyb2c/login/page.tsx`

## Corrections appliquées

### 1. Ajout du state pour le tooltip
```typescript
const [showTooltip, setShowTooltip] = useState(false);
```

### 2. Restructuration du header avec tooltip
**Avant :**
```jsx
<h1 style={{...}}>
  <img src="/company.svg" alt="Company Icon" />
  B2C Login
</h1>
```

**Après :**
```jsx
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px'
}}>
  <h1 style={{...}}>
    <img src="/company.svg" alt="Company Icon" />
    B2C Login
  </h1>
  <button onClick={() => setShowTooltip(true)} style={{...}}>
    <img src="/tooltip.svg" alt="Aide" style={{ width: 40, height: 40 }} />
  </button>
</div>
```

### 3. Ajout du modal tooltip
Modal informatif avec :
- Overlay semi-transparent
- Contenu explicatif sur l'authentification professionnelle
- Bouton de fermeture avec croix rouge
- Design cohérent avec les autres tooltips

### Contenu des tooltips

#### B2C Login
```
Professional email authentication is required for B2C campaign creation.

This ensures business-level security and proper campaign management for your brand.
```

#### Agency B2C Login
```
Professional email authentication is required for Agency B2C campaign creation.

This ensures business-level security and proper campaign management for your client's brand.
```

## Structure finale du header
```
[Logo Winstory]                    [Company Icon + Titre + Tooltip] [Croix Rouge]
```

## Fonctionnalités restaurées
✅ Tooltip cliquable à côté du titre
✅ Modal informatif avec explication
✅ Cohérence visuelle avec les autres pages
✅ Navigation intuitive avec croix de fermeture

## Test
1. Aller sur `/creation/youare`
2. Choisir "B2C Brand" ou "Agency B2C"
3. Vérifier la présence du tooltip à côté du titre
4. Cliquer sur le tooltip pour voir le modal
5. Fermer le modal avec la croix rouge 