# Spécification Technique & Plan d'Exécution : Rôles, Permissions (RBAC) & Auto-Onboarding des Membres

Ce document décrit de manière précise les modifications requises dans le monorepo pour implémenter un système d'autorisations dynamique. L'objectif est de permettre à n'importe quel membre enregistré dans l'église de tenter de se connecter. Si c'est sa première connexion, le système lui propose de configurer son mot de passe pour créer son compte utilisateur, puis lui donne accès au dashboard avec les habilitations correspondant à son profil de membre.

---

## 👥 1. Rôles Système Requis & Permissions Associées

Nous définissons 5 rôles système (profils globaux) distincts pour le dashboard :
1. **Administrateur** (`ADMIN`) : Accès complet à tout le système (Membres, Groupes, Réunions, Finances, Permissions).
2. **Pasteur** (`PASTEUR`) : Accès en lecture aux membres et groupes, et gestion complète des réunions. Aucun accès aux finances ni aux permissions.
3. **Responsable GEM** (`RESPONSABLE_GEM`) : Accès en lecture seule aux groupes/GEM, et gestion de ses propres réunions. Aucun accès aux fiches de membres généraux, finances ni permissions.
4. **Trésorier** (`TRESORIER`) : Accès complet au module Finances, et lecture simple de la liste des membres (pour affecter les dons). Aucun accès aux groupes, réunions ni permissions.
5. **Membre** (`MEMBRE`) : Accès en lecture seule à son profil personnel et à l'agenda public de l'église.

### Matrice de Permissions Initiale :
* `members:read`, `members:write` (Gestion des membres)
* `groups:read`, `groups:write` (Gestion des groupes/GEM)
* `meetings:read`, `meetings:write` (Planification et émargement des réunions)
* `finances:read`, `finances:write` (Comptabilité, offrandes et dîmes)
* `permissions:manage` (Administration de la matrice de droits)

---

## 📂 2. Fichiers à Modifier & Tâches à Réaliser

### A. Base de Données & Données Initiales

#### 1. `packages/database/prisma/schema.prisma`
* **Action** : Ajouter un champ JSON `metadata` sur les entités principales pour stocker les propriétés dynamiques futures sans requérir de migration de base de données. Le rôle système du membre y sera stocké.
* **Tâche** :
  - Ajouter `metadata Json @default("{}")` aux modèles suivants : `Member`, `Group`, `Meeting`, `User`, `Church`.
  - Le rôle d'un membre avant sa première connexion sera défini sous la clé `systemRole` dans le champ `metadata` de l'entité `Member` (Exemple : `{ "systemRole": "MEMBRE" }`).
  - Exécuter `npx prisma db push` ou générer une migration pour appliquer les changements.

#### 2. `packages/database/prisma/seed.ts`
* **Action** : Insérer ou mettre à jour les rôles et permissions par défaut dans la base de données.
* **Tâche** :
  - Créer les rôles système : `ADMIN`, `PASTEUR`, `RESPONSABLE_GEM`, `TRESORIER`, `MEMBRE`.
  - Créer les permissions associées : `members:read`, `members:write`, `groups:read`, `groups:write`, `meetings:read`, `meetings:write`, `finances:read`, `finances:write`, `permissions:manage`.
  - Alimenter la table de jointure `RolePermission` pour lier les droits de base à chaque rôle.

---

### B. Authentification & Détection de Première Connexion

#### 3. `apps/api/app/api/v1/auth/login/route.ts`
* **Action** : Détecter si l'email saisi appartient à un membre n'ayant pas encore configuré son accès.
* **Tâche** :
  - Lors de la vérification de l'utilisateur avec l'email :
    - Si l'utilisateur (`User`) n'existe pas en base de données :
      - Chercher dans la table `Member` si un membre possède cette adresse `email`.
      - Si le membre existe (et que son `userId` est nul), renvoyer une réponse spécifique :
        `{ success: true, firstConnection: true, email: "email@test.com" }` avec un code statut HTTP 200.
      - Si aucun membre n'existe avec cet email, renvoyer une erreur 401 classique ("Identifiants incorrects").
    - Si l'utilisateur (`User`) existe, procéder à la vérification classique du mot de passe et renvoyer ses permissions (`permissions: string[]`).

