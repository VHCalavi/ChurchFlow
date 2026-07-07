import { PrismaClient } from '@prisma/client';

/**
 * Vérifie de façon récursive si un membre est subordonné (directement ou indirectement) à un superviseur.
 * Limité à une profondeur maximale pour éviter les boucles infinies.
 */
export async function isPastoralSubordinate(
  supervisorId: string,
  memberId: string,
  prisma: PrismaClient,
  maxDepth = 10
): Promise<boolean> {
  if (!supervisorId || !memberId) return false;
  if (supervisorId === memberId) return false;

  let currentMemberId: string | null = memberId;
  let depth = 0;

  while (currentMemberId && depth < maxDepth) {
    const member = await prisma.member.findUnique({
      where: { id: currentMemberId },
      select: { supervisorId: true }
    });

    if (!member || !member.supervisorId) {
      return false;
    }

    if (member.supervisorId === supervisorId) {
      return true;
    }

    currentMemberId = member.supervisorId;
    depth++;
  }

  return false;
}

/**
 * Vérifie si l'utilisateur actuel a le droit d'accéder au suivi pastoral d'un membre cible.
 * 
 * Règles d'accès :
 * - Les admins ont accès à tout
 * - Le superviseur direct a accès
 * - Les pasteurs de niveau PAYS ont accès à tout le monde
 * - Les pasteurs de niveau ZONE/SUPERVISEUR ont accès à ceux qui sont dans leur chaîne de subordination
 */
export async function requireFollowupAccess(
  currentUser: any,
  targetMemberId: string,
  prisma: PrismaClient
): Promise<boolean> {
  // Cas 1 : Admin = accès total
  if (currentUser.roles?.includes("ADMIN")) {
    return true;
  }

  // On récupère les infos du current user (s'il a un profil membre)
  const currentMember = await prisma.member.findUnique({
    where: { userId: currentUser.id }
  });

  if (!currentMember) return false;

  // Si on cible son propre profil
  if (currentMember.id === targetMemberId) return true;

  // On récupère le membre cible
  const targetMember = await prisma.member.findUnique({
    where: { id: targetMemberId }
  });

  if (!targetMember) return false;

  // Cas 2 : Superviseur direct
  if (targetMember.supervisorId === currentMember.id) {
    return true;
  }

  // Cas 3 : Pasteur de niveau PAYS
  if (currentMember.pastorLevel === "PAYS") {
    return true;
  }

  // Cas 4 : Superviseur ou Pasteur de Zone (chaîne hiérarchique)
  if (currentMember.pastorLevel === "ZONE" || currentMember.pastorLevel === "SUPERVISEUR" || currentMember.pastorLevel === "RESIDENT") {
    const isSubordinate = await isPastoralSubordinate(currentMember.id, targetMemberId, prisma as any);
    if (isSubordinate) return true;
  }

  return false;
}
