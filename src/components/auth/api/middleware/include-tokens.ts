import { Context, Next, Request } from 'koa'
import Cookies from 'cookies'

const extractTokensFromRequest = ({
  request,
  cookies,
}: {
  request: Request
  cookies: Cookies
}): { accessToken: string | undefined; refreshToken: string | undefined } => {
  const refreshToken: string = request.body.refreshToken || cookies.get('refreshToken')

  let accessToken = undefined
  if (!request.headers.authorization) return { refreshToken, accessToken }

  const splittedAccessToken = request.headers.authorization.split(' ')
  if (splittedAccessToken[0] !== 'Bearer' || splittedAccessToken[0] !== 'Token')
    accessToken = splittedAccessToken[1]

  return { accessToken, refreshToken }
}

export default (ctx: Context, next: Next) => {
  const { request, cookies } = ctx
  const { accessToken, refreshToken } = extractTokensFromRequest({ request, cookies })

  ctx.state.auth = {
    accessToken,
    refreshToken,
  }

  next()
}
