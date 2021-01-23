import { Next, Context } from 'koa'
import compose from 'koa-compose'
import { container } from 'tsyringe'
import validateJwt from '@auth/api/middleware/validate-jwt'
import { Logger } from 'pino-multi-stream'
import { User } from '@components/auth/entities/user.entity'
import { EntityRepository } from '@mikro-orm/core'

export const fetchUser = async (ctx: Context, next: Next) => {
  try {
    const logger: Logger = container.resolve('logger')
    const userRepository: EntityRepository<User> = container.resolve('userRepository')

    const { id }: { id: string } = ctx.state.auth.user
    logger.info('Fetching user with id %s', id)
    const userRecord = await userRepository.findOneOrFail({ id }, ['profile'])

    logger.info('User %s fetched', userRecord.email)
    ctx.state.auth.user = userRecord
  } catch {
    return ctx.throw(404, 'User with the specified ID not found.')
  }

  await next()
}

export default compose([validateJwt, fetchUser])
