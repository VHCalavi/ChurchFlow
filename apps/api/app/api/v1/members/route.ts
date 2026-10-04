import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized } from "../../../../lib/auth";
import { syncUserRole } from "../../../../src/lib/sync-user-role";

export const dynamic = "force-dynamic";

const createMemberSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  gender: z.enum(["HOMME", "FEMME"]).default("HOMME"),
  birthDate: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["SYMPATHISANT", "MEMBRE", "RESPONSABLE"]),
  grade: z.enum([
    "ASPIRANT",
    "SERVITEUR",
    "GAGNEUR_AMES",
    "ASSISTANT_PASTEUR",
    "PASTEUR_ASSISTANT",
    "PASTEUR_TITULAIRE"
  ]).optional().nullable(),
  echelon: z.enum([
    "C2",
    "C5",
    "C10",
    "C20",
    "GA_C50",
    "GA_C100"
  ]).optional().nullable(),
  pastorLevel: z.enum([
    "SUPERVISEUR",
    "RESIDENT",
    "PAYS",
    "ZONE",
    "SOUS_ZONE"
  ]).optional().nullable(),
  churchId: z.string().optional(),
  supervisorId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  systemRole: z.string().optional().nullable()
});

export async function GET() {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const members = await prisma.member.findMany({
      where: { churchId: user.churchId, isActive: true },
      include: {
        supervisor: {
          select: { id: true, firstName: true, lastName: true }
        },
        user: {
          select: {
            id: true,
            email: true,
            roles: {
              select: {
                role: { select: { id: true, name: true, description: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des membres: " + message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const result = createMemberSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { status, grade, echelon, pastorLevel } = result.data;

    if (status !== "RESPONSABLE" && (grade || echelon || pastorLevel)) {
      return NextResponse.json(
        { success: false, error: "Les grades, échelons et niveaux pastoraux ne s'appliquent qu'aux responsables" },
        { status: 400 }
      );
    }

    if (status === "RESPONSABLE" && (!grade || !echelon)) {
      return NextResponse.json(
        { success: false, error: "Un responsable doit obligatoirement avoir un grade et un échelon" },
        { status: 400 }
      );
    }

    const member = await prisma.$transaction(async (tx) => {
      const created = await tx.member.create({
        data: {
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          gender: result.data.gender,
          birthDate: result.data.birthDate ? new Date(result.data.birthDate) : null,
          phone: result.data.phone,
          email: result.data.email,
          address: result.data.address,
          status: result.data.status,
          grade: result.data.grade || null,
          echelon: result.data.echelon || null,
          pastorLevel: result.data.pastorLevel || null,
          churchId: user.churchId,
          supervisorId: result.data.supervisorId || null,
          notes: result.data.notes,
          metadata: result.data.systemRole
            ? { systemRole: result.data.systemRole }
            : {},
        },
      });

      // Cas rare mais possible : un userId est déjà lié
      if (created.userId && result.data.systemRole) {
        await syncUserRole(tx, created.userId, result.data.systemRole);
      }

      return created;
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création du membre: " + message },
      { status: 500 }
    );
  }
}
