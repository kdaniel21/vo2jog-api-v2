import Router from 'koa-router'
import authRouter from '@auth/api/auth.routes'
import eventRouter from '@event/api/event.routes'
import config from '@config'

export default (): Router => {
  const { prefix } = config.api
  const api = new Router({ prefix })

  authRouter(api)
  // eventRouter(api)

  return api
}
