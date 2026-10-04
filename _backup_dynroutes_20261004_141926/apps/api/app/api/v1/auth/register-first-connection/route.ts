import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { hashPassword } from "@churchflow/auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // 2. Check if a member with this email exists and is not linked
    const member = await prisma.member.findFirst({
      where: { email, userId: null }
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Aucun membre non configuré trouvé avec cet email" },
        { status: 400 }
      );
    }

    // 3. Extract system role from member metadata
    const metadata = (member.metadata || {}) as Record<string, unknown>;
    const systemRoleName = (metadata.systemRole as string) || "MEMBRE";

    // 4. Find the system role in DB
    let role = await prisma.role.findUnique({
      where: { name: systemRoleName }
    });

    if (!role) {
      // Fallback to MEMBRE role if pre-configured one doesn't exist
      role = await prisma.role.findUnique({
        where: { name: "MEMBRE" }
      });
    }

    if (!role) {
      return NextResponse.json(
        { success: false, error: "Rôle par défaut introuvable dans le système" },
        { status: 500 }
      );
    }

    // 5. Hash password and create User
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: member.email!,
        name: `${member.firstName} ${member.lastName}`,
        password: passwordHash,
        churchId: member.churchId,
        isActive: true,
      }
    });

    // 6. Map role to User
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id
      }
    });

    // 7. Link Member to User
    await prisma.member.update({
      where: { id: member.id },
      data: { userId: user.id }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la configuration du compte: " + message },
      { status: 500 }
    );
  }
}
