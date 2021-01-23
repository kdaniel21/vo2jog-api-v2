import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import config from '@config'
import compose from 'koa-compose'
import includeTokens from '@auth/api/middleware/include-tokens'
import { container } from 'tsyringe'
import { Logger } from 'pino'

export const validateJwt = async (ctx: Context, next: Next) => {
  try {
    const logger: Logger = container.resolve('logger')

    const { accessToken } = ctx.state.auth
    if (!accessToken) throw new Error()

    logger.info('Decoding access token')
    const decoded = jwt.verify(accessToken, config.auth.jwtSecret)

    const { user } = decoded as any
    logger.info('User %s authenticated', user.email)
    ctx.state.auth = {
      ...ctx.state.auth,
      user,
    }
  } catch {
    return ctx.throw(401, 'Invalid or expired access token.')
  }

  await next()
}

export default compose([includeTokens, validateJwt])
