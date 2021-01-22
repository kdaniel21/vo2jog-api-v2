// import BaseService from '@api/base/base.service'
// import {
//   Event,
//   EventCompetition,
//   EventQuestion,
//   Prisma,
//   PrismaClient,
// } from '@prisma/client'
// import { inject, injectable } from 'tsyringe'

// @injectable()
// export default class EventService extends BaseService<Event, Prisma.EventDelegate> {
//   constructor(@inject('prisma') private prisma: PrismaClient) {
//     super(prisma.event)
//   }

//   createCompetition(
//     eventId: string,
//     data: Prisma.EventCompetitionCreateInput,
//   ): Promise<EventCompetition> {
//     return this.prisma.eventCompetition.create({
//       data: { ...data, event: { connect: { id: eventId } } },
//     })
//   }

//   updateCompetitionById(
//     competitionId: string,
//     data: Prisma.EventCompetitionUpdateInput,
//   ): Promise<EventCompetition | null> {
//     return this.prisma.eventCompetition.update({ where: { id: competitionId }, data })
//   }

//   async deleteCompetitionById(competitionId: string): Promise<void> {
//     await this.prisma.eventCompetition.delete({ where: { id: competitionId } })
//   }

//   async createQuestion(
//     eventId: string,
//     data: Prisma.EventQuestionCreateInput,
//   ): Promise<EventQuestion> {
//     return this.prisma.eventQuestion.create({
//       data: { ...data, event: { connect: { id: eventId } } },
//     })
//   }

//   updateQuestionById(
//     questionId: string,
//     data: Prisma.EventCompetitionUpdateInput,
//   ): Promise<EventCompetition | null> {
//     return this.prisma.eventCompetition.update({ where: { id: questionId }, data })
//   }

//   async deleteQuestionById(questionId: string): Promise<void> {
//     await this.prisma.eventCompetition.delete({ where: { id: questionId } })
//   }
// }
