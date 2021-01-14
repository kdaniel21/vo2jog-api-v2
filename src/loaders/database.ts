import config from '@config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

export default (): PrismaClient => {
  const prisma = new PrismaClient()

  // MIDDLEWARES
  // Hash password using bcrypt
  prisma.$use(async (params, next) => {
    const actions = ['create', 'update', 'updateMany']
    const models = ['User']
    const conditionsArray = [
      actions.includes(params.action),
      params.model && models.includes(params.model),
      params.args.data && Object.keys(params.args.data).includes('password'),
    ]
    if (conditionsArray.includes(false)) return next(params)

    const { password } = params.args.data
    params.args.data.password = await bcrypt.hash(password, config.auth.saltRounds)

    return next(params)
  })

  // Soft delete
  prisma.$use(async (params, next) => {
    const actions = ['delete', 'deleteMany']
    const models = ['User']
    const conditionsArray = [
      actions.includes(params.action),
      params.model && models.includes(params.model),
    ]
    if (conditionsArray.includes(false)) return next(params)

    params.action = params.action === 'delete' ? 'update' : 'updateMany'
    params.args.data = { ...params.args.data, deleted: true }

    return next(params)
  })

  // Prevent querying/updating soft deleted data
  prisma.$use(async (params, next) => {
    const actions = ['findUnique', 'findFirst', 'findMany', 'update', 'updateMany']
    const models = ['User']
    const conditionsArray = [
      actions.includes(params.action),
      params.model && models.includes(params.model),
      !params.args.where?.deleted,
    ]
    if (conditionsArray.includes(false)) return next(params)

    // Prevent finding as unique
    if (params.action === 'findUnique') params.action = 'findFirst'
    else if (params.action === 'update') params.action = 'updateMany'

    params.args.where = {
      ...params.args.where,
      deleted: false,
    }

    return next(params)
  })

  return prisma
}