#### 4. `packages/auth/src/config.ts`
* **Action** : Transmettre la liste des permissions de l'utilisateur connecté dans la session NextAuth.
* **Tâche** :
  - Mettre à jour le callback `jwt` pour inclure un tableau de chaînes `permissions` dans le jeton.
  - Dans le callback `session`, copier `token.permissions` dans `session.user.permissions`.

---

### C. Interface de Connexion Frontend (Auto-Onboarding)

#### 5. `apps/admin/app/login/page.tsx` (ou le composant de login associé)
* **Action** : Intercepter le statut de première connexion et afficher la modale de création de compte.
* **Tâche** :
  - Lors de la soumission du formulaire d'authentification :
    - Si la réponse renvoie `{ firstConnection: true }` :
      - Ouvrir une boîte de dialogue (modale) esthétique : *"Il s'agit de votre première connexion. Souhaitez-vous créer votre compte en enregistrant un mot de passe ?"*.
      - Demander à l'utilisateur de saisir et confirmer son nouveau mot de passe.
      - Envoyer une requête `POST /api/v1/auth/register-first-connection` avec l'email et le mot de passe.
      - Une fois l'enregistrement réussi, procéder à l'authentification automatique (sign-in) et rediriger vers le dashboard.

#### 6. `apps/api/app/api/v1/auth/register-first-connection/route.ts` *(Nouveau Fichier)*
* **Action** : Créer l'utilisateur en base de données à partir de sa première saisie de mot de passe en lisant son rôle dans le metadata du membre.
* **Tâche** :
  - Recevoir `email` et `password` via `POST`.
  - Rechercher le membre correspondant dans la table `Member`. S'il n'existe pas ou s'il a déjà un `userId`, rejeter la demande.
  - Lire la propriété `systemRole` stockée à l'intérieur du champ JSON `metadata` du membre (Exemple : `const role = (member.metadata as any)?.systemRole || "MEMBRE"`).
  - Hasher le mot de passe à l'aide de `@churchflow/auth`.
  - Créer l'enregistrement `User` associé (email du membre, nom, mot de passe hashé, et son `churchId`).
  - Assigner le rôle système extrait de la metadata (par défaut `MEMBRE` si aucun rôle spécifique n'y a été trouvé).
  - Mettre à jour la fiche `Member` pour enregistrer l'ID du `User` créé dans le champ `userId`.

---

### D. Gestion des Droits en Direct (Interface Administrateur)

#### 7. `apps/admin/app/dashboard/permissions/page.tsx`
* **Action** : Brancher la page de gestion des permissions sur la base de données.
* **Tâche** :
  - Supprimer la matrice codée en dur (`roleMatrix`).
  - Implémenter un appel `GET /api/v1/permissions` au montage de la page pour récupérer les rôles et leurs permissions réelles.
  - Implémenter un appel `POST /api/v1/permissions` pour sauvegarder en base les cases cochées/décochées.

#### 8. `apps/admin/components/layout/sidebar.tsx`
* **Action** : Filtrer dynamiquement la barre latérale selon les permissions de l'utilisateur connecté.
* **Tâche** :
  - Récupérer les permissions de l'utilisateur depuis `session.user.permissions`.
  - Filtrer l'affichage des liens dans la barre latérale en fonction des habilitations :
    - *Membres* : visible uniquement si l'utilisateur possède `members:read`.
    - *Groupes & GEM* : visible uniquement si l'utilisateur possède `groups:read`.
    - *Réunions & Agenda* : visible uniquement si l'utilisateur possède `meetings:read`.
    - *Permissions (RBAC)* : visible uniquement si l'utilisateur possède `permissions:manage`.
