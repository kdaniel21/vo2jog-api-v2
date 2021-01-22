import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core'
import { nanoid } from 'nanoid'
import { CategoryItem } from './category-items.entity'
import { Category } from './category.entity'

@Entity()
export class Subcategory {
  @PrimaryKey()
  id: string = nanoid()

  @Property()
  name!: string

  @ManyToOne()
  category!: Category

  @OneToMany(() => CategoryItem, categoryItem => categoryItem.subcategory)
  categoryItems!: CategoryItem
}
