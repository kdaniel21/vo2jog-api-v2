import { Entity, PrimaryKey, OneToOne, Property } from '@mikro-orm/core'

@Entity()
export class EventLocation {
  @PrimaryKey()
  id!: number

  @OneToOne({ inversedBy: 'eventLocation', orphanRemoval: true })
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
