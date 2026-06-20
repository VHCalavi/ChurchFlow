import { prisma } from '@churchflow/database'

export const inactivityConfigService = {
  async getConfig(churchId: string) {
    return await prisma.inactivityConfig.findUnique({
      where: { churchId }
    })
  },

  async updateConfig(churchId: string, data: any) {
    return await prisma.inactivityConfig.upsert({
      where: { churchId },
      update: data,
      create: { ...data, churchId }
    })
  }
}
