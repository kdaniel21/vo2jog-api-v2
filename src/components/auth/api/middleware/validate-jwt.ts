import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import config from '@config'
import compose from 'koa-compose'
import includeTokens from '@auth/api/middleware/include-tokens'
import { container } from 'tsyringe'
import { Logger } from 'pino'

// const logger: Logger = container.resolve('logger')
const logger: any = {}

export const validateJwt = async (ctx: Context, next: Next) => {
  try {
    const { accessToken } = ctx.state.auth
    if (!accessToken) throw new Error()

    logger.info('Decoding access token %s', accessToken)
    const decoded = jwt.verify(accessToken, config.auth.jwtSecret)

    const { user } = decoded as any
    logger.info('User %s authenticated', user.email)
    ctx.state.auth = {
      ...ctx.state.auth,
      user,
    }
    await next()
  } catch {
    ctx.throw(401, 'Invalid or expired access token.')
  }
}

export default compose([includeTokens, validateJwt])
