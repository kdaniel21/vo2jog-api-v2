import { PrismaClient } from '@prisma/client'
import encryptPassword from '@database/middleware/encrypt-password'

// Register all middleware
export default (prismaClient: PrismaClient) => {
  encryptPassword(prismaClient)
}
