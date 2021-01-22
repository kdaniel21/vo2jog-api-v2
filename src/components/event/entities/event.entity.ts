import { Organizer } from '@components/auth/entities/organizer.entity'
import {
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { EventCompetition } from './event-competition.entity'
import { EventDocument } from './event-document.entity'
import { EventLocation } from './event-location.entity'
import { EventQuestion } from './event-question.entity'
import { EventScheduleItem } from './event-schedule-item.entity'

@Entity()
export class Event {
  @PrimaryKey()
  id: string = nanoid()

  @ManyToOne()
  organizer!: Organizer

  @Property()
  name!: string

  @Property()
  isPublic: boolean = false

  @Property()
  isApproved: boolean = false

  @Property()
  startDate?: Date

  @Property()
  endDate?: Date

  @Property()
  imageCover?: string

  @Property()
  description?: string

  @OneToOne({ mappedBy: 'eventLocation' })
  location!: EventLocation

  @OneToMany(() => EventDocument, document => document.event)
  documents!: EventDocument

  @OneToMany(() => EventQuestion, question => question.event)
  questions!: EventQuestion

  @OneToMany(() => EventCompetition, competition => competition.event)
  competitions!: EventCompetition

  @OneToMany(() => EventScheduleItem, scheduleItem => scheduleItem.event)
  scheduleItems!: EventScheduleItem

  @Property({ hidden: true })
  isDeleted: boolean = false

  @Property({ defaultRaw: 'now' })
  createdAt!: Date

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date
}
