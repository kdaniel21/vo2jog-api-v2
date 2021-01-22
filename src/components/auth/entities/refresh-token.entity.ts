import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { User } from './user.entity'

@Entity()
export class RefreshToken {
  @PrimaryKey()
  id!: number

  @Property()
  token!: string

  @ManyToOne()
  user!: User

  @Property()
  expiresAt!: Date

  @Property({ defaultRaw: 'now' })
  createdAt!: Date
}
