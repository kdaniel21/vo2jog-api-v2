import { container } from 'tsyringe'
import Logger from '@logger'
import { PrismaClient } from '@prisma/client'

export default ({ prisma, subscribers }: { prisma: PrismaClient; subscribers: any }) => {
  try {
    container.registerInstance('prisma', prisma)
    container.registerInstance('logger', Logger)

    // Register subscribers
    Object.keys(subscribers).forEach(subscriberName =>
      container.registerInstance(subscriberName, subscribers[subscriberName]),
    )

    Logger.info('Dependencies injected successfully!')
  } catch (err) {
    Logger.error('Error while injecting dependencies %o', err)
  }
}
