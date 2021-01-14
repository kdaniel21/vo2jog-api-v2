import Router from 'koa-router'
import auth from '@auth/api/auth.routes'
import config from '@config'

export default (): Router => {
  const { prefix } = config.api
  const api = new Router({ prefix })

  auth(api)

  return api
}
