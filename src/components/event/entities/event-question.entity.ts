import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core'

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
