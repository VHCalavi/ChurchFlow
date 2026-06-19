# Lignes Directrices pour le Design "Horizon UI" (ChurchFlow Admin)

Ce document décrit les règles et les conventions de design à suivre pour toutes les nouvelles pages et tous les composants du tableau de bord ChurchFlow, afin d'assurer une cohérence parfaite avec le style "Horizon UI" appliqué à la page Membres.

## 1. Couleurs et Thème (Centralisation)

Toutes les couleurs principales sont centralisées dans le fichier `app/globals.css`. **Ne hardcodez jamais de nouvelles teintes primaires ou de fonds globaux directement dans les composants.**

- **Variables CSS Globales (`globals.css`)** :
  - `--primary` : Vert principal (par défaut `#12BC7E`).
  - `--background` : Fond général de l'application (Gris très clair `#F4F7FE` en clair, Navy foncé `#0B1437` en sombre).
  - `--card` : Fond des cartes principales (Blanc pur `#FFFFFF` en clair, Navy `#111C44` en sombre).

- **Classes Tailwind à privilégier** :
  - Fonds généraux : `bg-background`
  - Fonds de composants/cartes : `bg-card`
  - Textes principaux : `text-[#1B2559] dark:text-white`
  - Textes secondaires / Sous-titres : `text-[#A3AED0]` ou `text-[#707EAE]`

## 2. Boutons et Actions

Les boutons doivent utiliser les classes utilitaires centralisées dans `globals.css` pour garantir l'uniformité du projet.

- **Bouton d'Action Primaire** (ex: Ajouter, Enregistrer, Confirmer) :
  Utilisez toujours les classes : `className="btn-horizon btn-horizon-primary"`
  *(Astuce : Vous pouvez ajouter `rounded-full` si vous avez besoin de coins entièrement arrondis, ex: `btn-horizon btn-horizon-primary rounded-full !py-2.5 !px-5`)*.

- **Bouton Secondaire** (ex: Annuler, Retour) :
  Utilisez toujours les classes : `className="btn-horizon btn-horizon-secondary"`

## 3. Cartes et Conteneurs (Horizon Cards)

Toute section contenant de la donnée (Tableaux, Graphiques, Formulaires) doit être encapsulée dans une "Horizon Card".

- **La classe principale** : `className="horizon-card"`
  Cette classe applique automatiquement le fond, les arrondis (`20px`), et l'ombre portée (shadow) douce spécifique à Horizon. Ne rajoutez pas de `border` manuellement sur ces cartes.

## 4. Champs de Formulaire (Inputs, Selects, Textareas)

Les champs de saisie (que ce soit dans les filtres, les barres de recherche ou les modales) doivent utiliser le style "Pill" (Bulle) très épuré, sans bordure agressive.

- **Style standard pour tous les `input` et `select`** :
  ```tsx
  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] dark:bg-[#0B1437] text-[#1B2559] dark:text-white placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
  ```
  *Note : Pour les balises `<select>`, ajoutez également ces classes pour styliser les options de la liste déroulante (qui sinon seraient illisibles selon le système d'exploitation) :*
  `[&>option]:bg-[#F4F7FE] dark:[&>option]:bg-[#0B1437] [&>option]:text-[#1B2559] dark:[&>option]:text-white`

- **Labels des champs** :
  Les étiquettes (labels) doivent être petites, en majuscules, en gras et avec un espacement de lettres (tracking) :
  ```tsx
  className="block text-xs font-bold text-[#A3AED0] dark:text-gray-400 uppercase tracking-wider mb-1.5"
  ```

## 5. Tableaux (DataTables)

Les tableaux doivent être aérés et clairs, reprenant le style de la page `members/page.tsx`.

- L'en-tête du tableau (`<thead>`) doit avoir une bordure en bas : `border-b border-border`.
- Les titres de colonnes (`<th>`) : `text-left py-4 px-5 text-sm font-bold text-[#A3AED0] uppercase tracking-wider`.
- Les lignes (`<tr>`) : Un simple `border-b border-border` sur chaque ligne, sauf sur la dernière.
- Les cellules de données (`<td>`) : `py-4 px-5 text-sm font-bold text-[#1B2559] dark:text-white`.

## 6. Modales et Tiroirs (Modals & Drawers)

- **Modales centrées** : Le fond (backdrop) doit utiliser `bg-slate-950/50 backdrop-blur-sm animate-fade-in`. Le conteneur principal de la modale doit être : `bg-card rounded-[20px] shadow-horizon-xl p-7`.
- **Tiroirs (Drawers)** : Utilisés pour afficher des détails (ex: Détails Membres). Ils coulissent depuis la droite. Le fond est le même, mais la structure doit avoir `w-full max-w-xl h-full bg-card shadow-horizon-xl`.

## 7. Espacement Global et Layout

- Le conteneur parent (`<main>`) possède désormais un espacement supérieur (`padding-top: 120px`) permettant au contenu de s'afficher sans être bloqué par la Navbar (Topbar) qui est fixée en haut (`position: fixed`).
- Laissez vos pages aérées (`gap-6`, `mb-8`, etc.). Horizon UI repose énormément sur le "White Space" (Espaces vides).
