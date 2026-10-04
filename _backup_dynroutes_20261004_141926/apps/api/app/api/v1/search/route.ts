import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";
import { auth, getAuthUser, unauthorized } from "../../../../lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const authUser = getAuthUser(session);

    if (!authUser) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    
    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const churchId = authUser.churchId; 

    // Promesses en parallèle
    const [members, groups, gems] = await Promise.all([
      prisma.member.findMany({
        where: {
          churchId,
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, status: true, photoUrl: true }
      }),
      prisma.group.findMany({
        where: {
          churchId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, type: true }
      }),
      prisma.gem.findMany({
        where: {
          churchId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, description: true }
      })
    ]);

    // Formatage unifié
    const results = [
      ...members.map(m => ({
        id: m.id,
        title: `${m.firstName} ${m.lastName}`,
        subtitle: m.phone || m.email || "Aucun contact",
        type: "MEMBERS",
        url: `/dashboard/members/${m.id}`,
        extra: m.status
      })),
      ...groups.map(g => ({
        id: g.id,
        title: g.name,
        subtitle: g.type === "DEPARTEMENT" ? "Département" : "Tribu",
        type: "GROUPS",
        url: `/dashboard/groups/${g.id}`,
      })),
      ...gems.map(g => ({
        id: g.id,
        title: g.name,
        subtitle: g.description ? g.description : "Cellule GEM",
        type: "GEMS",
        url: `/dashboard/gems/${g.id}`,
      }))
    ];

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error("[SEARCH_GET]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
