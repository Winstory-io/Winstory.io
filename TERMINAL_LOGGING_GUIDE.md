# Terminal Logging Guide - Affichage dans Cursor

## 🎯 Objectif

En plus des `console.log()` dans le navigateur, **toutes les données du formulaire sont maintenant affichées dans le terminal Cursor** lorsque vous cliquez sur le bouton **"Confirm"** à la fin du processus de création de campagne.

## 🚀 Comment ça fonctionne

### Architecture

1. **Frontend** (Page Recap) : Envoie les données via une requête POST
2. **Backend API** (Route `/api/log-campaign`) : Reçoit et affiche dans le terminal
3. **Terminal Cursor** : Affiche toutes les informations en temps réel

### Workflow

```
User clicks "Confirm" → Frontend sends POST request → API logs to terminal → User sees data in Cursor
```

## 📁 Fichiers modifiés/créés

### 1. Nouvel endpoint API
**`app/api/log-campaign/route.ts`** ✨ (nouveau fichier)
- Reçoit les données de la campagne
- Les affiche dans le terminal Cursor avec un format clair
- Supporte les flows B2C et Individual

### 2. Page Recap B2C
**`app/creation/b2c/recap/page.tsx`**
- Modifié la fonction `handleConfirm` pour être async
- Ajoute un appel `fetch()` vers `/api/log-campaign`
- Envoie toutes les données du formulaire

### 3. Page Recap Individual
**`app/creation/individual/recap/page.tsx`**
- Modifié la fonction `handleConfirm` pour être async
- Ajoute un appel `fetch()` vers `/api/log-campaign`
- Envoie les données spécifiques au flow Individual

## 📊 Format d'affichage dans le terminal

### Flow B2C Company

```
═══════════════════════════════════════════════════════════════
🎬 CREATE CAMPAIGN - FINAL SUBMISSION (B2C)
═══════════════════════════════════════════════════════════════

👤 USER INFORMATION:
───────────────────────────────────────────────────────────────
  📧 Email: contact@company.com
  🏢 Company Name: Nike

📖 STORY INFORMATION:
───────────────────────────────────────────────────────────────
  📝 Title: Just Do It
  📄 Starting Story:
      In a world where dreams meet determination...
  📋 Guideline:
      Focus on inspiring content...

🎥 FILM INFORMATION:
───────────────────────────────────────────────────────────────
  🤖 AI Film Requested: No
  📹 Video File: campaign_video.mp4
  📐 Video Format: horizontal
  💾 File Size: 25.50 MB

💰 ROI & REWARDS DATA:
───────────────────────────────────────────────────────────────
  💵 Unit Value: $25
  📈 Net Profit: $5000
  🎯 Max Completions: 440
  🆓 Free Reward: No
  ❌ No Reward: No

🎁 STANDARD REWARDS:
───────────────────────────────────────────────────────────────
  🪙 Token Reward:
     Name: USDC
     Contract: 0x...
     Blockchain: Ethereum
     Standard: ERC20
     Amount per User: 10
     Total Amount: 4400.00000
     Has Enough Balance: Yes

🏆 PREMIUM REWARDS (Top 3):
───────────────────────────────────────────────────────────────
  🪙 Token Reward:
     Name: USDC
     Contract: 0x...
     Blockchain: Ethereum
     Standard: ERC20
     Amount per User: 50

═══════════════════════════════════════════════════════════════
✅ Campaign data logged successfully in terminal
═══════════════════════════════════════════════════════════════
```

### Flow Individual Creator

```
═══════════════════════════════════════════════════════════════
🎬 CREATE CAMPAIGN - FINAL SUBMISSION (INDIVIDUAL)
═══════════════════════════════════════════════════════════════

👤 USER INFORMATION:
───────────────────────────────────────────────────────────────
  📧 Email: Individual Creator
  🏢 Company Name: Individual Creator

📖 STORY INFORMATION:
───────────────────────────────────────────────────────────────
  📝 Title: My Creative Story
  📄 Starting Story: ...
  📋 Guideline: ...

🎥 FILM INFORMATION:
───────────────────────────────────────────────────────────────
  🤖 AI Film Requested: No
  📹 Video File: my_video.mp4
  📐 Video Format: vertical
  💾 File Size: 15.30 MB

🎯 INDIVIDUAL CREATOR COMPLETIONS:
───────────────────────────────────────────────────────────────
  💵 Unit Price: $5
  📊 Max Completions: 100
  ⏱️  Campaign Duration: 7 days

💰 ECONOMIC SIMULATION DATA:
───────────────────────────────────────────────────────────────
  🏦 MINT Price: $100
  💎 Total Pool: $500
  👨‍💼 Creator Gain: $250
  📈 Creator Net Gain: $150
  ✅ Is Creator Profitable: Yes
  📊 Completion Rate: 50%
  🏆 Top 1 Reward: $100
  🥈 Top 2 Reward: $60
  🥉 Top 3 Reward: $40
  🎮 Platform Share: $50
  👥 Moderators Share: $50

═══════════════════════════════════════════════════════════════
✅ Campaign data logged successfully in terminal
═══════════════════════════════════════════════════════════════
```

