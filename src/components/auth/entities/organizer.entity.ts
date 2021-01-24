import { BaseEntity } from '@components/base/base.entity'
import { Event } from '@components/event/entities/event.entity'
import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { User } from './user.entity'

@Entity()
export class Organizer extends BaseEntity {
  @OneToOne()
  user!: User

  @Property()
  isApproved: boolean = false

  @OneToMany(() => Event, event => event.organizer)
  events!: Event

  @OneToMany(() => OrganizerContactPerson, contactPerson => contactPerson.organizer)
  contactPeople = new Collection<OrganizerContactPerson>(this)

  @OneToMany(() => OrganizerSocialMedia, socialMedia => socialMedia.organizer)
  socialMedia = new Collection<OrganizerSocialMedia>(this)
}

@Entity()
export class OrganizerSocialMedia extends BaseEntity {
  @ManyToOne()
  organizer!: Organizer

  @Property()
  name!: string

  @Property()
  link!: String

  @Property()
  icon: string = 'globe'
}

@Entity()
export class OrganizerContactPerson extends BaseEntity {
  @ManyToOne()
  organizer!: Organizer

  @Property()
  name!: string

  @Property()
  email?: string

  @Property()
  phoneNumber?: string

  @Property()
  isPublic: boolean = false
}
