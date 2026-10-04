import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { z } from "zod";

const createChurchSchema = z.object({
  name: z.string().min(1, "Le nom de l'église est requis"),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable().or(z.literal("")),
  website: z.string().url("URL du site web invalide").optional().nullable().or(z.literal("")),
  logoUrl: z.string().url("URL du logo invalide").optional().nullable().or(z.literal(""))
});

export async function GET() {
  try {
    const churches = await prisma.church.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ success: true, data: churches });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des églises: " + message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createChurchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }

    const church = await prisma.church.create({
      data: {
        name: result.data.name,
        description: result.data.description || null,
        address: result.data.address || null,
        phone: result.data.phone || null,
        email: result.data.email || null,
        website: result.data.website || null,
        logoUrl: result.data.logoUrl || null
      }
    });

    return NextResponse.json({ success: true, data: church }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la création de l'église: " + message },
      { status: 500 }
    );
  }
}
