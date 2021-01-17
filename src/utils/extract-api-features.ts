import { Context } from 'koa'

export default class ApiFeatures<T1, T2> {
  query: any

  where: T1
  orderBy: T2
  skip: number
  take: number

  constructor(ctx: Context) {
    this.query = ctx.query

    this.where = this.extractFilters()
    this.orderBy = this.extractOrderBy()
    const { skip, take } = this.extractPagination()
    this.skip = skip
    this.take = take
  }

  private extractFilters() {
    const excludedFields = ['q', 'page', 'sort', 'limit', 'fields']
    const filters = { ...this.query }
    excludedFields.forEach(field => delete filters[field])

    let filtersString = JSON.stringify(filters)
    filtersString = filtersString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    return JSON.parse(filtersString)
  }

  private extractOrderBy(defaultOrderBy = '') {
    if (!this.query.sort) return defaultOrderBy

    return this.query.sort.replace(/,/g, '')
  }

  private extractPagination(defaultLimit = 10) {
    const page = +this.query.page || 1
    const limit = +this.query.limit || defaultLimit
    const skip = (page - 1) * limit

    return { skip, take: limit }
  }
}
