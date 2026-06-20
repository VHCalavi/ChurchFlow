import { prisma } from '@churchflow/database'

export const documentService = {
  async getByMember(memberId: string) {
    return await prisma.memberDocument.findMany({
      where: { memberId },
      orderBy: { uploadedAt: 'desc' }
    })
  },

  async create(data: any) {
    return await prisma.memberDocument.create({ data })
  },

  async delete(id: string) {
    return await prisma.memberDocument.delete({ where: { id } })
  }
}
