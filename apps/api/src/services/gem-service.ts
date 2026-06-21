import { prisma } from '@churchflow/database';
import { Gem, GemMember } from '@churchflow/types';

export const gemService = {
  async getAll(churchId: string, groupId?: string) {
    return await prisma.gem.findMany({
      where: {
        churchId,
        isActive: true,
        ...(groupId && { groupId })
      },
      include: {
        group: { select: { id: true, name: true } },
        members: {
          include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } }
        },
        reports: {
          select: { id: true, title: true, type: true, submittedAt: true },
          orderBy: { submittedAt: 'desc' }
        },
        _count: { select: { members: true, reports: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getById(id: string) {
    return await prisma.gem.findUnique({
      where: { id },
      include: {
        group: { select: { id: true, name: true } },
        members: {
          include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } },
          orderBy: { isLeader: 'desc', joinedAt: 'asc' }
        },
        reports: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });
  },

  async create(data: { name: string; description?: string; groupId?: string; isActive?: string; churchId: string }) {
    return await prisma.gem.create({
      data: {
        name: data.name,
        description: data.description,
        groupId: data.groupId,
        isActive: data.isActive === 'true',
        churchId: data.churchId
      },
      include: {
        group: { select: { id: true, name: true } },
        members: { include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } } }
      }
    });
  },

  async update(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    return await prisma.gem.update({
      where: { id },
      data,
      include: {
        group: { select: { id: true, name: true } },
        members: { include: { member: { select: { id: true, firstName: true, lastName: true, status: true } } } }
      }
    });
  },

  async delete(id: string) {
    return await prisma.gem.delete({
      where: { id }
    });
  },

  async addMember(gemId: string, memberId: string, role: string = 'MEMBER') {
    const newMember = await prisma.gemMember.create({
      data: {
        gemId,
        memberId,
        role,
        isLeader: role === 'LEADER'
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, status: true } }
      }
    });

    if (role === 'LEADER') {
      await prisma.gem.update({
        where: { id: gemId },
        data: {
          members: {
            updateMany: {
              where: { gemId, id: { not: newMember.id } },
              data: { isLeader: false }
            }
          }
        }
      });
    }

    return newMember;
  },

  async setLeader(gemId: string, memberId: string, memberUserId?: string) {
    if (memberUserId) {
      await prisma.gemMember.update({
        where: { gemId_memberId: { gemId, memberId: memberUserId } },
        data: { isLeader: false }
      });
    }

    const leader = await prisma.gemMember.update({
      where: { gemId_memberId: { gemId, memberId } },
      data: { isLeader: true, role: 'LEADER' }
    });

    await prisma.gemMember.updateMany({
      where: { gemId, id: { not: leader.id } },
      data: { isLeader: false, role: 'MEMBER' }
    });

    return leader;
  },

  async removeMember(gemId: string, memberId: string) {
    const gemMember = await prisma.gemMember.findUnique({
      where: { gemId_memberId: { gemId, memberId } },
      include: { member: { select: { id: true, firstName: true, lastName: true } } }
    });

    if (!gemMember) return null;

    if (gemMember.isLeader) {
      const newLeader = await prisma.gemMember.findFirst({
        where: { gemId, isLeader: false }
      });

      if (newLeader) {
        await prisma.gemMember.update({
          where: { id: newLeader.id },
          data: { isLeader: true, role: 'LEADER' }
        });
      }
    }

    await prisma.gemMember.delete({
      where: { gemId_memberId: { gemId, memberId } }
    });

    return gemMember;
  }
};