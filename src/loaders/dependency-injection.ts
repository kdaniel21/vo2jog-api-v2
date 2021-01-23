import { container } from 'tsyringe'
import Logger from '@logger'
import { EntityRepository, MikroORM } from '@mikro-orm/core'
import { User } from '@components/auth/entities/user.entity'

export default ({ orm, subscribers }: { orm: MikroORM; subscribers: any }) => {
  try {
    container.registerInstance('orm', orm)
    container.registerInstance('em', orm.em)
    container.registerInstance<EntityRepository<User>>(
      'userRepository',
      orm.em.getRepository(User),
    )

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
