import { BaseEntity } from '@components/base/base.entity'
import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core'
import { Event } from './event.entity'

@Entity()
export class EventDocument extends BaseEntity {
  @ManyToOne()
  event!: Event

  @Property()
  name!: string

  @Property()
  file!: string
}
