import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core'

@Entity()
export class EventDocument {
  @PrimaryKey()
  id!: number

  @ManyToOne()
  event!: Event

  @Property()
  name!: string

  @Property()
  file!: string
}
