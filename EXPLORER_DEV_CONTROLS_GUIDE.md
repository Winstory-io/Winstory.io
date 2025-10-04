# 🎮 Explorer Dev Controls - Guide d'Utilisation

## Vue d'ensemble

Les Dev Controls ont été ajoutés à l'Explorer dans le même style exact que `/mywin`, vous offrant un contrôle total sur l'interface pendant la phase de développement.

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
- ❌ **Désactivé**: Affiche l'état vide (pas de campagnes)

**Pourquoi**: Permet de basculer entre l'état vide et l'état avec données pour tester les deux UX.

---

### 2. **🎬 Number of Campaigns** (Slider: 1-20)

**Fonction**: Contrôle le nombre total de campagnes générées

**Exemples**:
- `1` = Une seule campagne (test minimal)
- `8` = Nombre par défaut (carousel complet)
- `20` = Charge maximale (test de performance)

**Utilité**: Tester le comportement avec différentes quantités de contenu.

---

### 3. **📊 Base Completion %** (Slider: 0-100%)

**Fonction**: Définit le pourcentage de complétion de base pour toutes les campagnes

**Comment ça marche**:
- Chaque campagne varie de ±20% autour de cette valeur
- Ex: Si base = 50%, les campagnes varient entre 30% et 70%

**Cas d'usage**:
- `0%` = Nouvelles campagnes tout juste lancées
- `45%` = Campagnes en cours
- `75%` = Campagnes presque terminées
- `100%` = Campagnes complétées

---

### 4. **⏱ Time Left** (Slider: 0-168h)

**Fonction**: Définit le temps restant avant la fin des campagnes

**Incréments**: Par pas de 12h

**Valeurs notables**:
- `0h` = Campagne terminée
- `12h` = Urgence - se termine bientôt
- `48h` = 2 jours restants (par défaut)
- `72h` = 3 jours
- `168h` = 1 semaine

**Note**: Quand = 0, affiche "Ended" au lieu de "Xh left"

---

### 5. **📱 Video Orientation** (Boutons: 16:9 / 9:16 / Mixed)

**Fonction**: Contrôle l'orientation des vidéos affichées

**Options**:
- **16:9 (Horizontal)**: Toutes les vidéos en format paysage
- **9:16 (Vertical)**: Toutes les vidéos en format portrait
- **Mixed**: Alternance automatique (1 verticale toutes les 3)

**Utilité**: Tester les deux formats supportés par Winstory

---

### 6. **Campaign Types** (Checkboxes)

#### 🏢 Company Campaigns
**Fonction**: Affiche/masque les campagnes d'entreprises B2C

**Quand activé**:
- Les campagnes paires (0, 2, 4...) ont un `companyName`
- Visibles dans le sous-onglet "Company to Complete"

#### 👥 Community Campaigns
**Fonction**: Affiche/masque les campagnes communautaires

**Quand activé**:
- Les campagnes impaires (1, 3, 5...) ont un `creatorWallet`
- Visibles dans le sous-onglet "Community to Complete"

**Astuce**: Décochez l'un pour tester le filtrage par type

---

### 7. **🏆 Podium Size** (Slider: 1-3)

**Fonction**: Contrôle le nombre de gagnants affichés sur le podium

**⚠️ Visible uniquement** quand l'onglet **"Best Completions"** est actif

**Options**:
- `1` = Seulement le champion (1ère place)
- `2` = Champion + Runner-up (1er + 2ème)
- `3` = Podium complet (1er + 2ème + 3ème)

**Utilité**: Tester l'affichage avec différentes tailles de podium

---

### 8. **Current Tab Info** (Informations en temps réel)

**Affiche**:
- **Active Tab**: Quel onglet principal est sélectionné
- **Sub-Tab**: Quel sous-onglet est actif (si applicable)
- **Showing**: Nombre exact de campagnes affichées

**Utilité**: Vérifier que les filtres fonctionnent correctement

---

### 9. **🎮 Quick Actions** (Boutons rapides)

#### 🚀 New Campaigns
**Action**: Configure l'état "nouvelles campagnes"
```
Completion: 0%
Time Left: 72h
```

#### ✅ Completed
**Action**: Configure l'état "campagnes terminées"
```
Completion: 100%
Time Left: 0h (Ended)
```

#### ⏰ Ending Soon
**Action**: Configure l'état "urgence"
```
Completion: 75%
Time Left: 12h
```

#### 📊 Max Load
**Action**: Charge maximale de test
```
Campaign Count: 20
Company: ✅ Activé
Community: ✅ Activé
```

**Utilité**: Passer rapidement entre différents scénarios de test

---

## 🎯 Scénarios de Test Recommandés

### Test 1: État Vide
```
📊 Show Mock Campaigns: ❌ Désactivé
```
**Vérifier**: Les messages d'état vide s'affichent correctement dans les 3 onglets

