import Router from 'koa-router'
import { container } from 'tsyringe'
import { EventController } from './event.controller'

const router = new Router()

export default (api: Router) => {
  const eventController: EventController = container.resolve(EventController)

  router.get('/', ctx => eventController.findEvents(ctx))
  router.get('/:id', ctx => eventController.findEventById(ctx))
  router.post('/', ctx => eventController.createEvent(ctx))
  router.patch('/:id', ctx => eventController.updateEventById(ctx))
  router.delete('/:id', ctx => eventController.deleteEvent(ctx))

  api.use('/events', router.routes(), router.allowedMethods())
}
