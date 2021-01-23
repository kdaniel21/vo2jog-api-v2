import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import cors from 'koa2-cors'
import helmet from 'koa-helmet'

import { loggerMiddleware } from '@logger'
import router from '@api/router'
import errorHandler from '@api/middleware/error-handler'
import mikroOrm from '@api/middleware/mikro-orm'

export default (app: Koa<Koa.DefaultState, Koa.DefaultContext>) => {
  app
    // Global middleware
    .use(helmet())
    .use(bodyParser())
    .use(cors())
    .use(loggerMiddleware)
    .use(errorHandler)
    .use(mikroOrm)
    // Load routes
    .use(router().routes())
    .use(router().allowedMethods())
}
