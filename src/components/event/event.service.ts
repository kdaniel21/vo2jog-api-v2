import { Event, PrismaClient } from '@prisma/client'
import { inject, injectable } from 'tsyringe'

@injectable()
export class EventService {
  constructor(@inject('prisma') private prismaClient: PrismaClient) {}

  findEvents(conditions: Partial<Event>) {
    return this.prismaClient.event.findMany({ where: conditions })
  }
}
