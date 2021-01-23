import { EntityManager, RequestContext } from '@mikro-orm/core'
import { Context, Next } from 'koa'
import { container } from 'tsyringe'

export default (ctx: Context, next: Next) => {
  const em: EntityManager = container.resolve('em')
  return RequestContext.createAsync(em, next)
}
