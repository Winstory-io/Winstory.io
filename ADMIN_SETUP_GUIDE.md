# 🚀 Guide de Configuration Rapide - Interface Admin Vidéo Winstory

## Installation en 5 minutes

### Étape 1 : Configuration des variables d'environnement

Ajoutez ces lignes à votre fichier `.env.local` :

```env
# ==========================================
# SUPABASE (Déjà configuré normalement)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ==========================================
# AWS S3 (Pour l'upload des vidéos)
# ==========================================
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=winstory-videos

# ==========================================
# ADMIN ACCESS (NOUVEAU - À CONFIGURER)
# ==========================================
# Option 1 : Liste des wallets autorisés (recommandé)
ADMIN_WALLETS=0x1234...,0x5678...,0x90ab...

# Option 2 : Clé secrète pour les API calls (alternative)
ADMIN_SECRET_KEY=your-secret-admin-key-here
```

### Étape 2 : Vérification de la base de données

#### Vérifier le statut `PENDING_WINSTORY_VIDEO`

Exécutez cette requête dans Supabase SQL Editor :

```sql
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'campaign_status'
);
```

✅ **Résultat attendu :** La liste doit inclure `PENDING_WINSTORY_VIDEO`

❌ **Si manquant :** Exécutez cette migration :

```sql
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'PENDING_WINSTORY_VIDEO';
```

#### Vérifier la table `winstory_interventions`

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'winstory_interventions'
);
```

✅ **Résultat attendu :** `true`

❌ **Si `false` :** Exécutez la migration complète : `supabase/migrations/back-end-supabase.sql`

### Étape 3 : Configuration AWS S3

1. **Créer un bucket S3** (ou utiliser un existant)
   - Nom : `winstory-videos` (ou celui dans `.env.local`)
   - Région : `eu-north-1` (Stockholm)

2. **Créer un utilisateur IAM** avec ces permissions :
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::winstory-videos/*",
           "arn:aws:s3:::winstory-videos"
         ]
       }
     ]
   }
   ```

3. **Ajouter les credentials dans `.env.local`** :
   ```env
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   ```

### Étape 4 : Configuration de l'accès admin

#### Option A : Wallet Address (Recommandé)

1. Obtenez les adresses wallet des admins
2. Ajoutez-les dans `.env.local` :
   ```env
   ADMIN_WALLETS=0x1234...,0x5678...
   ```

#### Option B : Clé secrète

1. Générez une clé secrète forte
2. Ajoutez-la dans `.env.local` :
   ```env
   ADMIN_SECRET_KEY=my-super-secret-key-12345
   ```

### Étape 5 : Test de l'installation

1. **Démarrer le serveur** :
   ```bash
   npm run dev
   ```

2. **Accéder à l'interface admin** :
   ```
   http://localhost:3000/admin/video-creation
   ```

3. **Vérifier l'accès** :
   - ✅ Si vous voyez la liste (vide ou avec des campagnes) → Configuration OK
   - ❌ Si vous voyez "Accès refusé" → Vérifiez `ADMIN_WALLETS` ou connectez-vous avec un wallet autorisé

### Étape 6 : Tester avec une campagne

1. Créer une campagne B2C avec l'option "Winstory creates the Film"
2. Vérifier qu'elle apparaît dans `/admin/video-creation`
3. Tester l'upload d'une vidéo de test

---

## ✅ Checklist de vérification

- [ ] Variables Supabase configurées
- [ ] Variables AWS S3 configurées
- [ ] Statut `PENDING_WINSTORY_VIDEO` existe dans la base
- [ ] Table `winstory_interventions` existe
- [ ] `ADMIN_WALLETS` ou `ADMIN_SECRET_KEY` configuré
- [ ] Bucket S3 créé et accessible
- [ ] Interface admin accessible (`/admin/video-creation`)
- [ ] Test d'upload réussi

---

## 🐛 Dépannage rapide

### "Accès refusé" sur `/admin/video-creation`

**Solution :**
1. Vérifier que vous êtes connecté avec un wallet
2. Vérifier que le wallet est dans `ADMIN_WALLETS`
3. En développement, l'accès est autorisé automatiquement

### Les campagnes n'apparaissent pas

**Vérifications :**
```sql
-- Vérifier qu'il y a des campagnes avec ai_option = true
SELECT COUNT(*) 
FROM campaigns c
JOIN campaign_pricing_configs cpc ON cpc.campaign_id = c.id
WHERE cpc.ai_option = true;
```

### L'upload échoue

**Vérifications :**
1. ✅ Credentials AWS valides
2. ✅ Bucket existe et est accessible
3. ✅ Permissions IAM correctes
4. ✅ Taille du fichier < 500MB

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **`WINSTORY_VIDEO_CREATION_DOCUMENTATION.md`** : Documentation complète du workflow

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs du serveur (`npm run dev`)
2. Vérifier les logs du navigateur (Console)
3. Consulter la documentation complète
4. Vérifier les requêtes SQL fournies dans la documentation

---

**Dernière mise à jour :** 2024-01-27

