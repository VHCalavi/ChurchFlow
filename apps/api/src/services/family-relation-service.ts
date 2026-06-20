import { prisma } from '@churchflow/database'

export const familyRelationService = {
  async getByMember(memberId: string, filters: any) {
    const validTypes = []
    if (filters?.includeFamily) {
      validTypes.push('PARENT', 'ENFANT', 'SPOUSE', 'SIBLING')
    }
    if (filters?.includeGem) {
      validTypes.push('GEM_PARTNER')
    }

    return await prisma.familyRelation.findMany({
      where: {
        memberId,
        isActive: true,
        ...(validTypes.length > 0 ? { relationType: { in: validTypes } } : {})
      },
      include: { relative: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } }
    })
  },

  async update(id: string, data: any) {
    return await prisma.familyRelation.update({
      where: { id },
      data
    })
  },

  async delete(id: string) {
    return await prisma.familyRelation.delete({ where: { id } })
  }
}
