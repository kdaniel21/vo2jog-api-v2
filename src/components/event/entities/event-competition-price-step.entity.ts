import { Entity, PrimaryKey, ManyToOne, Property, Enum } from '@mikro-orm/core'
import { EventCompetition } from './event-competition.entity'

@Entity()
export class EventCompetitionPriceStep {
  @PrimaryKey()
  id!: number

  @ManyToOne()
  competition!: EventCompetition

  @Property()
  price!: number

  @Enum()
  currency!: Currency

  @Property()
  endTime!: Date
}

enum Currency {
  EUR,
  HUF,
  USD,
}
