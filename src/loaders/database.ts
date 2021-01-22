import { MikroORM } from '@mikro-orm/core'

export default async () => {
  // const prisma = new PrismaClient()

  // // Load middleware
  // registerMiddleware(prisma)

  // return prisma

  const orm = await MikroORM.init()

  return orm.em
}
