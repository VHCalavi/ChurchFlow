import { prisma } from "@churchflow/database";
import { AuthenticatedUser } from "../../lib/auth";

/**
 * Returns an array of group IDs that the user is responsible for.
 * If the user has global access (ADMIN, PASTEUR, PASTEUR_RESIDENT), returns null.
 */
export async function getManagedGroupIds(user: AuthenticatedUser): Promise<string[] | null> {
  const isAdminOrPastor = user.roles.some((r: string) =>
    ["ADMIN", "PASTEUR", "PASTEUR_RESIDENT"].includes(r.toUpperCase())
  );
  if (isAdminOrPastor) {
    return null; // Full church-wide access
  }

  // Find member record associated with user
  const member = await prisma.member.findFirst({
    where: {
      churchId: user.churchId,
      OR: [
        ...(user.userId ? [{ userId: user.userId }, { user: { id: user.userId } }] : [])
      ]
    },
    include: {
      groups: {
        include: {
          group: true
        }
      }
    }
  });

  if (!member) {
    return [];
  }

  // Find groups where this member is a leader/responsable or has group status
  const managedGroups = member.groups.filter((mg) => {
    const role = (mg.role || "").toLowerCase();
    const isLeadRole =
      role.includes("responsable") ||
      role.includes("leader") ||
      role.includes("co-responsable") ||
      role.includes("berger") ||
      role.includes("co-berger") ||
      role.includes("admin") ||
      role.includes("chef");
    const isMemberStatusResponsable = member.status === "RESPONSABLE";
    return isLeadRole || isMemberStatusResponsable;
  });

  return managedGroups.map((mg) => mg.groupId);
}

/**
 * Checks if the user has permission to create or delete groups (ADMIN or PASTEUR only)
 */
export function canCreateOrManageGroups(user: AuthenticatedUser): boolean {
  return user.roles.some((r: string) =>
    ["ADMIN", "PASTEUR", "PASTEUR_RESIDENT"].includes(r.toUpperCase())
  );
}
