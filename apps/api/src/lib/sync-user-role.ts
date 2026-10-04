import type { PrismaClient, Prisma } from "@prisma/client";

type Tx =
  | Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
  | Prisma.TransactionClient;

/**
 * Synchronise `user_roles` pour qu'il reflète EXACTEMENT le rôle désiré.
 *
 * Contraintes :
 *  - Un utilisateur n'a qu'UN SEUL rôle RBAC (simplicité).
 *  - Le rôle cible doit exister en DB pour cette église OU être global (churchId null).
 *  - Idempotent.
 */
export async function syncUserRole(
  tx: Tx,
  userId: string,
  systemRole: string | null | undefined
): Promise<{ applied: string; changed: boolean }> {
  const targetName = systemRole || "MEMBRE";

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { churchId: true },
  });
  if (!user) throw new Error(`Utilisateur ${userId} introuvable.`);

  const targetRole = await tx.role.findFirst({
    where: {
      name: targetName,
      OR: [{ churchId: user.churchId }, { churchId: null }],
    },
    orderBy: { churchId: "desc" }, // priorité au rôle custom de l'église
  });

  if (!targetRole) {
    throw new Error(
      `Rôle "${targetName}" introuvable pour cette église. Créez-le dans Permissions.`
    );
  }

  const current = await tx.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  const currentNames = current.map((ur) => ur.role.name).sort();
  if (currentNames.length === 1 && currentNames[0] === targetName) {
    return { applied: targetName, changed: false };
  }

  await tx.userRole.deleteMany({ where: { userId } });
  await tx.userRole.create({ data: { userId, roleId: targetRole.id } });

  return { applied: targetName, changed: true };
}
