# Configuration des Appels RPC Blockchain

## 🎯 Objectif

Remplacer les mocks actuels par de vrais appels RPC vers les contrats ERC20, ERC1155, ERC721 via ethers.js.

## ✅ Changements Apportés

### 1. Installation d'ethers.js
```bash
npm install ethers
```

### 2. Nouveau fichier `lib/blockchain-rpc.ts`
- **Fonctions de validation réelles** pour ERC20, ERC1155, ERC721
- **Configuration des RPC** par blockchain (Ethereum, Polygon, BNB Chain, Avalanche)
- **ABI optimisés** pour chaque standard de token
- **Gestion d'erreurs** robuste

### 3. Mise à jour des fonctions existantes

#### `lib/blockchain.ts`
- `validateTokenContract()` : Utilise maintenant les vraies fonctions RPC
- `validateItemContract()` : Support des contrats ERC1155/ERC721
- Paramètre `walletAddress` ajouté pour la validation

#### `lib/hooks/useWalletBalance.ts`
- `fetchWalletBalance()` : Appels RPC réels au lieu de mocks
- Support des différents standards (ERC20, ERC1155, ERC721)
- Gestion des `tokenId` pour ERC1155

### 4. Mise à jour des composants

#### Composants Standard (`app/creation/b2c/standardrewards/`)
- `TokenRewardConfig.tsx` : Validation ERC20 réelle
- `ItemRewardConfig.tsx` : Validation ERC1155/ERC721 réelle
- Intégration du hook `useWalletAddress`

#### Composants Premium (`app/creation/b2c/premiumrewards/`)
- `TokenRewardConfig.tsx` : Validation ERC20 réelle
- `ItemRewardConfig.tsx` : Validation ERC1155/ERC721 réelle

## 🔧 Configuration des RPC

### Blockchains Supportées
```typescript
const RPC_CONFIGS = {
  'Ethereum': {
    rpcUrl: 'https://rpc.ankr.com/eth',
    chainId: 1
  },
  'Polygon': {
    rpcUrl: 'https://rpc.ankr.com/polygon',
    chainId: 137
  },
  'BNB Chain': {
    rpcUrl: 'https://rpc.ankr.com/bsc',
    chainId: 56
  },
  'Avalanche': {
    rpcUrl: 'https://rpc.ankr.com/avalanche',
    chainId: 43114
  }
};
```

### Standards de Tokens Supportés
- **ERC20** : Tokens fongibles (Ethereum, Polygon, BNB Chain, Avalanche)
- **ERC1155** : Tokens semi-fongibles (NFTs avec quantités)
- **ERC721** : NFTs non-fongibles

## 🚀 Utilisation

### Validation d'un contrat ERC20
```typescript
import { validateERC20Contract } from './lib/blockchain-rpc';

const tokenInfo = await validateERC20Contract(
  '0x3506424F91fD33084466F402d5D97f05F8e3b4AF', // CHZ contract
  'Ethereum',
  '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'  // wallet address
);
```

### Validation d'un contrat ERC1155
```typescript
import { validateERC1155Contract } from './lib/blockchain-rpc';

const itemInfo = await validateERC1155Contract(
  '0x1234567890123456789012345678901234567890', // contract address
  'Ethereum',
  '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // wallet address
  '0' // tokenId
);
```

## ⚠️ Prérequis

1. **Wallet connecté** : L'adresse du wallet doit être disponible
2. **Connexion internet** : Pour les appels RPC
3. **Contrat valide** : L'adresse doit être un contrat déployé

## 🔍 Fonctionnalités

### Validation de Contrats
- ✅ Vérification de l'existence du contrat
- ✅ Récupération des métadonnées (name, symbol, decimals)
- ✅ Calcul du solde utilisateur
- ✅ Support multi-blockchain

### Gestion d'Erreurs
- ❌ Contrat inexistant
- ❌ Réseau indisponible
- ❌ Wallet non connecté
- ❌ Standard non supporté

### Performance
- ⚡ Appels parallèles pour optimiser les performances
- ⚡ Cache des résultats
- ⚡ Gestion des timeouts

## 🧪 Tests Recommandés

### Contrats de Test
- **ERC20** : `0x3506424F91fD33084466F402d5D97f05F8e3b4AF` (CHZ sur Ethereum)
- **ERC1155** : Utiliser des contrats OpenSea ou similaires
- **ERC721** : Contrats NFT populaires

### Scénarios de Test
1. ✅ Wallet connecté + contrat valide
2. ❌ Wallet non connecté
3. ❌ Adresse invalide
4. ❌ Contrat inexistant
5. ❌ Réseau indisponible

## 🔄 Prochaines Étapes

1. **Tests en production** avec de vrais contrats
2. **Support Solana** (SPL tokens)
3. **Support Bitcoin** (BRC20 tokens)
4. **Optimisation des performances** avec des providers RPC alternatifs
5. **Gestion des métadonnées** pour ERC1155/ERC721

## 📝 Notes Importantes

- Les appels RPC peuvent prendre 1-3 secondes
- Certains contrats peuvent ne pas implémenter tous les standards
- Les erreurs réseau sont gérées gracieusement
- Le solde utilisateur est requis pour la validation 