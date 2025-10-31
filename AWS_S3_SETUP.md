# Configuration AWS S3 pour Winstory

## 📋 Instructions de configuration

### 1. Créer votre fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# Supabase Configuration (copiez depuis votre .env existant)
NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon-supabase

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=VOTRE_AWS_ACCESS_KEY_ICI
AWS_SECRET_ACCESS_KEY=VOTRE_AWS_SECRET_ACCESS_KEY_ICI
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=winstory-videos

# ⚠️ IMPORTANT : Utilisez la région de VOTRE bucket S3
# Si votre bucket est dans une autre région (ex: us-east-1, eu-west-1, etc.)
# vous DEVEZ changer AWS_REGION pour correspondre à votre bucket

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Obtenir vos clés AWS

#### Étape A : Créer un utilisateur IAM
1. Connectez-vous à [AWS Console](https://console.aws.amazon.com/)
2. Allez dans **IAM** (Identity and Access Management)
3. Cliquez sur **Users** dans le menu de gauche
4. Cliquez sur **Add users**
5. Nommez l'utilisateur (ex: `winstory-s3-uploader`)
6. Cochez **Access key - Programmatic access**
7. Cliquez sur **Next: Permissions**

#### Étape B : Configurer les permissions S3
1. Cliquez sur **Attach existing policies directly**
2. Cherchez et sélectionnez **AmazonS3FullAccess** (ou créez une policy personnalisée plus restrictive)
3. Cliquez sur **Next: Tags** puis **Next: Review**
4. Cliquez sur **Create user**

#### Étape C : Récupérer les clés
1. Sur la page de confirmation, vous verrez :
   - **Access key ID** → Copiez dans `AWS_ACCESS_KEY_ID`
   - **Secret access key** → Copiez dans `AWS_SECRET_ACCESS_KEY`
2. ⚠️ **IMPORTANT** : Téléchargez le fichier CSV ou copiez ces clés maintenant, vous ne pourrez plus voir la secret key après !

### 3. Configuration de votre bucket S3

Votre bucket S3 `winstory-videos` doit avoir la structure suivante :

```
winstory-videos/
├── pending/     ← Vidéos en attente de modération (IA + humaine)
└── success/     ← Vidéos validées par les modérateurs
```

Les vidéos sont automatiquement uploadées dans `/pending` lors de la confirmation sur les pages Recap.

### 4. Politique de sécurité recommandée (optionnel)

Pour plus de sécurité, créez une politique IAM personnalisée qui limite l'accès uniquement au bucket `winstory-videos` :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::winstory-videos/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::winstory-videos"
    }
  ]
}
```

### 5. Tester la configuration

Après avoir configuré vos clés dans `.env.local`, redémarrez votre serveur de développement :

```bash
npm run dev
```

Créez une campagne ou une completion et vérifiez que la vidéo est bien uploadée dans votre bucket S3 !

---

## 🔒 Sécurité

**NE JAMAIS** :
- Commiter le fichier `.env.local` dans Git
- Partager vos clés AWS avec qui que ce soit
- Utiliser ces clés dans du code frontend (elles doivent rester côté serveur)

Le fichier `.env.local` est déjà dans `.gitignore` pour éviter tout commit accidentel.

---

## 🎯 Où placer vos clés ?

**RÉPONSE** : Dans le fichier `.env.local` à la racine du projet (même niveau que `package.json`).

Remplacez :
- `AWS_ACCESS_KEY_ID=VOTRE_AWS_ACCESS_KEY_ICI` par votre vraie Access Key ID
- `AWS_SECRET_ACCESS_KEY=VOTRE_AWS_SECRET_ACCESS_KEY_ICI` par votre vraie Secret Access Key

