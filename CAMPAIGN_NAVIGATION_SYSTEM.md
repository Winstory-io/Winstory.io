# Système de navigation entre campagnes dans My Creations

## 🎯 **Fonctionnalité ajoutée**

### **Navigation entre campagnes**
- **Flèches de navigation** : ← Précédent / Suivant →
- **Compteur de campagnes** : "Campagne X sur Y"
- **Titre de campagne** : Affichage du titre de la campagne actuelle
- **Navigation circulaire** : Retour à la première après la dernière

### **Évolution de la modération**
- **Donut dynamique** : Différent pour chaque campagne
- **Scores individuels** : Chaque campagne a ses propres votes
- **Statuts différents** : Certaines peuvent être validées, d'autres en attente

## 🔧 **Implémentation technique**

### **1. État de navigation**
```typescript
const [moderationData, setModerationData] = useState<any[]>([]);
const [currentCampaignIndex, setCurrentCampaignIndex] = useState(0);
```

### **2. Fonctions de navigation**
```typescript
const goToPreviousCampaign = () => {
  if (moderationData.length > 0) {
    const newIndex = currentCampaignIndex > 0 ? currentCampaignIndex - 1 : moderationData.length - 1;
    setCurrentCampaignIndex(newIndex);
    updateActiveProgress(newIndex);
  }
};

const goToNextCampaign = () => {
  if (moderationData.length > 0) {
    const newIndex = currentCampaignIndex < moderationData.length - 1 ? currentCampaignIndex + 1 : 0;
    setCurrentCampaignIndex(newIndex);
    updateActiveProgress(newIndex);
  }
};
```

### **3. Mise à jour des données**
```typescript
const updateActiveProgress = (index: number) => {
  if (moderationData[index]) {
    const campaign = moderationData[index];
    const progressData = {
      ...campaign.progress,
      campaignId: campaign.campaignId,
      campaignTitle: campaign.campaignTitle,
      validVotes: campaign.progress.valid_votes || 0,
      refuseVotes: campaign.progress.refuse_votes || 0,
      totalVotes: campaign.progress.total_votes || 0,
      stakedAmount: campaign.progress.staking_pool_total || 0,
      mintPrice: 100,
      stakeYes: 0,
      stakeNo: 0
    };
    setActiveInitialProgress(progressData);
  }
};
```

### **4. Interface utilisateur**
```typescript
{moderationData.length > 1 && (
  <div style={{ /* Styles de navigation */ }}>
    <button onClick={goToPreviousCampaign}>← Précédent</button>
    
    <div>
      <div>Campagne {currentCampaignIndex + 1} sur {moderationData.length}</div>
      <div>{activeInitialProgress?.campaignTitle || 'Campaign Title'}</div>
    </div>
    
    <button onClick={goToNextCampaign}>Suivant →</button>
  </div>
)}
```

## 📊 **Fonctionnement**

### **Navigation circulaire**
- **Première campagne** → ← Précédent → Dernière campagne
- **Dernière campagne** → Suivant → → Première campagne
- **Navigation fluide** entre toutes les campagnes

### **Données dynamiques**
- **Chaque campagne** a ses propres données de modération
- **Donut mis à jour** automatiquement lors du changement
- **Titre et statut** changent selon la campagne sélectionnée

### **Affichage conditionnel**
- **Navigation visible** seulement si plus d'une campagne
- **Compteur précis** : "Campagne 1 sur 9", "Campagne 2 sur 9", etc.
- **Titre dynamique** : "Titre ici", "Autre titre", etc.

## 🎯 **Cas d'usage**

### **Avec 1 campagne**
- **Pas de navigation** : Interface normale sans flèches
- **Donut unique** : Données de la seule campagne

### **Avec plusieurs campagnes**
- **Navigation active** : Flèches visibles et fonctionnelles
- **Donuts différents** : Chaque campagne a ses propres votes
- **Évolution visible** : Progression différente de chaque campagne

### **Exemple avec 9 campagnes**
- **Campagne 1** : 0 votes, statut `PENDING_MODERATION`
- **Campagne 2** : 0 votes, statut `PENDING_MODERATION`
- **Campagne 3** : 0 votes, statut `PENDING_MODERATION`
- **...** : Navigation entre toutes les campagnes

## 🎨 **Design**

### **Style des boutons**
- **Couleur** : Vert (#00FF00) avec effet hover
- **Animation** : Scale au survol (1.05x)
- **Typographie** : Gras, 18px
- **Icônes** : Flèches directionnelles

### **Style du compteur**
- **Couleur principale** : Vert (#00FF00)
- **Couleur secondaire** : Gris clair (#C0C0C0)
- **Centrage** : Alignement au centre
- **Hiérarchie** : Campagne X sur Y + Titre

### **Style du conteneur**
- **Background** : Vert transparent (rgba(0, 255, 0, 0.1))
- **Bordure** : Verte (#00FF00)
- **Espacement** : Padding et margin appropriés
- **Responsive** : Max-width 600px, centré

## 🚀 **Avantages**

### **Pour l'utilisateur**
- **Vue d'ensemble** : Toutes les campagnes en un endroit
- **Navigation intuitive** : Flèches simples et claires
- **Progression visible** : Évolution de chaque campagne
- **Efficacité** : Pas besoin de recharger la page

### **Pour le développement**
- **Code réutilisable** : Fonctions de navigation génériques
- **État centralisé** : Gestion cohérente des données
- **Performance** : Pas de rechargement de données
- **Maintenabilité** : Code organisé et modulaire

## ✅ **Résumé**

Le système de navigation permet :
- ✅ **Navigation fluide** entre toutes les campagnes créées
- ✅ **Donuts dynamiques** pour chaque campagne
- ✅ **Évolution visible** de la modération
- ✅ **Interface intuitive** avec flèches et compteur
- ✅ **Navigation circulaire** sans fin

**Maintenant vous pouvez voir l'évolution de la modération de toutes vos campagnes !** 🎉
