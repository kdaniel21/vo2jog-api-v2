import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from 'koa2-cors'
import helmet from 'koa-helmet'

import { loggerMiddleware } from '@logger'
import router from '@components/router'
import Logger from '@logger'

export default (app: Koa<Koa.DefaultState, Koa.DefaultContext>) => {
  app.use(helmet()).use(bodyParser()).use(cors()).use(loggerMiddleware)

  // ERROR HANDLING
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      const status = err.status || 500
      ctx.body = {
        status: err.title || ctx.status >= 500 ? 'error' : 'fail',
        message: err.message,
      }
      ctx.status = status

      Logger.error('Request failed: %s', err.message)
    }
  })

  // Load routes
  app.use(router().routes()).use(router().allowedMethods())
}
