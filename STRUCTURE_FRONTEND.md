# ChurchFlow — Structure Frontend

> Ce document couvre les deux apps frontend : `apps/landing` (portail) et `apps/admin` (tableau de bord). Les règles ici sont obligatoires pour tout contributeur frontend.

---

## Vue d'ensemble

```
apps/
├── landing/        → Portail public + gateway vers les apps (port 3002)
│   └── src/app/    → Structure Next.js App Router (avec src/)
└── admin/          → Tableau de bord de gestion (port 3001)
    └── app/        → Structure Next.js App Router (sans src/)
```

> **Attention** : `landing` utilise le dossier `src/app/` ; `admin` utilise `app/` directement à la racine. Respecter cette convention existante dans chaque app.

---

## `apps/landing` — Portail d'entrée

### Rôle
Page d'accueil publique et gateway vers toutes les applications ChurchFlow. Contient un menu qui liste les apps disponibles et redirige vers elles via leur URL Vercel.

### Structure

```
apps/landing/
├── src/
│   └── app/
│       ├── layout.tsx            → Layout racine (fonts, metadata, providers)
│       ├── page.tsx              → Page d'accueil (hero + menu des apps)
│       ├── globals.css           → Styles globaux + variables Tailwind VH
│       └── fonts/                → Fichiers de polices locaux
├── tailwind.config.ts            → Config Tailwind avec couleurs VH
├── next.config.mjs
├── vercel.json
└── package.json                  → @churchflow/landing
```

### Où ajouter du contenu

| Besoin | Localisation |
|---|---|
| Nouvelle page | `src/app/{slug}/page.tsx` |
| Layout spécifique à une section | `src/app/{slug}/layout.tsx` |
| Composant local au landing | `src/components/{nom}.tsx` (créer si absent) |
| Composant réutilisable multi-apps | `packages/ui/src/components/` |
| Config des apps du menu | `src/config/apps.ts` (créer) |

### Config du menu des apps (à créer)

```typescript
// src/config/apps.ts
export const apps = [
  {
    name: "Tableau de bord",
    description: "Gestion complète de l'église",
    url: process.env.NEXT_PUBLIC_ADMIN_URL ?? "https://admin.churchflow.com",
    icon: "LayoutDashboard",
    color: "#006C69",
  },
  // Ajouter les futures apps ici — jamais en dur dans le JSX
]
```

---

## `apps/admin` — Tableau de bord

### Rôle
Interface de gestion complète : membres, groupes, finances, formations, réunions, administration, droits.

### Structure

```
apps/admin/
├── app/
│   ├── layout.tsx                → Layout racine (SessionProvider, fonts)
│   ├── page.tsx                  → Redirect vers /dashboard
│   ├── globals.css
│   ├── fonts/
│   └── dashboard/
│       ├── layout.tsx            → À CRÉER : layout avec sidebar + topbar
│       ├── page.tsx              → /dashboard (vue d'ensemble KPIs)
│       ├── members/
│       │   └── page.tsx          → /dashboard/members
│       ├── groups/
│       │   └── page.tsx          → /dashboard/groups
│       ├── meetings/
│       │   └── page.tsx          → /dashboard/meetings
│       ├── formations/
│       │   └── page.tsx          → /dashboard/formations
│       ├── finances/
│       │   └── page.tsx          → /dashboard/finances
│       ├── administration/
│       │   └── page.tsx          → /dashboard/administration
│       ├── permissions/
│       │   └── page.tsx          → /dashboard/permissions
│       └── profile/
│           └── page.tsx          → /dashboard/profile
├── components/
│   └── layout/
│       ├── dashboard-layout.tsx  → Wrapper principal du dashboard
│       ├── sidebar.tsx           → Navigation latérale
│       └── topbar.tsx            → Barre de navigation supérieure
├── tailwind.config.ts
├── next.config.mjs
├── vercel.json
└── package.json                  → @churchflow/admin
```

### Où ajouter du contenu dans l'admin

