import { Event, Prisma, PrismaClient } from '@prisma/client'
import { inject, injectable } from 'tsyringe'

@injectable()
export class EventService {
  constructor(@inject('prisma') private prismaClient: PrismaClient) {}

  findEvents(
    params: {
      skip?: number
      take?: number
      where?: Prisma.EventWhereInput
      orderBy?: Prisma.EventOrderByInput
    } = {},
  ): Promise<Event[]> {
    return this.prismaClient.event.findMany(params)
  }

  findEventById(id: string): Promise<Event | null> {
    return this.prismaClient.event.findUnique({ where: { id } })
  }

  createEvent(data: Prisma.EventCreateInput): Promise<Event> {
    return this.prismaClient.event.create({ data })
  }

  updateEventById(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return this.prismaClient.event.update({ where: { id }, data })
  }

  deleteEventById(id: string) {
    return this.prismaClient.event.delete({ where: { id } })
  }
}
