# 🎮 Completion Dev Controls - Guide d'Utilisation

## Vue d'ensemble

Les Dev Controls ont été ajoutés à la page `/completion` dans le même style exact que `/mywin` et `/explorer`, vous offrant un contrôle total sur l'interface pendant la phase de développement.

**⚠️ Important**: Ces contrôles sont uniquement visibles en mode développement (`NODE_ENV !== 'production'`) et ne seront jamais affichés en production.

---

## 📍 Localisation

Les Dev Controls apparaissent en bas à droite de l'écran sous forme d'un bouton jaune **"Dev Controls"**.

Cliquez dessus pour ouvrir le panneau de contrôle complet.

---

## 🎛️ Contrôles Disponibles

### 1. **📊 Show Mock Campaigns** (Toggle Principal)

**Fonction**: Active/désactive l'affichage des données de test

**Utilisation**:
- ✅ **Activé**: Affiche des campagnes générées automatiquement
- ❌ **Désactivé**: Affiche les vraies données de l'API

**Pourquoi**: Permet de basculer entre l'état réel et l'état avec données de test pour tester les deux UX.

---

### 2. **🎬 Campaign Generation**

#### **Number of Campaigns** (Slider: 1-20)
- **Fonction**: Contrôle le nombre total de campagnes générées
- **Exemples**:
  - `1` = Une seule campagne (test minimal)
  - `8` = Nombre par défaut (carousel complet)
  - `20` = Charge maximale (test de performance)

#### **Base Completion %** (Slider: 0-100%)
- **Fonction**: Définit le pourcentage de complétion de base pour toutes les campagnes
- **Comment ça marche**:
  - Chaque campagne varie de ±20% autour de cette valeur
  - Ex: Si base = 50%, les campagnes varient entre 30% et 70%

#### **Time Left** (Slider: 0-168h)
- **Fonction**: Définit le temps restant avant la fin des campagnes
- **Incréments**: Par pas de 12h
- **Valeurs notables**:
  - `0h` = Campagne terminée
  - `12h` = Urgence - se termine bientôt
  - `72h` = 3 jours (défaut)
  - `168h` = 1 semaine complète

---

### 3. **📱 Video Controls**

#### **Video Orientation** (3 boutons)
- **16:9**: Format horizontal (landscape)
- **9:16**: Format vertical (portrait)
- **Mixed**: Mélange des deux formats

**Utilité**: Tester le comportement avec différentes orientations de vidéos.

---

### 4. **🏢 Campaign Types**

#### **B2C Companies** (Checkbox)
- **Fonction**: Toggle pour afficher/masquer les campagnes d'entreprises
- **Filtre**: Appliqué automatiquement dans l'onglet B2C

#### **Individual Creators** (Checkbox)
- **Fonction**: Toggle pour afficher/masquer les campagnes individuelles
- **Filtre**: Appliqué automatiquement dans l'onglet Individuals

---

### 5. **💰 Reward Range**

#### **Min Reward** (Slider: 1-200 $WINC)
- **Fonction**: Définit la récompense minimale
- **Défaut**: 10 $WINC

#### **Max Reward** (Slider: 1-200 $WINC)
- **Fonction**: Définit la récompense maximale
- **Défaut**: 100 $WINC

**Utilité**: Tester différents niveaux de récompenses pour voir l'impact sur l'engagement.

---

### 6. **📊 Campaign Status**

#### **Status Selection** (3 boutons)
- **Active**: Campagnes en cours normal
- **Completed**: Campagnes terminées
- **Ending Soon**: Campagnes se terminant bientôt

**Utilité**: Tester différents états de campagne pour voir les comportements correspondants.

---

### 7. **🎮 Interaction Controls**

#### **Force Tooltip Open** (Checkbox)
- **Fonction**: Force l'ouverture du tooltip d'aide
- **Utilité**: Tester l'interface du tooltip sans interaction utilisateur

#### **Force Info Modal** (Checkbox)
- **Fonction**: Force l'ouverture de la modal d'informations
- **Utilité**: Tester l'interface de la modal d'informations

