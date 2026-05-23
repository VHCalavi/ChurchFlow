# ChurchFlow — Spécifications Techniques & Checklist d'Implémentation (Graphiques, Tags & Rôles)

Cette liste de tâches décrit de manière précise les modifications requises dans le monorepo pour ajouter les fonctionnalités de filtrage d'assiduité multi-courbes par groupe, les tags de réunion et la réattribution des rôles de groupe.

---

## 💾 1. Base de Données (Prisma Schema)
*   **Fichier :** `packages/database/prisma/schema.prisma`
    *   **Action :** Ajouter le champ `tags String[] @default([])` dans le modèle `Meeting`.
    *   **Commande 1 :** Régénérer le client Prisma :
        ```bash
        pnpm --filter @churchflow/database db:generate
        ```
    *   **Commande 2 :** Appliquer la migration physique sur la base de données :
        ```bash
        npx prisma db push --schema=packages/database/prisma/schema.prisma
        ```
    *   *Note sur l'évolutivité :* Le champ `role` du modèle `MemberGroup` étant déjà stocké sous forme de `String?` dans le schéma Prisma, aucun changement de schéma n'est nécessaire pour faire évoluer les rôles ultérieurement. Tout se configurera au niveau applicatif.

---

## 🔌 2. API Backend (apps/api)

### A. Endpoint Réunions Générique
*   **Fichier :** `apps/api/app/api/v1/meetings/route.ts`
    *   **Action 1 (POST) :** Mettre à jour le schéma de validation Zod `createMeetingSchema` pour accepter un tableau de chaînes optionnel : `tags: z.array(z.string()).optional()`. S'assurer de persister ce tableau lors de la création (`prisma.meeting.create`).
    *   **Action 2 (GET) :** Mettre à jour la récupération des réunions pour inclure dans la réponse JSON les détails nécessaires au calcul de l'assiduité par groupe et par tag :
        *   Renvoyer les `tags` pour chaque réunion.
        *   Inclure la relation `attendees` complète avec l'ID des membres et la liste de leurs groupes d'appartenance :
            ```typescript
            attendees: {
              select: {
                memberId: true,
                isPresent: true,
                member: {
                  select: {
                    groups: {
                      select: { groupId: true }
                    }
                  }
                }
              }
            }
            ```

### B. Endpoint Réunion Spécifique
*   **Fichier :** `apps/api/app/api/v1/meetings/[id]/route.ts`
    *   **Action 1 (PUT) :** Mettre à jour le schéma Zod de modification `updateMeetingSchema` pour accepter `tags: z.array(z.string()).optional()`, et persister le champ dans la base de données.
    *   **Action 2 (Sécurité Phase 6) :** Sécuriser toutes les méthodes (`GET`, `PUT`, `DELETE`) en extrayant le `churchId` de l'utilisateur authentifié (via le helper `getAuthUser`) et valider que la réunion ciblée appartient bien à cette église (sinon renvoyer `403 Forbidden`).

### C. Endpoint Membres de Groupe
*   **Fichier :** `apps/api/app/api/v1/groups/[id]/members/route.ts`
    *   **Action (Sécurité Phase 6) :** Sécuriser le endpoint en vérifiant la session de l'utilisateur connecté et en s'assurant que le groupe parent appartient à la même église (`churchId`) pour éviter les injections transverses.

---

## 🎨 3. Interface Administration (apps/admin)

### A. Détail de Groupe & Gestion des Rôles
*   **Fichier :** `apps/admin/app/dashboard/groups/[id]/page.tsx`
    *   **Action 1 :** Remplacer le tableau des rôles par les 4 rôles demandés :
        ```typescript
        const ROLES = ["responsable", "co-responsable", "assistant responsable", "membre"];
        ```
    *   **Action 2 (Réattribution de rôles) :** Dans la table des membres du groupe, remplacer le badge de rôle par un menu déroulant interactif (`<select>`).
    *   **Action 3 (Enregistrement en direct) :** Lors du changement de valeur du sélecteur de rôle, appeler `POST /api/v1/groups/${groupId}/members` avec le `memberId` et le nouveau `role`. Recharger les données du groupe avec succès pour confirmer le changement à l'utilisateur.

### B. Composant Graphique d'Assiduité Avancé
*   **Fichier :** `apps/admin/components/dashboard/MeetingsAttendanceChart.tsx` (Nouveau Fichier)
    *   **Design :** Implémenter un composant graphique premium en SVG natif (sans dépendance type Chart.js) reprenant l'esthétique premium de `AttendanceTrendChart`.
    *   **Filtres de Saisie :**
        1.  *Multi-sélecteur de Types* : Liste de cases à cocher ou boutons-badges (CULTE, TEMPS_DE_PRIERE, etc.).
        2.  *Sélecteur Unique de Groupe* : Liste déroulante alimentée par `/api/v1/groups`, permettant de choisir un groupe spécifique (ou "Tous les groupes").
        3.  *Multi-sélecteur de Tags* : Permet de filtrer en tapant ou sélectionnant des tags de réunions.
    *   **Logique de Calcul d'Assiduité :**
        *   Pour chaque réunion :
            *   Si filtre groupe sélectionné : Ne conserver que les `attendees` dont le membre fait partie du groupe sélectionné.
            *   Calculer le taux : `(Nombre d'attendees du groupe présents / Nombre total d'attendees du groupe pour cette réunion) * 100`.
            *   *Règle anti-doublon :* Puisqu'il n'y a qu'un enregistrement `MeetingAttendee` par membre et par réunion, la présence d'un membre n'est comptée qu'une fois même s'il appartient à plusieurs sous-groupes.
    *   **Affichage Multi-courbes :** Dessiner une courbe de Bézier de couleur distincte pour chaque type de réunion sélectionné. Afficher une légende en bas avec les codes couleurs correspondants.

### C. Page Réunions & Agenda
*   **Fichier :** `apps/admin/app/dashboard/meetings/page.tsx`
    *   **Action 1 :** Importer et afficher le composant `MeetingsAttendanceChart` en haut de la page.
    *   **Action 2 (Tags Modale Création) :** Ajouter un champ de tags (saisie libre séparée par des virgules ou badges cliquables) dans le formulaire de planification de réunion. Proposer en suggestion les tags existants extraits dynamiquement de la liste des réunions :
        ```typescript
        const existingTags = Array.from(new Set(meetings.flatMap(m => m.tags || [])));
        ```
    *   **Action 3 (Tags Modale Édition) :** Permettre l'édition et la modification des tags existants sur une réunion sélectionnée.
    *   **Action 4 (Affichage) :** Afficher les tags sous forme de petits badges esthétiques dans la liste des réunions.
