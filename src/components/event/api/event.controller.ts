// import BaseController from '@api/base/base.controller'
// import { inject, injectable } from 'tsyringe'
// import { Event, EventLocation } from '@prisma/client'
// import EventService from '../event.service'
// import { Context } from 'koa'

// @injectable()
// export default class EventController extends BaseController<Event> {
//   constructor(@inject(EventService) private eventService: EventService) {
//     super(eventService)
//   }

//   async createCompetition(ctx: Context) {
//     const { id } = ctx.params
//     const { body } = ctx.request

//     const competition = await this.eventService.createCompetition(id, body)

//     ctx.body = { ...competition }
//   }

//   async updateCompetition(ctx: Context) {
//     const { competitionId } = ctx.params
//     const { body } = ctx.request

//     const competition = await this.eventService.updateCompetitionById(competitionId, body)

//     ctx.body = { ...competition }
//   }

//   async deleteCompetition(ctx: Context) {
//     const { competitionId } = ctx.params

//     await this.eventService.deleteCompetitionById(competitionId)

//     ctx.status = 204
//   }

//   async createQuestion(ctx: Context) {
//     const { eventId } = ctx.params
//     const { body } = ctx.request

//     const question = await this.eventService.createQuestion
//   }
// }
