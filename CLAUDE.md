# ChurchFlow — Instructions Obligatoires (Lu à chaque requête)

> Ce fichier est lu automatiquement par Claude à chaque interaction. Toute contribution au projet doit respecter ces règles sans exception.

---

## Git

- `user.email`: vasesdhonneurcalavi@gmail.com

---

## Architecture Monorepo

```
ChurchFlow/
├── apps/
│   ├── api/          → Backend Next.js API (source de vérité, port 3000)
│   ├── admin/        → Dashboard admin (port 3001)
│   └── landing/      → Portail d'entrée (port 3002)
├── packages/
│   ├── database/     → Prisma client + schema PostgreSQL
│   ├── types/        → Types TypeScript partagés (JAMAIS dupliqués dans les apps)
│   ├── ui/           → Composants UI partagés (Shadcn UI)
│   ├── auth/         → Logique Auth.js partagée
│   ├── utils/        → Utilitaires partagés (date, currency, validation)
│   └── config/       → Configs partagées (eslint, tailwind, tsconfig)
├── team/             → Rôles des agents IA (ne pas modifier)
├── turbo.json        → Pipeline Turborepo
├── pnpm-workspace.yaml
└── CLAUDE.md         ← ce fichier
```

---

## Règles Absolues — Ne jamais enfreindre

### 1. Principe API-first
- `apps/api` est la **seule source de vérité** pour les données.
- Les frontends (`admin`, `landing`) **ne touchent jamais** à `packages/database` directement.
- Tout accès aux données passe par les routes `apps/api/app/api/v1/`.

### 2. Packages partagés — DRY absolu
- Un type qui existe dans `packages/types` **ne doit jamais être redéfini** dans une app.
- Un composant utilisable dans plusieurs apps va dans `packages/ui`, pas dans une app.
- Une fonction utilitaire (date, monnaie, validation) va dans `packages/utils`.
- Importer depuis le workspace : `import { Member } from "@churchflow/types"`.

### 3. Convention de nommage des routes API
```
/api/v1/{resource}          → GET (liste) + POST (création)
/api/v1/{resource}/[id]     → GET (détail) + PUT (update) + DELETE
```
- Toujours versionner : `/api/v1/` obligatoire.
- Toujours utiliser la validation Zod avant tout accès Prisma.
- Toujours retourner `{ success: boolean, data?, error?, message? }`.

### 4. Multi-tenant obligatoire
- Chaque entité (Member, Group, Meeting, etc.) est liée à un `churchId`.
- Chaque requête API doit filtrer par `churchId`. Ne jamais retourner de données cross-church.
- Le `churchId` vient de la session utilisateur côté serveur, jamais du body client.

### 5. TypeScript strict
- `"strict": true` dans tous les `tsconfig.json`.
- Pas de `any`. Pas de `// @ts-ignore` sans justification explicite.
- Les types d'entités viennent de `@churchflow/types`, les types Prisma de `@churchflow/database`.

### 6. Charte Graphique VH — Obligatoire pour tous les frontends

| Usage | Couleur | Hex |
|---|---|---|
| Boutons principaux, headers | Vert VH | `#006C69` |
| CTA prioritaires | Gold | `#CEAD1E` |
| Bordures, inputs, hover | Warm Grey | `#D6D1CE` |
| Badges, illustrations | Vert sarcelle clair | `#12BC7E` |
| Fonds contrastés | Vert sarcelle foncé | `#075E54` |
| Texte courant | Gris corps | `#6D6E71` |
| Succès | Vert | `#32C832` |
| Erreur | Rouge | `#CD3C14` |
| Info | Bleu | `#527EDB` |
| Warning | Jaune | `#FFCC00` |

- **Police** : Montserrat (Bold 700 pour titres/boutons, Regular 400 / Light 300 pour le corps).
- **Fonds** : Blanc `#FFFFFF` ou gris très clair `#F8F9FA`. Jamais de fond sombre par défaut.
- **Cartes** : `rounded-2xl`, `shadow-sm` ou `shadow-md`, `border-slate-100`.
- **Texte courant** : Jamais `#000000`. Toujours `#6D6E71`.

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Monorepo | Turborepo + pnpm |
| Framework | Next.js 14 (App Router) |
| Base de données | PostgreSQL via Prisma 5 |
| Auth | Auth.js (NextAuth v5) |
| UI | Tailwind CSS + Shadcn UI + Metronic (Tailwind) |
| Validation | Zod |
| Language | TypeScript strict |
| Tests | Vitest |

---

## Références détaillées

- Structure API complète → `STRUCTURE_API.md`
- Structure Frontend complète → `STRUCTURE_FRONTEND.md`
- Schéma base de données → `packages/database/prisma/schema.prisma`
- Types partagés → `packages/types/src/index.ts`
- PRD du projet → `PRD_VH_Calavi.md`
- Rôles agents IA → `team/cto-orchestrator.md`
