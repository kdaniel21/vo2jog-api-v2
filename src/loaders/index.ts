import 'reflect-metadata'
import Koa from 'koa'

import koaLoader from '@loaders/koa'
import dbLoader from '@loaders/database'
import dependencyInjectionLoader from '@loaders/dependency-injection'
import subscribersLoader from '@loaders/subscribers'

export default (app: Koa<Koa.DefaultState, Koa.DefaultContext>) => {
  // DB Connection
  const prisma = dbLoader()

  const subscribers = subscribersLoader()

  // Dependency Injection
  dependencyInjectionLoader({ prisma, subscribers })

  // Koa server
  koaLoader(app)
}
