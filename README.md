# 🚀 Guide d'Initialisation — ChurchFlow (Dev Local)

Ce guide couvre **toutes les étapes** pour lancer ChurchFlow en développement local depuis zéro.

---

## 📋 Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| **Node.js** | ≥ 18.x | `node -v` |
| **pnpm** | ≥ 9.x | `pnpm -v` |
| **PostgreSQL** | ≥ 14.x | `psql --version` |

> **Installer pnpm si absent :**
> ```bash
> npm install -g pnpm@9
> ```

---

## Étape 1 — Cloner et installer les dépendances

```bash
# Cloner le dépôt
git clone <url-du-repo> ChurchFlow
cd ChurchFlow

# Installer toutes les dépendances du monorepo (apps + packages)
pnpm install
```

---

## Étape 2 — Configurer les variables d'environnement

Copier le fichier d'exemple et le remplir :

```bash
cp .env.example .env
```

Ouvrir `.env` et renseigner les valeurs :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/churchflow_db"

# NextAuth — générer avec : openssl rand -base64 32
NEXTAUTH_SECRET="votre-secret-genere-ici"
NEXTAUTH_URL="http://localhost:3001"

# URL de l'API backend (apps/api tourne sur le port 3000)
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Nom de l'application admin
NEXT_PUBLIC_APP_NAME="ChurchFlow Admin"
```

> **Générer un secret NextAuth :**
> ```bash
> openssl rand -base64 32
> ```

---

## Étape 3 — Créer la base de données PostgreSQL

Se connecter à PostgreSQL et créer la base :

```bash
psql -U postgres -c "CREATE DATABASE churchflow_db;"
```

Ou via `psql` interactif :

```sql
CREATE DATABASE churchflow_db;
```

---

## Étape 4 — Appliquer les migrations Prisma

```bash
# En développement (crée les tables et génère le client localement)
pnpm db:migrate

# ⚠️ EN PRODUCTION (Vrai base de données en ligne) :
# Utilisez la commande suivante qui applique les migrations sans réinitialiser de données
pnpm db:migrate:prod
```

> Cette commande lit `prisma/schema.prisma` et synchronise la structure avec la base de données. En production, `db:migrate:prod` utilise `prisma migrate deploy` qui applique l'historique des migrations en toute sécurité.

---

## Étape 5 — Générer le client Prisma

```bash
# Depuis la racine du monorepo
pnpm db:generate
```

---

## Étape 6 — Seeder la base de données

Le seed crée les données initiales indispensables au fonctionnement de l'application :

```bash
# En DÉVELOPPEMENT (crée les paramètres + données fictives de test)
pnpm db:seed

# ⚠️ EN PRODUCTION (Vrai base de données en ligne) :
# Crée UNIQUEMENT l'Église, les Permissions, les Rôles et l'Administrateur par défaut. 
# Aucune donnée de test n'est générée et aucune donnée existante n'est supprimée.
pnpm db:seed:prod
```

### Ce que le seed (Développement) crée :

| Catégorie | Contenu |
|---|---|
| **Église** | "Vases d'Honneur Calavi" (id: `default-church-id`) |
| **Permissions** | 9 permissions RBAC (read/write membres, groupes, réunions, finances, manage:roles) |
| **Rôles** | ADMIN, PASTEUR, RESPONSABLE_GEM, TRESORIER, MEMBRE |
| **Compte Admin** | `admin@churchflow.com` / mot de passe : **`password123`** |
| **Membres test** | Marc KOFFI, Awa DIALLO, Jean-Pierre TANO, Esther AMON |
| **Groupes test** | Département de Louange, GEM Victoire, GEM Paix |
| **Réunions test** | Culte, Répétition Chorale, Temps de Prière |

> ⚠️ **Note sur les données de test :** La commande `db:seed` (dev) **efface et recrée** les membres, groupes et réunions fictives à chaque exécution. C'est idéal pour le développement mais **destructeur en production**.
> 
> En production, utilisez **TOUJOURS** `pnpm db:seed:prod`. Cette commande est **idempotente** (sans danger) : elle initialise l'admin et les permissions si elles manquent, mais ne touche jamais à vos vrais membres ou réunions.

---

## Étape 7 — Lancer les serveurs de développement

### Option A — Lancer tout le monorepo en même temps (recommandé)

```bash
# Depuis la racine
pnpm dev
```

Turbo démarre en parallèle :
- **API** → `http://localhost:3000`
- **Admin** → `http://localhost:3001`

---

### Option B — Lancer les apps séparément

**Terminal 1 — API Backend :**
```bash
pnpm --filter @churchflow/api dev
# ou
cd apps/api && pnpm dev
```

**Terminal 2 — Admin Frontend :**
```bash
pnpm --filter @churchflow/admin dev
# ou
cd apps/admin && pnpm dev
```

---

## Étape 8 — Se connecter

Ouvrir `http://localhost:3001` dans le navigateur.

**Identifiants administrateur (créés par le seed) :**

| Champ | Valeur |
|---|---|
| Email | `admin@churchflow.com` |
| Mot de passe | `password123` |

---

## 🛠️ Commandes utiles

```bash
# Ouvrir Prisma Studio (interface graphique de la base)
pnpm --filter @churchflow/database db:studio

# Réinitialiser complètement la base et re-seeder
pnpm --filter @churchflow/database exec prisma migrate reset

# Vérifier les types TypeScript sans compiler
pnpm --filter @churchflow/admin exec tsc --noEmit
pnpm --filter @churchflow/api exec tsc --noEmit

# Linter
pnpm lint
```

---

## 🗂️ Architecture du projet

```
ChurchFlow/
├── apps/
│   ├── api/          → Backend Next.js (API Routes) — port 3000
│   └── admin/        → Frontend Next.js (Dashboard) — port 3001
├── packages/
│   ├── database/     → Prisma schema, migrations, seed
│   ├── auth/         → Configuration NextAuth partagée
│   ├── types/        → Types TypeScript partagés
│   ├── ui/           → Composants UI partagés
│   └── utils/        → Utilitaires partagés
├── .env              → Variables d'environnement (à créer depuis .env.example)
├── turbo.json        → Pipeline Turborepo
└── pnpm-workspace.yaml
```

---

## ❗ Problèmes fréquents

**`DATABASE_URL` non reconnue :**
> Vérifier que le fichier `.env` est à la **racine du monorepo** (pas dans un sous-dossier). Turborepo charge les variables depuis la racine.

**`prisma generate` échoue :**
> S'assurer d'être dans `packages/database/` ou utiliser le filtre pnpm : `pnpm --filter @churchflow/database db:generate`.

**L'admin ne peut pas se connecter :**
> S'assurer que le seed a bien été exécuté (`pnpm --filter @churchflow/database db:seed`) et que `NEXTAUTH_SECRET` est défini dans `.env`.

**Port 3000 ou 3001 déjà utilisé :**
> ```bash
> # Identifier le process
> lsof -i :3000
> # Le terminer
> kill -9 <PID>
> ```
