-- Script pour supprimer les groupes de type CELLULE
-- Suppression d'abord des membres de ces groupes
DELETE FROM member_group WHERE "groupId" IN (
    SELECT id FROM "Group" WHERE type = 'CELLULE'
);

-- Suppression des enfants des cellules (s'il y en a)
UPDATE "Group" SET "parentId" = NULL WHERE "parentId" IN (
    SELECT id FROM "Group" WHERE type = 'CELLULE'
);

-- Suppression des groupes de type CELLULE
DELETE FROM "Group" WHERE type = 'CELLULE';

-- Afficher le nombre de groupes supprimés
SELECT COUNT(*) as deleted_count FROM "Group" WHERE type = 'CELLULE';