#### **Auto Navigate** (Checkbox + Slider)
- **Fonction**: Navigation automatique entre les vidéos
- **Speed**: Contrôle la vitesse de navigation (1000-10000ms)
- **Utilité**: Tester le comportement de navigation automatique

---

### 8. **🚀 Quick Actions** (4 boutons)

#### **🚀 New Campaigns**
- **Configuration**: 5 campagnes, 0% completion, 72h left, status active
- **Utilité**: Simuler des campagnes fraîchement lancées

#### **✅ Completed**
- **Configuration**: 8 campagnes, 100% completion, 0h left, status completed
- **Utilité**: Simuler des campagnes terminées

#### **⏰ Ending Soon**
- **Configuration**: 6 campagnes, 75% completion, 12h left, status ending_soon
- **Utilité**: Simuler des campagnes en fin de vie

#### **📊 Max Load**
- **Configuration**: 20 campagnes, 50% completion, 48h left, tous types
- **Utilité**: Tester la performance avec le maximum de contenu

---

## 🎯 Cas d'Usage Recommandés

### **Test d'Interface Vide**
1. Désactiver "Show Mock Campaigns"
2. Tester les messages d'état vide
3. Vérifier les transitions entre onglets

### **Test de Performance**
1. Activer "Show Mock Campaigns"
2. Utiliser "Max Load" (20 campagnes)
3. Tester la navigation et les interactions

### **Test de Navigation**
1. Activer "Auto Navigate"
2. Régler la vitesse à 2000ms
3. Observer le comportement de navigation automatique

### **Test de Formats Vidéo**
1. Sélectionner "16:9" ou "9:16"
2. Naviguer entre les vidéos
3. Vérifier l'affichage des différents formats

### **Test d'États de Campagne**
1. Utiliser "New Campaigns" pour tester l'état initial
2. Utiliser "Ending Soon" pour tester l'urgence
3. Utiliser "Completed" pour tester l'état final

---

## 🔧 Fonctionnalités Techniques

### **Génération de Données Mock**
- **Noms d'entreprises**: Nike, Apple, Tesla, Spotify, Netflix, Airbnb, Uber, Stripe
- **Noms individuels**: Alex Chen, Maria Rodriguez, James Wilson, etc.
- **Titres de campagnes**: 8 titres variés et réalistes
- **Histoires de départ**: 8 histoires engageantes et différentes
- **Évaluations AI**: Scores 60-100, tiers S/A/B/C, probabilité de collaboration 70-100%

### **Variations Automatiques**
- **Completion %**: ±20% autour de la valeur de base
- **Time Left**: ±12h autour de la valeur définie
- **Rewards**: Aléatoire dans la plage définie
- **Dates**: Création dans les 30 derniers jours, approbation dans les 7 derniers jours

### **Filtrage Intelligent**
- **Respect des Dev Controls**: Les filtres B2C/Individual sont appliqués
- **Cohérence des données**: Les campagnes respectent leur type de créateur
- **Navigation fluide**: Réinitialisation de l'index lors des changements

---

## 🚀 Utilisation en Développement

1. **Démarrer le serveur de développement**
2. **Naviguer vers `/completion`**
3. **Cliquer sur "Dev Controls" en bas à droite**
4. **Activer "Show Mock Campaigns"**
5. **Configurer les paramètres selon vos besoins**
6. **Tester les différentes interactions**

---

## 📝 Notes Importantes

- **Mode Production**: Les Dev Controls sont automatiquement désactivés
- **Performance**: Les données mock sont générées côté client
- **Persistance**: Les paramètres ne sont pas sauvegardés entre les sessions
- **Compatibilité**: Compatible avec tous les navigateurs modernes

---

## 🎉 Résumé

Le système de Dev Controls pour `/completion` offre un contrôle total sur :
- ✅ **Génération de campagnes** (nombre, completion, temps)
- ✅ **Formats vidéo** (orientation, types)
- ✅ **Types de campagnes** (B2C, Individual)
- ✅ **Récompenses** (plage min/max)
- ✅ **États de campagne** (active, completed, ending soon)
- ✅ **Interactions** (tooltips, modals, navigation)
- ✅ **Actions rapides** (scénarios prédéfinis)

Cela permet de tester exhaustivement tous les aspects de l'interface de completion pendant la phase de développement.
