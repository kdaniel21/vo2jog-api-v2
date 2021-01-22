import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Event } from './event.entity'

@Entity()
export class EventScheduleItem {
  @PrimaryKey()
  id!: number

  @ManyToOne()
  event!: Event

  @Property()
  name!: string

  @Property()
  time!: Date
}
