# Lignes Directrices Design "Horizon UI" — ChurchFlow Admin

> Ce document fait autorité sur tous les fichiers du dashboard. Chaque nouvelle page ou composant **doit** respecter ces règles. Il remplace toute règle précédente.

---

## 1. Couleurs & Tokens Sémantiques

**Règle d'or** : Toujours utiliser les **tokens CSS** ou les **classes Tailwind sémantiques**. Ne jamais hardcoder une nouvelle couleur globale (fond, texte principal) directement dans un composant.

### Fonds

| Contexte                 | Classe Tailwind | Valeur (light / dark) |
| ------------------------ | --------------- | --------------------- |
| Fond général de page     | `bg-background` | `#F4F7FE` / `#0B1437` |
| Fond d'une carte/section | `bg-card`       | `#FFFFFF` / `#111C44` |

### Textes

| Contexte                               | Classe Tailwind         | Valeur (light / dark) |
| -------------------------------------- | ----------------------- | --------------------- |
| Texte principal (titres, données)      | `text-foreground`       | `#1B2559` / `#FFFFFF` |
| Texte secondaire (labels, sous-titres) | `text-muted-foreground` | `#A3AED0` / `#A3AED0` |

### Couleur Primaire

- **Variable CSS** : `--primary` → `#12BC7E` (définie dans `globals.css`)
- **Utilisation** : `bg-primary`, `text-primary`, `border-primary`, `ring-primary/25`

### Bordures

- Toujours utiliser `border-border` (token Tailwind) — jamais `border-slate-100` ou `border-slate-200` hardcodé.

---

## 2. Typographie (La règle la plus importante)

> **Ancienne pratique interdite** : `text-xs`, `uppercase`, `tracking-wider` pour tout texte de contenu. Le système Horizon UI utilise une typographie moderne et lisible basée sur 14px minimum.

> **RÈGLE ABSOLUE** : Aucun `text-[taille fixe]` n'est autorisé. Utiliser uniquement `text-sm` (14px), `text-base` (16px), `text-xl` (20px), etc. pour garantir une lecture confortable.

### Hiérarchie des Tailles

| Élément                                       | Classes                                     | Taille |
| --------------------------------------------- | ------------------------------------------- | ------ |
| **Titre de page / section**                   | `text-xl font-bold text-foreground`         | 20px   |
| **Titre de carte**                            | `text-base font-bold text-foreground`       | 16px   |
| **Sous-titre de carte**                       | `text-sm font-bold text-foreground`         | 14px   |
| **Valeur numérique principale (StatCard)**    | `text-2xl font-bold text-foreground`        | 24px   |
| **Label de champ de formulaire**              | `text-sm font-medium text-foreground`       | 14px   |
| **Texte secondaire / sous-label**             | `text-sm font-medium text-muted-foreground` | 14px   |
| **En-tête de colonne de tableau**             | `text-sm font-medium text-muted-foreground` | 14px   |
| **Donnée de cellule de tableau (principale)** | `text-sm font-bold text-foreground`         | 14px   |
| **Donnée de cellule de tableau (secondaire)** | `text-sm font-medium text-muted-foreground` | 14px   |

### ❌ Interdictions strictes

- `text-xs` (`12px`) : **interdit** — sauf pour badges/tags ultra-compacts
- `text-[taille fixe]` : **interdit** — toujours utiliser `text-sm`, `text-base`, `text-xl`, etc.
- `uppercase` + `tracking-wider` : **interdit** — créer une hiérarchie avec les poids de police
- `font-extrabold` (`800`) : **interdit** — toujours utiliser `font-bold` (`700`)
- ❌ **À PROSCRIRE** : `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]` — toujours utiliser `text-sm` minimum

### ✅ Exceptions autorisées (petits badges/tags uniquement)

Les éléments de type **badge** ou **tag compact** peuvent conserver `text-xs font-bold` car leur rôle est différent d'un texte de contenu :

```tsx
// Badges de type de groupe ou statut : OK
<span className="text-xs font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-lg">DEPT</span>
<span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-[#E6FAF5] text-[#01B574]">Présent</span>
```

---

## 3. Boutons

Utiliser exclusivement les classes globales définies dans `globals.css` :

```tsx
// Bouton d'action principal (Ajouter, Enregistrer, Confirmer)
className = "btn-horizon btn-horizon-primary";

// Bouton secondaire (Annuler, Retour)
className = "btn-horizon btn-horizon-secondary";

// Bouton destructif (Supprimer)
className = "btn-horizon btn-horizon-danger";
```

