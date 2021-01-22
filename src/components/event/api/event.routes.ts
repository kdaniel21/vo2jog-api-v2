import Router from 'koa-router'
import { container } from 'tsyringe'
import EventController from './event.controller'

const router = new Router()

export default (api: Router) => {
  const eventController: EventController = container.resolve(EventController)

  router.get('/', ctx => eventController.findMany(ctx))
  router.get('/:id', ctx => eventController.findById(ctx))
  router.post('/', ctx => eventController.createOne(ctx))
  router.patch('/:id', ctx => eventController.updateById(ctx))
  router.delete('/:id', ctx => eventController.deleteById(ctx))

  api.use('/events', router.routes(), router.allowedMethods())
}
