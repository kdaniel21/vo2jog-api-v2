import { Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { Subcategory } from './subcategory.entity'

@Entity()
export class Category {
  @PrimaryKey()
  id: string = nanoid()

  @Property()
  name!: string

  @OneToMany(() => Subcategory, subcategory => subcategory.category)
  subcategories!: Subcategory
}