---

### Test 2: Campagnes Actives - Company Only
```
📊 Show Mock Campaigns: ✅ Activé
🎬 Number of Campaigns: 8
📊 Base Completion: 45%
⏱ Time Left: 48h
🏢 Company Campaigns: ✅ Activé
👥 Community Campaigns: ❌ Désactivé
```
**Vérifier**: 
- Onglet "Active Creations" → Sous-onglet "Company to Complete"
- Carousel fonctionne avec navigation
- Hover effects sur les cartes

---

### Test 3: Campagnes Actives - Community Only
```
📊 Show Mock Campaigns: ✅ Activé
🎬 Number of Campaigns: 8
📊 Base Completion: 45%
⏱ Time Left: 48h
🏢 Company Campaigns: ❌ Désactivé
👥 Community Campaigns: ✅ Activé
```
**Vérifier**:
- Onglet "Active Creations" → Sous-onglet "Community to Complete"
- Les wallets s'affichent au lieu des noms de compagnie

---

### Test 4: Best Completions - Podium Complet
```
📊 Show Mock Campaigns: ✅ Activé
🎬 Number of Campaigns: 3
🏆 Podium Size: 3
Onglet: Best Completions
```
**Vérifier**:
- Podium avec 3 positions (2ème, 1er, 3ème)
- Hauteurs différentes des bases
- Badges de rang (1, 2, 3)
- Récompenses premium affichées

---

### Test 5: Best Completions - Champion Seul
```
📊 Show Mock Campaigns: ✅ Activé
🎬 Number of Campaigns: 1
🏆 Podium Size: 1
Onglet: Best Completions
```
**Vérifier**:
- Affichage avec un seul gagnant
- Card la plus grande
- Badge gold

---

### Test 6: All Campaigns - Mosaïque Mixte
```
📊 Show Mock Campaigns: ✅ Activé
🎬 Number of Campaigns: 12
📱 Video Orientation: Mixed
🏢 Company Campaigns: ✅ Activé
👥 Community Campaigns: ✅ Activé
Onglet: All
```
**Vérifier**:
- Grille responsive
- Filtres fonctionnent (All, Companies, Community, Completed)
- Sort dropdown fonctionne
- Bouton "Load More" apparaît (si ≥12 campagnes)

---

### Test 7: Vidéos Verticales Uniquement
```
📊 Show Mock Campaigns: ✅ Activé
🎬 Number of Campaigns: 8
📱 Video Orientation: 9:16 (Vertical)
```
**Vérifier**:
- Toutes les cards sont en format portrait
- Ratios d'aspect corrects (360x640)
- Hover effects adaptés

---

### Test 8: Vidéos Horizontales Uniquement
```
📊 Show Mock Campaigns: ✅ Activé
🎬 Number of Campaigns: 8
📱 Video Orientation: 16:9 (Horizontal)
```
**Vérifier**:
- Toutes les cards sont en format paysage
- Ratios d'aspect corrects (640x360)
- Layout cohérent

---

### Test 9: Campagnes en Urgence
```
Quick Action: ⏰ Ending Soon
(ou manuellement: Completion 75%, Time 12h)
```
**Vérifier**:
- Barres de progression à ~75%
- "12h left" affiché
- État d'urgence visible

---

### Test 10: Charge Maximale
```
Quick Action: 📊 Max Load
(ou manuellement: 20 campagnes, tous types activés)
```
**Vérifier**:
- Performance avec 20 items
- Scroll smooth dans carousel
- Grille bien organisée dans "All"
- Pas de lag

---

## 🔄 Comportement Dynamique

### Filtrage Automatique par Onglet

#### Active Creations
- Filtre automatiquement les campagnes avec `completionPercentage < 100%`
- Respecte le sous-onglet sélectionné (Company vs Community)

#### Best Completions
- Affiche uniquement les campagnes avec un `rank` (1, 2, ou 3)
- Limite au nombre défini par "Podium Size"

#### All
- Affiche toutes les campagnes générées
- Filtrage manuel via les boutons (All/Companies/Community/Completed)

---

## 💡 Astuces d'Utilisation

### 1. Tester les Transitions
1. Activez "Show Mock Campaigns"
2. Changez d'onglet (Active → Best → All)
3. Observez les animations de transition

### 2. Tester les Empty States
1. Désactivez "Show Mock Campaigns"
2. Parcourez les 3 onglets
3. Vérifiez que les messages appropriés s'affichent

### 3. Tester le Responsive
1. Activez "Max Load" (20 campagnes)
2. Redimensionnez votre fenêtre
3. Vérifiez que la grille s'adapte

### 4. Tester les Modales
1. Activez quelques campagnes
2. Cliquez sur le bouton "i" d'une card
3. Vérifiez le CampaignInfoModal
4. Testez les informations affichées

