import 'reflect-metadata'
import Koa from 'koa'

import koaLoader from '@loaders/koa'
import dbLoader from '@loaders/database'
import dependencyInjectionLoader from '@loaders/dependency-injection'
import subscribersLoader from '@loaders/subscribers'

export default async (app: Koa<Koa.DefaultState, Koa.DefaultContext>) => {
  // DB Connection
  const orm = await dbLoader()

  const subscribers = subscribersLoader()

  // Dependency Injection
  dependencyInjectionLoader({ orm, subscribers })

  // Koa server
  koaLoader(app)
}
