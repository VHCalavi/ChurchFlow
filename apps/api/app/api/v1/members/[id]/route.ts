import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";
import { auth, getAuthUser, unauthorized, forbidden } from "../../../../../lib/auth";

const updateMemberSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").optional(),
  lastName: z.string().min(1, "Le nom est requis").optional(),
  gender: z.enum(["HOMME", "FEMME"]).optional(),
  birthDate: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(["SYMPATHISANT", "MEMBRE", "RESPONSABLE"]).optional(),
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
  supervisorId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        supervisor: {
          select: { id: true, firstName: true, lastName: true }
        },
        subordinates: {
          select: { id: true, firstName: true, lastName: true, status: true }
        },
        groups: {
          include: { group: true }
        },
        formations: {
          include: { formation: true }
        }
      }
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    if (member.churchId !== user.churchId) {
      return forbidden();
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération du membre: " + message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const result = updateMemberSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const currentMember = await prisma.member.findUnique({
      where: { id: params.id }
    });

    if (!currentMember) {
      return NextResponse.json(
        { success: false, error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    if (currentMember.churchId !== user.churchId) {
      return forbidden();
    }

    const status = result.data.status ?? currentMember.status;
    const grade = result.data.grade !== undefined ? result.data.grade : currentMember.grade;
    const echelon = result.data.echelon !== undefined ? result.data.echelon : currentMember.echelon;

    // Validation de la logique hiérarchique
    if (status !== "RESPONSABLE" && (grade || echelon)) {
      return NextResponse.json(
        { success: false, error: "Les grades et échelons ne s'appliquent qu'aux responsables" },
        { status: 400 }
      );
    }

    if (status === "RESPONSABLE" && (!grade || !echelon)) {
      return NextResponse.json(
        { success: false, error: "Un responsable doit obligatoirement avoir un grade et un échelon" },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: {
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        gender: result.data.gender,
        birthDate: result.data.birthDate ? new Date(result.data.birthDate) : undefined,
        phone: result.data.phone,
        email: result.data.email,
        address: result.data.address,
        status: result.data.status,
        grade: grade,
        echelon: echelon,
        supervisorId: result.data.supervisorId,
        notes: result.data.notes,
        isActive: result.data.isActive
      }
    });

    return NextResponse.json({ success: true, data: updatedMember });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour du membre: " + message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const user = getAuthUser(session);
  if (!user) return unauthorized();

  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id }
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Membre non trouvé" },
        { status: 404 }
      );
    }

    if (member.churchId !== user.churchId) {
      return forbidden();
    }

    await prisma.member.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true, message: "Membre archivé avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du membre: " + message },
      { status: 500 }
    );
  }
}
