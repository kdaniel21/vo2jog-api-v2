import { container } from 'tsyringe'
import Logger from '@logger'
import { EntityManager } from '@mikro-orm/core'

export default ({
  entityManager,
  subscribers,
}: {
  entityManager: EntityManager
  subscribers: any
}) => {
  console.log(entityManager)
  // try {
  //   container.registerInstance('prisma', )
  //   container.registerInstance('logger', Logger)

  //   // Register subscribers
  //   Object.keys(subscribers).forEach(subscriberName =>
  //     container.registerInstance(subscriberName, subscribers[subscriberName]),
  //   )

  //   Logger.info('Dependencies injected successfully!')
  // } catch (err) {
  //   Logger.error('Error while injecting dependencies %o', err)
  // }
}
