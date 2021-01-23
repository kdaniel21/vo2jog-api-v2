import { Entity, PrimaryKey, ManyToOne, Property, Enum, OneToMany } from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { EventCompetitionPriceStep } from './event-competition-price-step.entity'
import { Event } from './event.entity'

@Entity()
export class EventCompetition {
  @PrimaryKey()
  id: string = nanoid()

  @ManyToOne()
  event!: Event

  @Property()
  name!: string

  @Property()
  elevationGain?: number

  @Enum()
  elevationGainUnit?: DistanceUnit

  @Property()
  elevationLoss?: number

  @Enum()
  elevationLossUnit?: DistanceUnit

  @Property()
  ageLimitMinimum?: number

  @Property()
  ageLimitMaximum?: number

  @Property()
  distance?: number

  @Enum()
  distanceUnit?: string

  @OneToMany(() => EventCompetitionPriceStep, priceStep => priceStep.competition)
  competitions!: EventCompetitionPriceStep

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  @Property()
  createdAt: Date = new Date()
}

enum DistanceUnit {
  KILOMETER,
  MILE,
  METER,
  FOOT,
}
