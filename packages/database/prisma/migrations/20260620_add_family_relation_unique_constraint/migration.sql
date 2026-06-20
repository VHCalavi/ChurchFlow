-- AddUniqueConstraint
-- Empêche les doublons de relations et permet l'upsert bidirectionnel
CREATE UNIQUE INDEX IF NOT EXISTS "family_relations_memberId_relativeId_relationType_key" 
ON "family_relations"("memberId", "relativeId", "relationType");
