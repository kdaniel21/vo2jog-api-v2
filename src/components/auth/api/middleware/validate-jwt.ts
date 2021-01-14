import { Context, Next, Request } from 'koa'
import Cookies from 'cookies'
import jwt from 'jsonwebtoken'
import config from '@config'

const extractTokensFromRequest = ({
  request,
  cookies,
}: {
  request: Request
  cookies: Cookies
}): { accessToken: string | undefined; refreshToken: string | undefined } => {
  const refreshToken = cookies.get('refreshToken')

  let accessToken = null
  // Extract access token from header if not found in body
  const splittedAccessToken = request.headers.authorization.split(' ')
  if (splittedAccessToken[0] !== 'Bearer' || splittedAccessToken[0] !== 'Token')
    accessToken = splittedAccessToken[1]

  return { accessToken, refreshToken }
}

export default (ctx: Context, next: Next) => {
  try {
    const { request, cookies } = ctx
    const { accessToken, refreshToken } = extractTokensFromRequest({ request, cookies })

    if (!accessToken) throw new Error()
    const decoded = jwt.verify(accessToken, config.auth.jwtSecret)

    ctx.state.auth = {
      refreshToken,
      accessToken,
      user: (decoded as any).user,
    }
    next()
  } catch {
    ctx.throw(401, 'Invalid or expired access token.')
  }
}
