# 🔑 OÙ PLACER VOS CLÉS AWS ?

## 📍 Emplacement du fichier

Créez un fichier `.env.local` à la **racine du projet** :

```
Winstory.io-main/
├── .env.local          ← CRÉEZ CE FICHIER ICI
├── package.json
├── app/
├── components/
├── lib/
└── ...
```

---

## 📝 Contenu du fichier `.env.local`

Copiez-collez ce contenu et **remplacez les valeurs** :

```bash
# Supabase Configuration (gardez vos valeurs existantes)
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-supabase

# AWS S3 Configuration
# ====================
# 🔑 REMPLACEZ CES VALEURS PAR VOS VRAIES CLÉS AWS

AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE      ← Remplacez par votre Access Key ID
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  ← Remplacez par votre Secret Key
AWS_REGION=eu-north-1                     ← Utilisez LA RÉGION DE VOTRE BUCKET S3
AWS_S3_BUCKET_NAME=winstory-videos

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Exemple avec de vraies clés AWS

```bash
# AWS S3 Configuration - EXEMPLE AVEC VRAIES CLÉS
AWS_ACCESS_KEY_ID=AKIA3RYXJKLM4PQRS2TU
AWS_SECRET_ACCESS_KEY=8hGx2Km9Qp5Rt7Yw3Vn1Bz6Cj4Df0As/ExampleKey
AWS_REGION=eu-north-1  # ⚠️ IMPORTANT: Utilisez la région de VOTRE bucket !
AWS_S3_BUCKET_NAME=winstory-videos
```

### ⚠️ Comment trouver la région de votre bucket S3 ?

1. Allez sur https://s3.console.aws.amazon.com/
2. Cliquez sur votre bucket `winstory-videos`
3. Dans l'onglet "Properties", vous verrez "AWS Region"
4. Exemples de régions :
   - `eu-north-1` (Stockholm)
   - `us-east-1` (Virginie)
   - `eu-west-1` (Irlande)
   - `eu-central-1` (Francfort)

⚠️ **N'utilisez PAS les exemples ci-dessus** - ce sont des clés fictives !

---

## 🔐 Comment obtenir vos clés AWS

### Méthode rapide :

1. Allez sur : https://console.aws.amazon.com/iam/
2. Cliquez sur **"Users"** dans le menu de gauche
3. Cliquez sur **"Add users"**
4. Nom : `winstory-s3-uploader`
5. Cochez **"Access key - Programmatic access"**
6. Cliquez sur **"Next: Permissions"**
7. Sélectionnez **"Attach existing policies directly"**
8. Cherchez et cochez **"AmazonS3FullAccess"**
9. Cliquez sur **"Next: Tags"** puis **"Next: Review"**
10. Cliquez sur **"Create user"**
11. **COPIEZ VOS CLÉS** (vous ne pourrez plus voir la secret key après !)

### Vous verrez ceci :

| Access key ID | Secret access key |
|--------------|-------------------|
| AKIA3RYXJKLM4PQRS2TU | 8hGx2Km9Qp5Rt7Yw3Vn1Bz6Cj4Df0As/ExampleKey |

**Copiez ces valeurs** dans votre fichier `.env.local` !

---

## ✅ Après avoir configuré le fichier

1. **Sauvegardez** le fichier `.env.local`
2. **Redémarrez** votre serveur :
   ```bash
   npm run dev
   ```
3. **Testez** en créant une campagne avec une vidéo

---

## 🔒 Sécurité

- ✅ Le fichier `.env.local` est déjà dans `.gitignore`
- ✅ Il ne sera **jamais commité** dans Git
- ✅ Vos clés restent **secrètes** et côté serveur uniquement

❌ **NE JAMAIS** :
- Commiter ce fichier dans Git
- Partager vos clés avec quelqu'un
- Les copier-coller dans un email ou Slack

---

## 📞 Besoin d'aide ?

Consultez les guides détaillés :
- `AWS_S3_SETUP.md` - Guide complet de configuration
- `S3_INTEGRATION_SUMMARY.md` - Résumé de l'intégration

---

**C'est tout ! Votre intégration AWS S3 est prête à fonctionner ! 🚀**

