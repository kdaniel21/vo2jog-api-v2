import { Entity, PrimaryKey, ManyToOne, Property, Enum, OneToMany } from '@mikro-orm/core'
import { nanoid } from 'nanoid'

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
}

enum DistanceUnit {
  KILOMETER,
  MILE,
  METER,
  FOOT,
}

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
