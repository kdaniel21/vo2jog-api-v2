import { PrismaClient } from '@prisma/client'

export default (prisma: PrismaClient) => {
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
}
