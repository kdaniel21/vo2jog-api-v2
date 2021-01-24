import { PrimaryKey, Property } from '@mikro-orm/core'
import { nanoid } from 'nanoid'

export abstract class BaseEntity {
  @PrimaryKey()
  id: string = nanoid()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property()
  createdAt: Date = new Date()
}
