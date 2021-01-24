import { BaseEntity } from '@components/base/base.entity'
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Event } from './event.entity'

@Entity()
export class EventScheduleItem extends BaseEntity {
  @ManyToOne()
  event!: Event

  @Property()
  name!: string

  @Property()
  time!: Date
}
