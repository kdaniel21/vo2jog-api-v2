import logger from 'koa-pino-logger'
import fs from 'fs'
import { multistream } from 'pino-multi-stream'
import pinoColada from 'pino-colada'
import config from '@config'

let streams: { stream: fs.WriteStream }[] = []
if (config.production) {
  streams = [{ stream: fs.createWriteStream('/logs/log.stream.out') }]
}

export const loggerMiddleware = logger(
  {
    prettyPrint: !config.production,
    level: config.testing ? 'silent' : config.logs.level,
    prettifier: !config.production ? pinoColada : null,
  },
  // multistream(streams),
)

export default loggerMiddleware.logger
