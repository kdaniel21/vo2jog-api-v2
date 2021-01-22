import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { Subcategory } from './subcategory.entity'

@Entity()
export class CategoryItem {
  @PrimaryKey()
  id!: number

  @ManyToOne()
  subcategory!: Subcategory

  @Property()
  name!: string
}