Ne **jamais** recréer un bouton avec des classes Tailwind manuelles pour remplacer ceux-ci.

---

## 4. Champs de Formulaire (Inputs, Selects, Textareas)

Style standard "Pill" (bulle) sans bordure, à utiliser **partout** (barres de recherche, filtres, modales) :

```tsx
// Input texte / email / tel
className =
  "w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all";

// Select
className =
  "w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all [&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white";

// Textarea (arrondi adapté car multi-lignes)
className =
  "w-full px-5 py-3 text-sm font-semibold rounded-2xl border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none";
```

**Label associé** :

```tsx
<label className="block text-sm font-medium text-foreground mb-1.5">
  Nom du champ *
</label>
```

---

## 5. Cartes (Horizon Cards)

```tsx
// Utiliser la classe globale définie dans globals.css
className = "horizon-card";

// Pour une carte avec padding personnalisé
className = "horizon-card p-6";

// Pour une carte conteneur de tableau (sans padding interne)
className = "horizon-card !p-0 overflow-hidden";
```

- Fond, arrondi (`20px`), et ombre portée sont gérés automatiquement
- **Ne jamais** ajouter de `border` manuel sur une `horizon-card`

---

## 6. Tableaux

```tsx
// Ligne d'en-tête
<tr className="border-b border-border text-muted-foreground text-sm font-medium">
  <th className="py-4 px-6 text-left">Colonne</th>
</tr>

// Corps du tableau
<tbody className="divide-y divide-border">
  <tr className="hover:bg-background/60 transition-colors">
    {/* Donnée principale */}
    <td className="py-4 px-6 text-sm font-bold text-foreground">Valeur</td>
    {/* Donnée secondaire */}
    <td className="py-4 px-6 text-sm font-medium text-muted-foreground">Valeur</td>
  </tr>
</tbody>
```

---

## 7. Modales

```tsx
// Fond (backdrop)
<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
  {/* Conteneur */}
  <div className="w-full max-w-lg p-6 bg-card rounded-[20px] shadow-horizon-xl">
    {/* En-tête */}
    <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
      <h3 className="text-base font-bold text-foreground">
        Titre de la Modale
      </h3>
      <button className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
    {/* Formulaire */}
    <form className="space-y-4">
      {/* ... champs ... */}
      {/* Footer */}
      <div className="flex justify-end space-x-3 pt-3 border-t border-border">
        <button type="button" className="btn-horizon btn-horizon-secondary">
          Annuler
        </button>
        <button type="submit" className="btn-horizon btn-horizon-primary">
          Enregistrer
        </button>
      </div>
    </form>
  </div>
</div>
```

---

## 8. Statut & Badges

Les badges de statut (Membre, Responsable, etc.) gardent `text-xs font-bold` car ce sont des éléments compacts visuels, pas du texte de contenu :

```tsx
// Statut membre
<span className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E6FAF5] text-[#01B574]">
  MEMBRE
</span>

// Badge de type de groupe
<span className="text-xs font-bold px-2.5 py-1 bg-[#12BC7E]/10 text-[#12BC7E] border border-[#12BC7E]/20 rounded-lg">
  DEPT
</span>
```

---

## 9. Layout & Espacements

- Le `<main>` du dashboard a un `padding-top: 120px` (géré par `DashboardLayout`) pour compenser la `Topbar` fixe.
- Espacement entre sections majeures : `mb-8` ou `space-y-8`
- Espacement entre cartes : `gap-6`
- Grille de stat cards : `grid grid-cols-1 md:grid-cols-3 gap-6`

---

## 10. Checklist pour une nouvelle page

Avant de soumettre une nouvelle page du dashboard, vérifier :

- [ ] Enveloppée dans `<DashboardLayout title="...">`
- [ ] Toutes les sections de données dans `className="horizon-card"`
- [ ] Tous les `<input>`, `<select>`, `<textarea>` : style "Pill" sans bordure
- [ ] Tous les labels : `text-sm font-medium text-foreground`
- [ ] Tous les textes secondaires : `text-sm font-medium text-muted-foreground`
- [ ] Aucune couleur `text-slate-*`, `border-slate-*` — utiliser les tokens (`text-muted-foreground`, `border-border`)
- [ ] Tous les boutons d'action : classes `btn-horizon btn-horizon-*`
- [ ] Aucun `text-xs` dans du texte de contenu (seulement dans les badges/tags)
- [ ] Aucun `uppercase tracking-wider` sur les labels de formulaires
