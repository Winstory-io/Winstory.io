# Logique de Statut des Campagnes - Explorer

## 🎯 Définition : Campagne Active vs Inactive

Une campagne est considérée comme **INACTIVE** dans l'un de ces cas :

### 1. ⏱ Temps Écoulé (Time Ended)
- `timeLeft = null` ou vide
- `timeLeft = "Ended"`
- `timeLeft = "0h left"`
- `timeLeft` contient "0h" ou "expired"

**Origine** : 
- Décompte commence après validation par consensus des modérateurs
- Durée standard : **7 jours (168 heures)**
- Une fois le temps écoulé, impossible de compléter

### 2. ✅ Complétions Complètes (100%)
- `completionPercentage = 100`
- Tous les slots de complétion sont remplis
- Nombre maximum de complétions atteint

**Exemple** :
- Si max = 1000 complétions
- Et 1000 complétions mintées
- → Campagne inactive (même si temps restant)

## 🔍 Logique d'Affichage dans CampaignInfoModal

```typescript
const isTimeEnded = !campaign.timeLeft || 
                   campaign.timeLeft === 'Ended' || 
                   campaign.timeLeft === '0h left' ||
                   campaign.timeLeft.includes('0h') ||
                   campaign.timeLeft.includes('expired');

const isFullyCompleted = campaign.completionPercentage === 100;

const isCampaignActive = !campaign.rank && !isTimeEnded && !isFullyCompleted;
const isCampaignInactive = !campaign.rank && (isTimeEnded || isFullyCompleted);
```

## 📊 Matrice de Décision

| Condition | rank | timeLeft | completion% | Affichage |
|-----------|------|----------|-------------|-----------|
| **Campagne Active** | ❌ | > 0h | < 100% | 🟢 Bouton "Complete" |
| **Temps écoulé** | ❌ | 0h/Ended | < 100% | 🟡 "⏱ Campaign Ended" |
| **Complétions pleines** | ❌ | > 0h | 100% | 🟡 "✅ All Completions Minted" |
| **Les deux** | ❌ | 0h/Ended | 100% | 🟡 "✅ All Completions Minted" |
| **Podium (rank 1-3)** | ✅ | N/A | N/A | ⚪ Rien (lecture seule) |
| **Best Initial** | ❌ | 0h/Ended | 100% | 🟡 Message inactif |

## 🎨 Messages d'Inactivité

### Si Complétions Complètes (100%)
```
┌─────────────────────────────────┐
│  ✅ All Completions Minted      │
└─────────────────────────────────┘
```
- Border : 2px solid rgba(255, 214, 0, 0.3)
- Background : rgba(255, 214, 0, 0.1)
- Color : #FFD600

### Si Temps Écoulé (0h)
```
┌─────────────────────────────────┐
│      ⏱ Campaign Ended           │
└─────────────────────────────────┘
```
- Même style visuel
- Indique que le délai de 7 jours est dépassé

## 🔐 Protection Anti-Plagiat dans "Best Completions"

### Vidéo Initiale (Liseré Vert)
- Toujours `timeLeft = "Ended"` ou undefined
- Toujours `completionPercentage = 100`
- **Résultat** : Message d'inactivité, pas de bouton Complete
- **Raison** : Éviter le plagiat des vidéos exemplaires

### Top 3 Complétions (Podium)
- `rank = 1, 2, ou 3`
- **Résultat** : Aucun bouton ni message
- **Raison** : Mode lecture seule, inspiration uniquement

## 📅 Timeline d'une Campagne

```
1. Création
   ↓
2. Validation par consensus des modérateurs ✅
   ↓
3. Décompte commence : 168 heures (7 jours)
   ↓
4. État ACTIF :
   - Bouton "Complete" visible
   - timeLeft > 0
   - completionPercentage < 100%
   ↓
5. État INACTIF (l'un ou l'autre) :
   a) Temps écoulé (7 jours passés)
   b) 100% des complétions mintées
   ↓
6. Mode lecture seule / Archivage
```

## 🎯 Cas d'Usage

### Cas 1 : Campagne Active
**Données** :
- `timeLeft: "48h left"`
- `completionPercentage: 45`
- `rank: undefined`

**Affichage** : Bouton "Complete" vert

### Cas 2 : Temps Écoulé
**Données** :
- `timeLeft: "Ended"`
- `completionPercentage: 75`
- `rank: undefined`

**Affichage** : "⏱ Campaign Ended"

### Cas 3 : Complétions Pleines
**Données** :
- `timeLeft: "24h left"`
- `completionPercentage: 100`
- `rank: undefined`

**Affichage** : "✅ All Completions Minted"

### Cas 4 : Best Completions (Initial)
**Données** :
- `timeLeft: undefined` ou "Ended"
- `completionPercentage: 100`
- `rank: undefined`

**Affichage** : "✅ All Completions Minted"

### Cas 5 : Best Completions (Podium)
**Données** :
- `rank: 1` (ou 2, 3)

**Affichage** : Rien (juste les infos de la campagne)

## 🔧 Intégration Backend (Future)

Lors de la récupération des campagnes :

```typescript
const campaign = {
  id: 'xxx',
  timeLeft: calculateTimeLeft(approvedAt, 168), // 168 heures
  completionPercentage: (minted / maxCompletions) * 100,
  // ...
};

function calculateTimeLeft(approvedAt: Date, durationHours: number): string {
  const now = new Date();
  const endTime = new Date(approvedAt.getTime() + durationHours * 60 * 60 * 1000);
  const hoursLeft = Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (hoursLeft <= 0) return 'Ended';
  if (hoursLeft < 24) return `${hoursLeft}h left`;
  const daysLeft = Math.floor(hoursLeft / 24);
  return `${daysLeft} days left`;
}
```

## ✅ Avantages de cette Logique

1. **Double condition de sécurité** : Temps OU complétions
2. **Clarté pour l'utilisateur** : Message précis selon le cas
3. **Protection anti-plagiat** : Best Completions en lecture seule
4. **Équité** : Limite de temps claire (7 jours)
5. **Gestion intelligente** : Même si temps restant, si 100% → stop

---

**Date de création** : 10 Octobre 2025
**Auteur** : Assistant IA
**Status** : ✅ Logique implémentée et documentée

