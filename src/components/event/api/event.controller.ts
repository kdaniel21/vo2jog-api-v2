import ApiFeatures from '@utils/extract-api-features'
import { Logger } from 'pino-multi-stream'
import { inject, injectable } from 'tsyringe'
import { Context } from 'koa'
import { EventService } from '../event.service'
import { Prisma } from '@prisma/client'
import { AppError } from '@utils/app-error'

@injectable()
export class EventController {
  constructor(
    @inject(EventService) private eventService: EventService,
    @inject('logger') private logger: Logger,
  ) {}

  async createEvent(ctx: Context) {
    const { body } = ctx.request

    const newEvent = await this.eventService.createEvent(body)

    ctx.body = { data: newEvent }
  }

  async findEventById(ctx: Context) {
    const { id } = ctx.params
    if (!id) throw new AppError('Invalid ID.')

    const event = await this.eventService.findEventById(id)

    ctx.body = { data: event }
  }

  async findEvents(ctx: Context) {
    const { query, ...features } = new ApiFeatures<
      Prisma.EventWhereInput,
      Prisma.EventOrderByInput
    >(ctx)

    console.log(features)

    const events = await this.eventService.findEvents()

    ctx.body = { data: events }
  }

  async updateEventById(ctx: Context) {
    const { id } = ctx.params
    if (!id) throw new AppError('Invalid ID.')

    const event = await this.eventService.updateEventById(id, ctx.request.body)

    ctx.body = { data: event }
  }

  async deleteEvent(ctx: Context) {
    const { id } = ctx.params
    if (!id) throw new AppError('Invalid ID.')

    await this.eventService.deleteEventById(id)

    ctx.body = { status: 'success' }
  }
}
