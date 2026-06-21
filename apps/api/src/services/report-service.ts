import { prisma } from '@churchflow/database';
import { Report } from '@churchflow/types';

export const reportService = {
  async getFiltered(userId: string, churchId: string, userRole: string) {
    const whereClause = {
      churchId,
      ...(userRole === 'RESPONSABLE_GEM' && {
        OR: [
          { authorId: userId },
          { gem: { members: { some: { memberId: userId } } } }
        ]
      })
    };

    return await prisma.report.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        gem: { select: { id: true, name: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
  },

  async getById(id: string) {
    return await prisma.report.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, status: true } },
        gem: { select: { id: true, name: true } }
      }
    });
  },

  async create(data: { title: string; content: string; type?: string; gemId?: string; authorId: string; churchId: string }) {
    return await prisma.report.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type || 'ACTIVITY',
        gemId: data.gemId,
        authorId: data.authorId,
        churchId: data.churchId
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        gem: { select: { id: true, name: true } }
      }
    });
  },

  async update(id: string, data: { title?: string; content?: string; type?: string }) {
    return await prisma.report.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        gem: { select: { id: true, name: true } }
      }
    });
  },

  async delete(id: string) {
    return await prisma.report.delete({
      where: { id }
    });
  },

  async getByGem(gemId: string) {
    return await prisma.report.findMany({
      where: { gemId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
  },

  async getByUser(userId: string) {
    return await prisma.report.findMany({
      where: { authorId: userId },
      include: {
        gem: { select: { id: true, name: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
  }
};