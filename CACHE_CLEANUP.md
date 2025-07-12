# Nettoyage Automatique du Cache - Page Welcome

## Vue d'ensemble

À chaque visite de la page `/welcome`, le système nettoie automatiquement tout le cache utilisateur pour éviter les problèmes de synchronisation entre comptes et les données obsolètes.

## Fonctionnalités

### Nettoyage Complet
La fonction `clearUserCache()` dans `lib/utils.ts` supprime :

#### Données d'authentification
- `user` - Informations utilisateur
- `company` - Informations entreprise
- `walletAddress` - Adresse du wallet
- `hackathonChzBalance` - Solde CHZ hackathon
- `hackathonWalletAddress` - Adresse wallet hackathon

#### Données de création de campagne
- `story` - Contenu de l'histoire
- `film` - Contenu vidéo
- `ipfsHistory` - Historique IPFS
- `maxCompletions` - Nombre maximum de complétions

#### Données de récompenses
- `standardItemReward` - Récompenses items standard
- `standardTokenReward` - Récompenses tokens standard
- `premiumItemReward` - Récompenses items premium
- `premiumTokenReward` - Récompenses tokens premium

#### Données de configuration
- `mintTermsAccepted` - Acceptation des termes de mint
- Données thirdweb (`thirdweb:auth`, `thirdweb:wallet`, `thirdweb:session`)

#### Nettoyage dynamique
- Toutes les clés commençant par `field_`
- Toutes les clés contenant `form_`, `campaign_`, `auth`, `wallet`, `session`

### Interface Utilisateur
- Notification temporaire (3 secondes) informant l'utilisateur que le cache a été nettoyé
- Design cohérent avec le thème de l'application (couleur #FFD600)

## Implémentation

### Page Welcome (`app/welcome/page.tsx`)
```typescript
useEffect(() => {
  clearUserCache();
  setShowCacheCleared(true);
  
  const timer = setTimeout(() => {
    setShowCacheCleared(false);
  }, 3000);
  
  return () => clearTimeout(timer);
}, []);
```

### Fonction de nettoyage (`lib/utils.ts`)
```typescript
export function clearUserCache(): void {
  // Suppression localStorage
  // Suppression sessionStorage
  // Suppression cookies
  // Déclenchement événements
}
```

## Avantages

1. **Sécurité** : Évite les connexions intempestives
2. **Synchronisation** : Garantit des données fraîches
3. **Expérience utilisateur** : Processus de connexion propre
4. **Maintenance** : Évite les bugs liés aux données obsolètes

## Comportement

- **Automatique** : Se déclenche à chaque visite de `/welcome`
- **Complet** : Supprime toutes les données utilisateur
- **Non-intrusif** : Notification discrète
- **Performant** : Exécution rapide sans impact sur l'UX 