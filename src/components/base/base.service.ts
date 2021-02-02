import { BaseEntity, Entity, EntityRepository } from '@mikro-orm/core'
import { Logger } from 'pino-multi-stream'
import { inject } from 'tsyringe'

export default abstract class BaseService<T> {
  constructor(
    private Entity: typeof T,
    private repository: EntityRepository<T>,
    @inject('logger') logger?: Logger,
  ) {}

  async create(data): Promise<T> {
    const newObject: T = new Entity(data)
    await this.repository.persistAndFlush(newObject)

    return newObject
  }
}
