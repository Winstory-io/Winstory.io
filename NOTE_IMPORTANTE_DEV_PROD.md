# ⚠️ NOTE IMPORTANTE : Upload S3 - Développement vs Production

## 🎯 Résumé court

### Actuellement (Phase DEV) :
✅ **Upload S3 lors de la CONFIRMATION** sur la page Recap

### En Production (futur) :
✅ **Upload S3 lors du PAIEMENT/MINT** (après confirmation de paiement)

---

## 💡 Pourquoi ce choix ?

### Phase DÉVELOPPEMENT (maintenant)
- Upload immédiat lors de la confirmation
- **Avantage** : Tests faciles de l'intégration S3
- **Inconvénient** : Coûts S3 même si l'utilisateur ne paie pas

### Phase PRODUCTION (futur)
- Upload seulement après paiement confirmé
- **Avantage** : Économie de coûts (pas de stockage pour les abandons)
- **Avantage** : Seules les campagnes payées sont stockées

---

## 💰 Impact sur les coûts

Avec **10 000 utilisateurs/mois** et un taux d'abandon de 30% :

**Stratégie DEV (actuelle) :**
- 10 000 vidéos uploadées
- 3 000 abandons = 3 000 vidéos inutiles sur S3
- **Coût mensuel inutile : ~$35**

**Stratégie PROD (future) :**
- 7 000 vidéos uploadées (seulement celles payées)
- 0 vidéos inutiles
- **Économie annuelle : ~$420**

---

## 📝 Où est-ce documenté dans le code ?

Les fichiers suivants contiennent des commentaires `⚠️ DEV ONLY` :

- `/app/creation/b2c/recap/page.tsx` (ligne ~218)
- `/app/creation/individual/recap/page.tsx` (ligne ~468)
- `/app/creation/agencyb2c/recap/page.tsx` (ligne ~209)

Chaque commentaire indique :
```typescript
// ⚠️ DEV ONLY: Upload S3 lors de la confirmation pour tester l'intégration
// TODO PROD: Déplacer cet upload vers handlePaymentSuccess() pour éviter
// les coûts de stockage S3 pour les utilisateurs qui ne paient pas
// Voir S3_UPLOAD_STRATEGY.md pour plus de détails
```

---

## 🔄 Comment migrer vers la stratégie PRODUCTION ?

1. **Lire** `S3_UPLOAD_STRATEGY.md` pour le plan détaillé
2. **Déplacer** l'upload de `handleConfirm()` vers `handlePaymentSuccess()`
3. **Tester** avec des scénarios d'abandon de paiement
4. **Nettoyer** IndexedDB après upload S3 réussi

---

## 📚 Documentation complète

Pour tous les détails techniques et le plan de migration :
👉 **`S3_UPLOAD_STRATEGY.md`**

---

**Pas de changement nécessaire pour l'instant - l'architecture actuelle est prête pour cette évolution ! 🚀**

