import { BaseEntity } from '@components/base/base.entity'
import { Entity, PrimaryKey, OneToOne, Property } from '@mikro-orm/core'
import { Event } from './event.entity'

@Entity()
export class EventLocation extends BaseEntity {
  @OneToOne()
  event!: Event

  @Property()
  latitude!: number

  @Property()
  longitude!: number

  @Property()
  label?: string

  @Property()
  countryCode?: string

  @Property()
  countryName?: string

  @Property()
  state?: string

  @Property()
  county?: string

  @Property()
  city?: string

  @Property()
  postalCode?: string

  @Property()
  street?: string

  @Property()
  houseNumber?: string
}
