import { prisma } from '@churchflow/database'

export const familyRelationService = {
  async getByMember(memberId: string, filters: any) {
    let relations: any[] = []

    if (filters?.includeFamily !== false) {
      const validTypes = ['PARENT', 'ENFANT', 'SPOUSE', 'SIBLING']
      const familyRelations = await prisma.familyRelation.findMany({
        where: {
          memberId,
          isActive: true,
          relationType: { in: validTypes }
        },
        include: { relative: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } }
      })
      relations = [...relations, ...familyRelations]
    }

    if (filters?.includeGem !== false) {
      const myGemMembership = await prisma.gemMember.findUnique({
        where: { memberId },
        select: { gemId: true }
      })

      if (myGemMembership) {
        const gemPartners = await prisma.gemMember.findMany({
          where: { 
            gemId: myGemMembership.gemId,
            memberId: { not: memberId }
          },
          include: { member: { select: { id: true, firstName: true, lastName: true, photoUrl: true } } }
        })

        const virtualGemRelations = gemPartners.map(gp => ({
          id: `gem_virtual_${myGemMembership.gemId}_${gp.memberId}`,
          memberId: memberId,
          relativeId: gp.memberId,
          relationType: 'GEM_PARTNER',
          isActive: true,
          relative: gp.member
        }))

        relations = [...relations, ...virtualGemRelations]
      }
    }

    return relations
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
