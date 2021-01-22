import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core'
import { Event } from './event.entity'

@Entity()
export class EventQuestion {
  @PrimaryKey()
  id!: number

  @ManyToOne()
  event!: Event

  @Property()
  question!: string

  @Property()
  answer?: string
}