| Besoin | Localisation |
|---|---|
| Nouvelle section dashboard | `app/dashboard/{section}/page.tsx` |
| Composant local admin | `components/{domaine}/{nom}.tsx` |
| Composant UI réutilisable | `packages/ui/src/components/` |
| Type de données | `packages/types/src/index.ts` |
| Appel API | Via fetch vers `apps/api` (jamais Prisma directement) |

---

## Appels API depuis les frontends — Pattern obligatoire

Les frontends ne parlent jamais à la base de données. Ils appellent `apps/api`.

### Côté serveur (Server Component — recommandé)

```typescript
// app/dashboard/members/page.tsx
export default async function MembersPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/members?churchId=${churchId}`,
    { cache: "no-store" }  // ou next: { revalidate: 60 }
  );
  const { success, data } = await res.json();
  // ...
}
```

### Côté client (Client Component — pour les mutations)

```typescript
"use client";
// Pour les formulaires et actions utilisateur
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/members`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const { success, data, error } = await response.json();
```

### Variables d'environnement requises

```env
NEXT_PUBLIC_API_URL=https://api.churchflow.com    # URL de apps/api en prod
NEXT_PUBLIC_ADMIN_URL=https://admin.churchflow.com # Pour le menu du landing
NEXTAUTH_URL=https://admin.churchflow.com
NEXTAUTH_SECRET=...
```

---

## Packages partagés — Imports corrects

```typescript
// Types
import type { Member, Group, ApiResponse } from "@churchflow/types";

// Composants UI partagés
import { Button } from "@churchflow/ui";

// Utilitaires
import { formatDate, formatCurrency } from "@churchflow/utils";

// Auth
import { auth } from "@churchflow/auth";
```

**Ne jamais** redéfinir un type ou une fonction qui existe déjà dans un package partagé.

---

## Charte Graphique VH — Application Tailwind

### Configuration Tailwind (dans chaque app)

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      vh: {
        green:       "#006C69",  // Boutons principaux, headers
        gold:        "#CEAD1E",  // CTA prioritaires
        grey:        "#D6D1CE",  // Bordures, inputs
        teal:        "#12BC7E",  // Badges
        "teal-dark": "#075E54",  // Fonds contrastés
        text:        "#6D6E71",  // Texte courant (jamais black)
        success:     "#32C832",
        error:       "#CD3C14",
        info:        "#527EDB",
        warning:     "#FFCC00",
      }
    },
    fontFamily: {
      sans: ["Montserrat", "sans-serif"],
    }
  }
}
```

### Classes utilitaires à utiliser

```tsx
// Bouton principal
<button className="bg-vh-green text-white font-bold rounded-lg px-4 py-2 hover:bg-vh-teal-dark">

// Carte standard
<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

// Texte courant
<p className="text-vh-text">

// Badge succès
<span className="bg-vh-success/10 text-vh-success rounded-full px-2 py-0.5 text-sm">

// Fond de page
<main className="bg-[#F8F9FA] min-h-screen">
```

---

## Composants UI partagés (`packages/ui`)

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx    → Bouton VH (variantes: primary, secondary, danger)
│   │   └── index.ts      → Exports de tous les composants
│   ├── lib/
│   │   └── utils.ts      → cn() helper (clsx + tailwind-merge)
│   └── index.ts
```

Tout composant utilisé dans **2 apps ou plus** doit être déplacé ici.

---

## Ajouter une nouvelle app frontend — Checklist

- [ ] Créer `apps/{nom}/` avec `package.json` (`@churchflow/{nom}`)
- [ ] Ajouter la config Tailwind avec les couleurs VH
- [ ] Installer les dépendances workspace nécessaires
- [ ] Créer `apps/{nom}/vercel.json` avec `--filter=@churchflow/{nom}`
- [ ] Ajouter l'app dans `apps/landing/src/config/apps.ts`
- [ ] Ajouter les variables d'env dans le dashboard Vercel
- [ ] Mettre à jour ce fichier
