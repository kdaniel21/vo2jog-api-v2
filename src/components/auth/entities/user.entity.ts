import { BaseEntity } from '@api/base/base.entity'
import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { Organizer } from './organizer.entity'
import { RefreshToken } from './refresh-token.entity'

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

  @Property({ hidden: true })
  password!: string

  @Enum()
  role: UserRole = UserRole.USER

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens = new Collection<RefreshToken>(this)

  @Property({ hidden: true })
  passwordResetToken?: string

  @Property({ hidden: true })
  passwordResetTokenExpiresAt?: Date

  @OneToOne(() => Organizer, organizer => organizer.user)
  profile!: Organizer

  @Property({ hidden: true })
  isDeleted: boolean = false

  @Property()
  createdAt: Date = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date()

  constructor(email: string, password: string) {
    super()
    this.email = email
    this.password = password
  }
}

export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
}
