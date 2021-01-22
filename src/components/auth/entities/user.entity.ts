import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { Organizer } from './organizer.entity'
import { RefreshToken } from './refresh-token.entity'

@Entity()
export class User {
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

  @Property({ defaultRaw: 'now' })
  createdAt!: Date

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date
}

enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
}