## 🎨 Caractéristiques du format

### Emojis et symboles
- 🎬 En-tête principal
- 👤 Informations utilisateur
- 📖 Story
- 🎥 Film
- 💰 ROI/Rewards
- 🎁 Standard Rewards
- 🏆 Premium Rewards
- 🎯 Completions (Individual)
- ✅ Succès

### Séparateurs visuels
- `═══...═══` : Séparateur principal
- `───...───` : Séparateur de section
- Indentation claire avec espaces

### Codes couleurs (dans le terminal)
- Les emojis ajoutent de la couleur naturellement
- Format clair et lisible
- Structure hiérarchique visible

## 📝 Données loggées

### B2C Flow
✅ User Information (email, company name)
✅ Story Information (title, starting story, guideline)
✅ Film Information (AI requested, file, format, size)
✅ ROI/Rewards Data (unit value, net profit, max completions, free/no reward)
✅ Standard Rewards (tokens, items, access - with full details)
✅ Premium Rewards (tokens, items, access - with full details)
✅ Unified Config (reward counts)

### Individual Flow
✅ User Information (as "Individual Creator")
✅ Story Information (title, starting story, guideline)
✅ Film Information (file, format, size)
✅ Completions Data (unit price, max completions, duration)
✅ Economic Simulation (MINT price, pool, gains, rewards distribution)

## 🔧 Utilisation

### Pour les développeurs

1. **Lancer le serveur Next.js** :
   ```bash
   npm run dev
   ```

2. **Ouvrir le terminal dans Cursor** (celui où tourne le serveur)

3. **Suivre le processus de création de campagne**

4. **Cliquer sur "Confirm"** dans la page Recap

5. **Observer le terminal** : Toutes les données s'affichent automatiquement

### Avantages

✅ **Visibilité totale** : Voir exactement ce qui est soumis
✅ **Debug facile** : Identifier rapidement les problèmes de données
✅ **Trace server-side** : Logs côté serveur (pas seulement navigateur)
✅ **Format lisible** : Structure claire avec emojis et séparateurs
✅ **Support multi-flow** : B2C et Individual

## 🔍 Exemples d'utilisation

### Scénario 1 : Test d'une campagne B2C
1. Remplir tous les champs du formulaire
2. Cliquer sur "Confirm" dans la page Recap
3. Vérifier dans le terminal que toutes les données sont correctes
4. Si erreur → corriger et retester

### Scénario 2 : Debug d'un problème de rewards
1. Configurer les rewards (standard et premium)
2. Arriver à la page Recap
3. Cliquer sur "Confirm"
4. Vérifier dans le terminal les montants calculés
5. Comparer avec les valeurs attendues

### Scénario 3 : Validation avant MINT
1. Compléter tout le processus
2. Vérifier le terminal pour la cohérence des données
3. S'assurer que tous les contrats sont corrects
4. Vérifier les balances de tokens
5. Procéder au MINT en toute confiance

## ⚠️ Notes importantes

### Sécurité
- ✅ Les données ne contiennent PAS d'informations de paiement sensibles
- ✅ Les logs sont UNIQUEMENT côté serveur (visibles dans Cursor)
- ✅ Aucune donnée n'est stockée ou envoyée ailleurs

### Performance
- ⚡ Appel API async (non-bloquant)
- ⚡ Pas d'impact sur l'UX utilisateur
- ⚡ Le processus continue même si l'API échoue

### Environnement
- 🔧 Fonctionne en développement (`npm run dev`)
- 🔧 Fonctionne en production (si logs activés)
- 🔧 Les logs s'affichent dans le terminal où tourne Next.js

## 🐛 Dépannage

### Le terminal n'affiche rien
1. Vérifier que le serveur Next.js tourne
2. Vérifier que vous regardez le bon terminal
3. Vérifier la console du navigateur pour les erreurs réseau

### Erreur 500 dans l'API
1. Vérifier le format des données envoyées
2. Vérifier les logs d'erreur dans le terminal
3. Vérifier que le fichier `route.ts` est correct

### Données manquantes
1. Vérifier que localStorage contient les données
2. Vérifier que `recap` state est bien rempli
3. Ajouter des `console.log()` pour debug

## 📚 Fichiers de référence

```
app/
  api/
    log-campaign/
      route.ts          ← Endpoint API (nouveau)
  creation/
    b2c/
      recap/
        page.tsx        ← Modifié (appel API)
    individual/
      recap/
        page.tsx        ← Modifié (appel API)
```

## 🎓 Pour aller plus loin

### Personnaliser le format
Éditer `app/api/log-campaign/route.ts` pour :
- Ajouter plus de sections
- Changer les emojis
- Modifier la structure
- Ajouter des calculs

### Ajouter d'autres données
Dans les pages recap, ajouter des champs au body du `fetch()` :
```typescript
body: JSON.stringify({
  ...existingData,
  myNewField: myNewValue
})
```

### Logger d'autres étapes
Créer d'autres endpoints API :
- `/api/log-film` pour la page film
- `/api/log-rewards` pour les rewards
- etc.

---

**Date de création** : 16 janvier 2025
**Version** : 1.0
**Compatibilité** : Next.js 14+, React 18+

