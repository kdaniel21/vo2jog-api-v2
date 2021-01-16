import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'
import config from '@config'
import compose from 'koa-compose'
import includeTokens from '@auth/api/middleware/include-tokens'

export const validateJwt = async (ctx: Context, next: Next) => {
  try {
    const { accessToken } = ctx.state.auth
    if (!accessToken) throw new Error()

    const decoded = jwt.verify(accessToken, config.auth.jwtSecret)

    ctx.state.auth = {
      ...ctx.state.auth,
      user: (decoded as any).user,
    }
    await next()
  } catch {
    ctx.throw(401, 'Invalid or expired access token.')
  }
}

export default compose([includeTokens, validateJwt])
