import { User } from '@components/auth/entities/user.entity'
import config from '@config'
import { MikroORM } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'

export default {
  metadataProvider: TsMorphMetadataProvider,
  dbName: 'vo2jog-v2',
  type: 'postgresql',
  entities: ['./dist/components/**/*.entity.js'],
  entitiesTs: ['./src/components/**/*.entity.ts'],
  clientUrl: config.db.url,
  debug: config.development,
} as Parameters<typeof MikroORM.init>[0]
