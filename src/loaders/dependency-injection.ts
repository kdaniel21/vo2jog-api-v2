import { container } from 'tsyringe'
import logger from '@logger'
import { EntityRepository, MikroORM } from '@mikro-orm/core'
import { User } from '@components/auth/entities/user.entity'
import { RefreshToken } from '@components/auth/entities/refresh-token.entity'
import { Logger } from 'pino-multi-stream'

export default ({ orm, subscribers }: { orm: MikroORM; subscribers: any }) => {
  try {
    container.registerInstance('orm', orm)
    container.registerInstance('em', orm.em)

    const injectedEntities: any[] = [User, RefreshToken]
    injectedEntities.forEach(entity => {
      const token = `${entity.name}Repository`
      const repository: EntityRepository<typeof entity> = orm.em.getRepository(entity)

      container.register<EntityRepository<typeof entity>>(token, { useValue: repository })
    })

    container.registerInstance<Logger>('logger', logger)

    // Register subscribers
    Object.keys(subscribers).forEach(subscriberName =>
      container.registerInstance(subscriberName, subscribers[subscriberName]),
    )
    logger.info('Dependencies injected successfully!')
  } catch (err) {
    logger.error('Error while injecting dependencies %o', err)
  }
}
