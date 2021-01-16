import { Context, Next } from 'koa'
import Logger from '@logger'

// Global error handler middleware
export default async (ctx: Context, next: Next) => {
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
}
