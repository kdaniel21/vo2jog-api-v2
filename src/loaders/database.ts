import { PrismaClient } from '@prisma/client'
import registerMiddleware from '@database/middleware/index'

export default (): PrismaClient => {
  const prisma = new PrismaClient()

  // Load middleware
  registerMiddleware(prisma)

  return prisma
}
