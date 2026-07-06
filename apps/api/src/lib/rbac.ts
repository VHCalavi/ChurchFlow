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

// Vérifier si l'utilisateur a un rôle spécifique
export function hasRole(user: UserWithRoles, role: string): boolean {
  return user.roles.includes(role) || user.roles.includes('ADMIN');
}

// Vérifier si l'utilisateur a une permission spécifique
export function hasPermission(user: UserWithRoles, permission: string): boolean {
  return user.permissions.includes(permission) || user.roles.includes('ADMIN');
}

// Vérifier multiple permissions (au moins une)
export function hasAnyPermission(user: UserWithRoles, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

// Vérifier toutes les permissions
export function hasAllPermissions(user: UserWithRoles, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

// Middleware RBAC générique
export async function requireAuth(request: NextRequest): Promise<UserWithRoles | null> {
  const session = await auth();
  const user = getAuthUser(session);

  if (!user) {
    return null;
  }

  return user;
}

// Middleware avec vérification de rôle
export async function requireRole(request: NextRequest, role: string): Promise<UserWithRoles | null> {
  const user = await requireAuth(request);
  if (!user) {
    return null;
  }

  if (!hasRole(user, role)) {
    return null;
  }

  return user;
}

// Middleware avec vérification de permission
export async function requirePermission(request: NextRequest, permission: string): Promise<UserWithRoles | null> {
  const user = await requireAuth(request);
  if (!user) {
    return null;
  }

  if (!hasPermission(user, permission)) {
    return null;
  }

  return user;
}

// Middleware pour les ressources multitenant
export async function requireOwnership(request: NextRequest, user: UserWithRoles, resourceChurchId: string): Promise<boolean> {
  if (!user) return false;

  // Les admins peuvent accéder à toutes les églises
  if (hasRole(user, 'ADMIN')) return true;

  // Les autres utilisateurs ne peuvent accéder qu'à leur propre église
  return user.churchId === resourceChurchId;
}

// Rôles prédéfinis avec permissions associées
export const ROLE_PERMISSIONS = {
  ADMIN: [
    'read:all',
    'write:all',
    'manage:all',
    'read:members',
    'write:members',
    'delete:members',
    'read:groups',
    'write:groups',
    'delete:groups',
    'read:gems',
    'write:gems',
    'delete:gems',
    'manage:gems',
    'read:reports',
    'write:reports',
    'delete:reports',
    'manage:reports',
    'manage:roles',
    'manage:permissions'
  ],
  RESPONSABLE_GEM: [
    'read:gems',
    'write:gems',
    'manage:gems',
    'read:reports',
    'write:reports',
    'report:view_own'
  ],
  RESPONSABLE_GROUPE: [
    'read:groups',
    'write:groups',
    'read:gems',
    'read:reports',
    'write:reports',
    'report:view_group'
  ],
  PASTEUR_RESIDENT: [
    'read:members',
    'read:groups',
    'read:gems',
    'read:reports',
    'write:reports',
    'report:view_all'
  ],
  MEMBRE: [
    'read:own',
    'write:reports',
    'report:view_own'
  ]
} as const;

// Vérifier les permissions spécifiques pour les GEMs
export function checkGemPermissions(user: UserWithRoles, gemId?: string): {
  canView: boolean;
  canCreate: boolean;
  canManageMembers: boolean;
  canManageReports: boolean;
} {
  const isAdmin = hasRole(user, 'ADMIN');
  const isGemLeader = hasRole(user, 'RESPONSABLE_GEM');
  const isGroupLeader = hasRole(user, 'RESPONSABLE_GROUPE');
  const isPastor = hasRole(user, 'PASTEUR_RESIDENT');

  return {
    canView: isAdmin || isGemLeader || isGroupLeader || isPastor,
    canCreate: isAdmin || isGroupLeader || isPastor,
    canManageMembers: isAdmin || isGemLeader || isGroupLeader,
    canManageReports: isAdmin || isGemLeader || isGroupLeader || isPastor
  };
}

// Vérifier les permissions pour les rapports
export function checkReportPermissions(user: UserWithRoles, reportAuthorId?: string, userChurchId?: string): {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
} {
  const isAdmin = hasRole(user, 'ADMIN');
  const isGemLeader = hasRole(user, 'RESPONSABLE_GEM');
  const isGroupLeader = hasRole(user, 'RESPONSABLE_GROUPE');
  const isPastor = hasRole(user, 'PASTEUR_RESIDENT');

  return {
    canView: isAdmin || isGemLeader || isGroupLeader || isPastor,
    canCreate: isAdmin || isGemLeader || isGroupLeader || isPastor,
    canEdit: isAdmin || isGemLeader || isGroupLeader || (isPastor && reportAuthorId === user?.id),
    canDelete: isAdmin || (isGemLeader && reportAuthorId === user?.id) ||
               (isGroupLeader && reportAuthorId === user?.id) ||
               (isPastor && reportAuthorId === user?.id)
  };
}