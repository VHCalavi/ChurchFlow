import { NextResponse } from 'next/server';
import { prisma } from '@churchflow/database';

// DELETE a family relation (and its inverse automatically)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; relationId: string } }
) {
  try {
    // Trouver la relation originale
    const relation = await prisma.familyRelation.findUnique({
      where: { id: params.relationId },
    });

    if (!relation) {
      return NextResponse.json({ success: false, error: 'Relation introuvable' }, { status: 404 });
    }

    const inverseMap: Record<string, string> = {
      PARENT: 'ENFANT',
      ENFANT: 'PARENT',
      SPOUSE: 'SPOUSE',
      SIBLING: 'SIBLING',
      GEM_PARTNER: 'GEM_PARTNER',
    };
    const inverseType = inverseMap[relation.relationType] ?? relation.relationType;

    // Supprimer les deux relations en transaction
    await prisma.$transaction([
      prisma.familyRelation.delete({ where: { id: params.relationId } }),
      prisma.familyRelation.deleteMany({
        where: {
          memberId: relation.relativeId,
          relativeId: relation.memberId,
          relationType: inverseType,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Relation supprimée des deux côtés' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
