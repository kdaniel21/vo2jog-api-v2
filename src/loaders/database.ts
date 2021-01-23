import { MikroORM } from '@mikro-orm/core'

export default (): Promise<MikroORM> => {
  return MikroORM.init()
}
