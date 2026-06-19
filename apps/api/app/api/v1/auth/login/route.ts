import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { comparePassword } from "@churchflow/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 1. Rechercher l'utilisateur avec son église et ses rôles
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        church: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      // Check if a member with this email exists and has no associated user
      const member = await prisma.member.findFirst({
        where: { email, userId: null }
      });
      if (member) {
        return NextResponse.json({
          success: true,
          firstConnection: true,
          email: member.email
        });
      }
      return NextResponse.json(
        { success: false, error: "Identifiants incorrects (utilisateur introuvable)" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, error: "Identifiants incorrects (mot de passe non configuré)" },
        { status: 401 }
      );
    }

    // 2. Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Ce compte a été désactivé" },
        { status: 403 }
      );
    }

    // 3. Comparer les mots de passe
    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, error: "Identifiants incorrects (mot de passe incorrect)" },
        { status: 401 }
      );
    }

    // 4. Formater la réponse pour la session
    const roleNames = user.roles.map((ur: { role: { name: string }; roleId: string }) => ur.role.name);
    const roleIds = user.roles.map((ur: { role: { name: string }; roleId: string }) => ur.roleId);
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roleIds } },
      include: { permission: true }
    });
    const permissionNames = Array.from(
      new Set(rolePermissions.map(rp => `${rp.permission.action}:${rp.permission.resource}`))
    );

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        churchId: user.churchId,
        churchName: user.church.name,
        roles: roleNames,
        permissions: permissionNames
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la tentative de connexion: " + message },
      { status: 500 }
    );
  }
}
