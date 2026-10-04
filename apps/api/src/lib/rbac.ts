import { NextRequest } from 'next/server';
import { auth } from '../../lib/auth';
import { getAuthUser } from '../../lib/auth';

export interface UserWithRoles {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  churchId: string;
  roles: string[];
  permissions: string[];
}

export function hasRole(user: UserWithRoles, role: string): boolean {
  return user.roles.includes(role) || user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
}

export function isAdminLike(user: UserWithRoles): boolean {
  return user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN');
}

/** Vérifie une permission littérale (ex: "manage:roles", "filter_all:groups"). */
export function hasPermission(user: UserWithRoles, permission: string): boolean {
  if (isAdminLike(user)) return true;
  return user.permissions.includes(permission);
}

/**
 * Vérifie une permission scopée :
 *   action:resource.SCOPE  (scope = "all" | "managed" | "own")
 * Résolution par ordre de permissivité.
 */
export function hasScopedPermission(
  user: UserWithRoles,
  action: string,
  resource: string,
  scope?: 'all' | 'managed' | 'own'
): boolean {
  if (isAdminLike(user)) return true;
  const candidates = [
    scope ? `${action}:${resource}.${scope}` : null,
    `${action}:${resource}.all`,
    `${action}:${resource}.managed`,
    `${action}:${resource}.own`,
    `${action}:${resource}`,
  ].filter(Boolean) as string[];
  return candidates.some(c => user.permissions.includes(c));
}

export function hasAnyPermission(user: UserWithRoles, permissions: string[]): boolean {
  return permissions.some(p => hasPermission(user, p));
}

export function hasAllPermissions(user: UserWithRoles, permissions: string[]): boolean {
  return permissions.every(p => hasPermission(user, p));
}

export async function requireAuth(request: NextRequest): Promise<UserWithRoles | null> {
  const session = await auth();
  return getAuthUser(session) as UserWithRoles | null;
}

export async function requireRole(request: NextRequest, role: string): Promise<UserWithRoles | null> {
  const user = await requireAuth(request);
  if (!user) return null;
  return hasRole(user, role) ? user : null;
}

export async function requirePermission(request: NextRequest, permission: string): Promise<UserWithRoles | null> {
  const user = await requireAuth(request);
  if (!user) return null;
  return hasPermission(user, permission) ? user : null;
}

export async function requireScopedPermission(
  request: NextRequest,
  action: string,
  resource: string,
  scope?: 'all' | 'managed' | 'own'
): Promise<UserWithRoles | null> {
  const user = await requireAuth(request);
  if (!user) return null;
  return hasScopedPermission(user, action, resource, scope) ? user : null;
}

export async function requireOwnership(_request: NextRequest, user: UserWithRoles, resourceChurchId: string): Promise<boolean> {
  if (!user) return false;
  if (isAdminLike(user)) return true;
  return user.churchId === resourceChurchId;
}

// ─── Helpers métier (compat existante) ───────────────────────────────────────
export function checkGemPermissions(user: UserWithRoles, _gemId?: string) {
  return {
    canView:           hasScopedPermission(user, 'read', 'gems'),
    canCreate:         hasPermission(user, 'create:gems'),
    canManageMembers:  hasScopedPermission(user, 'manage_members', 'gems'),
    canManageReports:  hasPermission(user, 'create:reports'),
  };
}

export function checkReportPermissions(user: UserWithRoles, reportAuthorId?: string) {
  const own = reportAuthorId === user.id;
  return {
    canView:   hasAnyPermission(user, ['view_all:reports', 'view_group:reports', 'view_own:reports']),
    canCreate: hasPermission(user, 'create:reports'),
    canEdit:   hasPermission(user, 'view_all:reports') || (own && hasPermission(user, 'view_own:reports')),
    canDelete: hasPermission(user, 'view_all:reports') || own,
  };
}

// Conservé pour compatibilité (à terme : utiliser la table Permission en DB)
export const ROLE_PERMISSIONS = {
  ADMIN: ['read:all', 'write:all', 'manage:all', 'manage:roles'],
} as const;
