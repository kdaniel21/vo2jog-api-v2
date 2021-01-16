import { Context, Next } from 'koa'

const hiddenFields: { [key: string]: string[] } = {
  user: ['password', 'passwordResetToken', 'passwordResetTokenExpiresAt', 'isDeleted'],
}

const isObject = (val: any) => typeof val === 'object' && val !== null

const removeFields = (object: any, topLevelKey: string) => {
  const motherObject = object[topLevelKey]
  Object.keys(object[topLevelKey]).forEach(subKey => {
    const childValue = motherObject[subKey]
    if (isObject(childValue)) return removeFields(motherObject, subKey)

    const hiddenKeys = hiddenFields[topLevelKey]
    if (hiddenKeys && hiddenKeys.includes(subKey)) delete object[topLevelKey][subKey]
  })
}

/*
 * Middleware to make sure that no secret fields gets exposed to the client in API response
 * Workaround since Prisma doesn't have an exclude property
 * The recursive function runs for every (deeply) nested object
 */
export default async (ctx: Context, next: Next) => {
  try {
    await next()
  } finally {
    const { body } = ctx
    if (!isObject(body)) return
    Object.keys(body).forEach(topLevelKey => {
      if (!isObject(body[topLevelKey])) return

      removeFields(body, topLevelKey)
    })
  }
}
