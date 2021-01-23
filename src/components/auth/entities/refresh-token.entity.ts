import { BaseEntity } from '@api/base/base.entity'
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { User } from './user.entity'

@Entity()
export class RefreshToken extends BaseEntity {
  @Property()
  token!: string

  @ManyToOne()
  user!: User

  @Property()
  expiresAt!: Date

  constructor(hashedToken: string, expiresAt: Date, user: User) {
    super()
    this.token = hashedToken
    this.expiresAt = expiresAt
    this.user = user
  }
}