### 5. Tester les Filtres
1. Onglet "All" avec 20 campagnes
2. Cliquez sur "Companies" puis "Community"
3. Vérifiez que le compteur change
4. Testez le sort "Recent" vs "Popular"

---

## 🐛 Debug et Résolution de Problèmes

### Aucune campagne n'apparaît
**Solution**: Vérifiez que:
1. ✅ "Show Mock Campaigns" est activé
2. ✅ Au moins un type (Company/Community) est coché
3. ✅ "Number of Campaigns" > 0

### Podium vide
**Solution**: Assurez-vous que:
1. ✅ Vous êtes sur l'onglet "Best Completions"
2. ✅ "Podium Size" > 0
3. ✅ "Number of Campaigns" ≥ "Podium Size"

### Filtres ne fonctionnent pas
**Solution**:
1. Rafraîchissez la page
2. Réactivez "Show Mock Campaigns"
3. Vérifiez la section "Current Tab Info"

---

## 🚀 Workflow de Développement Recommandé

### Phase 1: Tests de Base
1. Tester tous les états vides
2. Tester avec 1 campagne
3. Tester avec 8 campagnes (normal)

### Phase 2: Tests de Filtrage
1. Tester Company only
2. Tester Community only
3. Tester les deux types
4. Tester les filtres de l'onglet "All"

### Phase 3: Tests Visuels
1. Tester orientation horizontale
2. Tester orientation verticale
3. Tester orientation mixte
4. Vérifier les hover effects

### Phase 4: Tests de Performance
1. Tester avec 20 campagnes
2. Tester le scroll dans le carousel
3. Tester le responsive
4. Vérifier les animations

### Phase 5: Tests d'Intégration
1. Désactiver les Dev Controls
2. Commencer l'intégration API réelle
3. Remplacer progressivement les mock data

---

## 📊 Données Générées

### Structure des Campagnes Mock

Chaque campagne générée contient:

```typescript
{
  id: "campaign-0",
  title: "Epic Brand Challenge #1" ou "Community Story Quest #1",
  companyName: "Brand1" (si pair),
  creatorWallet: "0x..." (si impair),
  thumbnail: "https://picsum.photos/seed/0/640/360",
  videoUrl: "https://example.com/video-0",
  orientation: "horizontal" | "vertical",
  completionPercentage: 45 (±20%),
  timeLeft: "48h left",
  standardReward: "10 WINC",
  premiumReward: "50 USDT + NFT",
  completionPrice: "0.05 USDT",
  startingStory: "This is an amazing...",
  guidelines: "Be creative, follow the theme...",
  rank: 1, 2, ou 3 (seulement pour Best Completions)
}
```

### Images de Placeholder

Les thumbnails utilisent [Picsum Photos](https://picsum.photos/):
- Seed basé sur l'index pour la cohérence
- Dimensions adaptées à l'orientation
- Rechargement cohérent entre les sessions

---

## 🔐 Sécurité

**✅ Production Safe**:
- Contrôles masqués automatiquement en production
- Condition: `process.env.NODE_ENV !== 'production'`
- Aucun impact sur le bundle de production

**✅ Données Isolées**:
- Mock data séparé des vraies données
- Pas d'impact sur la base de données
- Toggle on/off instantané

---

## 📝 Notes pour l'Intégration API

Quand vous serez prêt à intégrer l'API réelle:

1. **Gardez le système de Dev Controls**
   ```typescript
   if (devShowMockData) {
     // Use mock data
   } else {
     // Call real API
   }
   ```

2. **Utilisez le même format `CampaignVideo`**
   - Transformez les données API pour matcher ce format
   - Les composants fonctionneront immédiatement

3. **Testez en parallèle**
   - Activez mock data = tester l'UI
   - Désactivez = tester l'API réelle

---

## ✅ Checklist avant l'Intégration

- [ ] Testé tous les états vides
- [ ] Testé les 3 onglets principaux
- [ ] Testé les sous-onglets (Company/Community)
- [ ] Testé le podium avec 1, 2, et 3 gagnants
- [ ] Testé les filtres dans "All"
- [ ] Testé les deux orientations vidéo
- [ ] Testé avec 1, 8, et 20 campagnes
- [ ] Testé les quick actions
- [ ] Testé le responsive
- [ ] Testé les modales
- [ ] Vérifié les animations
- [ ] Testé sur mobile/tablet/desktop

---

**🎉 Les Dev Controls sont prêts à l'emploi!**

Vous avez maintenant un contrôle total sur l'Explorer pendant le développement. Utilisez-les pour peaufiner chaque détail avant la mise en production.

---

*Version: 1.0.0*  
*Dernière mise à jour: 4 octobre 2025*

