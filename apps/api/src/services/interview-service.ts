import { prisma } from '@churchflow/database'

export const interviewService = {
  async getByMember(memberId: string) {
    return await prisma.memberInterview.findMany({
      where: { memberId },
      include: { interviewer: { select: { firstName: true, lastName: true } } },
      orderBy: { date: 'desc' }
    })
  },

  async getById(id: string) {
    return await prisma.memberInterview.findUnique({
      where: { id },
      include: { interviewer: { select: { firstName: true, lastName: true } } }
    })
  },

  async create(data: any) {
    return await prisma.memberInterview.create({
      data,
      include: { interviewer: { select: { firstName: true, lastName: true } } }
    })
  },

  async delete(id: string) {
    return await prisma.memberInterview.delete({ where: { id } })
  }
}
