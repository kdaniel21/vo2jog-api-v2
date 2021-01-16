import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import config from '@config'

export default (prisma: PrismaClient) => {
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
}
