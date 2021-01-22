import { EntityManager, MikroORM } from '@mikro-orm/core'

export default async (): Promise<EntityManager> => {
  // const prisma = new PrismaClient()

  // // Load middleware
  // registerMiddleware(prisma)

  // return prisma

  const orm = await MikroORM.init()

  return orm.em
}
