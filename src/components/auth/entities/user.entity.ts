import { BaseEntity } from '@api/base/base.entity'
import {
  Collection,
  Entity,
  EntityName,
  Enum,
  EventArgs,
  EventSubscriber,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Subscriber,
  wrap,
} from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { Organizer } from './organizer.entity'
import { RefreshToken } from './refresh-token.entity'
import bcrypt from 'bcrypt'
import config from '@config'

@Entity()
export class User extends BaseEntity {
  @PrimaryKey()
  id: string = nanoid()

  @Property()
  isAdmin: boolean = false

  @Property()
  email!: string

  @Property()
  isEmailConfirmed: boolean = false

  @Property()
  name?: string

  @Property({ lazy: true })
  password!: string

  @Enum()
  role: UserRole = UserRole.USER

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user, { lazy: true })
  refreshTokens = new Collection<RefreshToken>(this)

  @Property({ lazy: true })
  passwordResetToken?: string

  @Property({ lazy: true })
  passwordResetTokenExpiresAt?: Date

  @OneToOne(() => Organizer, organizer => organizer.user)
  profile!: Organizer

  @Property({ lazy: true })
  isDeleted: boolean = false

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  constructor(email: string, password: string, name?: string) {
    super()
    this.email = email
    this.password = password
    this.name = name
  }
}

export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
}

@Subscriber()
export class UserSubscriber implements EventSubscriber<User> {
  getSubscribedEntities(): EntityName<User>[] {
    return [User]
  }

  async beforeCreate(args: EventArgs<User>): Promise<void> {
    const { password } = args.entity
    if (!password) return

    args.entity.password = await this.hashPassword(password)
  }

  async beforeUpdate(args: EventArgs<User>): Promise<void> {
    const { password } = args.entity
    if (!args.changeSet || password === args.changeSet?.originalEntity?.password) return

    args.entity.password = await this.hashPassword(password)
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.auth.saltRounds)
  }
}
