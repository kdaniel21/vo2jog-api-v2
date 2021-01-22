import { MikroORM } from '@mikro-orm/core'

export default {
  entities: [],
  dbName: 'vo2jog-v2',
  type: 'postgresql',
} as Parameters<typeof MikroORM.init>[0]
