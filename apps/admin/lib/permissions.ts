"use client";

import { useSession } from "next-auth/react";

interface SessionUserLike {
  roles?: string[];
  permissions?: string[];
}

/**
 * Hook central pour vérifier les permissions côté client.
 * ADMIN et SUPER_ADMIN passent tous les checks.
 *
 * Format des permissions : "action:resource" ou "action:resource.scope"
 *   ex: "read:members.all", "filter_all:groups", "manage:roles"
 */
export function usePermissions() {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUserLike | undefined;

  const roles = user?.roles ?? [];
  const permissions = user?.permissions ?? [];
  const isAdmin = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");

  const has = (perm: string) => isAdmin || permissions.includes(perm);
  const hasAny = (...perms: string[]) => isAdmin || perms.some(p => permissions.includes(p));
  const hasAll = (...perms: string[]) => isAdmin || perms.every(p => permissions.includes(p));

  /**
   * Vérifie une permission scopée : tente par ordre de permissivité
   *   action:resource.all  →  action:resource.managed  →  action:resource.own  →  action:resource
   */
  const hasScoped = (action: string, resource: string, scope?: "all" | "managed" | "own") => {
    if (isAdmin) return true;
    const candidates = [
      scope ? `${action}:${resource}.${scope}` : null,
      `${action}:${resource}.all`,
      `${action}:${resource}.managed`,
      `${action}:${resource}.own`,
      `${action}:${resource}`,
    ].filter(Boolean) as string[];
    return candidates.some(c => permissions.includes(c));
  };

  return { roles, permissions, isAdmin, isLoading: status === "loading", has, hasAny, hasAll, hasScoped };
}
