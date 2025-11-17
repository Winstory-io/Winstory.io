# Configuration du Lock des Récompenses

## 🔐 Wallet Winstory Custodial

Le système utilise un **wallet Winstory custodial** pour recevoir et stocker les récompenses prélevées au MINT.

### Configuration Requise

Ajoutez dans votre `.env.local` ou variables d'environnement :

```env
# Wallet Winstory Custodial (pour recevoir les récompenses prélevées)
WINSTORY_CUSTODIAL_WALLET_PRIVATE_KEY=0x...votre_clé_privée...
```

### Génération du Wallet

Si vous n'avez pas encore de wallet custodial :

```bash
# Option 1: Générer avec Node.js
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"

# Option 2: Utiliser un wallet existant (MetaMask, etc.)
# Exportez la clé privée depuis votre wallet
```

### Sécurité

⚠️ **IMPORTANT** :
- Ne commitez JAMAIS la clé privée dans Git
- Utilisez des variables d'environnement sécurisées
- En production, utilisez un gestionnaire de secrets (AWS Secrets Manager, etc.)
- Le wallet custodial doit avoir des fonds pour payer les gas fees

## 🔄 Processus de Lock

### 1. Approbation (Frontend - Avant MINT)

L'entreprise doit approuver le wallet Winstory avant le MINT :

```typescript
// Exemple d'approbation ERC20
const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
const winstoryAddress = '0x...'; // Adresse du wallet Winstory custodial
const amount = ethers.utils.parseUnits(totalAmount, decimals);

const tx = await contract.approve(winstoryAddress, amount);
await tx.wait();
```

### 2. Lock au MINT (Backend - Automatique)

Lors de la création de campagne, le système :
1. Vérifie les soldes
2. Vérifie les approbations
3. Transfère les tokens vers le wallet Winstory
4. Enregistre les transactions dans `reward_locks`

### 3. Distribution (Backend - Automatique)

Lors de la validation d'une completion :
1. Le système distribue depuis le wallet Winstory
2. Vers le wallet du compléteur
3. Enregistre dans `reward_distributions`

## 📋 Checklist de Configuration

- [ ] Wallet Winstory custodial créé
- [ ] Clé privée ajoutée dans variables d'environnement
- [ ] Wallet financé avec tokens natifs (ETH, MATIC, etc.) pour gas fees
- [ ] Adresse du wallet communiquée aux entreprises pour approbation
- [ ] Test de lock sur testnet
- [ ] Test de distribution sur testnet

## 🧪 Test du Système

### 1. Test d'Approbation

```typescript
// Frontend - L'entreprise approuve
const approvalTx = await tokenContract.approve(winstoryAddress, amount);
console.log('Approval TX:', approvalTx.hash);
```

### 2. Test de Lock

```bash
# Backend - Créer une campagne avec récompenses
POST /api/campaigns/create
# Le système appellera automatiquement /api/rewards/lock
```

### 3. Vérification

```sql
-- Vérifier les locks
SELECT * FROM reward_locks WHERE campaign_id = '...';

-- Vérifier le solde du wallet Winstory
-- (via explorer blockchain ou script)
```

## 🔮 Migration vers Smart Contract

Quand le Smart Contract sera intégré :

1. Les tokens seront lockés dans le Smart Contract (pas dans un wallet)
2. Le Smart Contract gérera automatiquement les distributions
3. Plus besoin d'approbations manuelles
4. Plus de wallet custodial nécessaire

Le code actuel est conçu pour faciliter cette migration.

