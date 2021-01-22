import 'reflect-metadata'
import Koa from 'koa'

import config from '@config'
import Logger from '@logger'
import loader from '@loaders'

async function startServer() {
  const app = new Koa()

  await loader(app)

  app
    .listen(config.port)
    .on('listening', () => Logger.info(`Server is listening on port ${config.port}`))
    .on('error', err => {
      Logger.fatal(err)
      process.exit(1)
    })
}

startServer()
