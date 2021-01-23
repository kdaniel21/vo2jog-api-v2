import { BaseEntity } from '@api/base/base.entity'
import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core'
import { Event } from './event.entity'

@Entity()
export class EventQuestion extends BaseEntity {
  @ManyToOne()
  event!: Event

  @Property()
  question!: string

  @Property()
  answer?: string
}
