import { PrismaClient } from '@prisma/client'
import { Next, Context } from 'koa'
import { container } from 'tsyringe'

export default async (ctx: Context, next: Next) => {
  try {
    const prismaClient: PrismaClient = container.resolve('prisma')

    const { id }: { id: string } = ctx.state.auth.user
    const userRecord = await prismaClient.user.findUnique({
      where: { id },
      include: { profile: true },
    })
    if (!userRecord) throw new Error()

    ctx.state.auth.user = { ...userRecord }
    await next()
  } catch {
    ctx.throw(404, 'User with the specified ID not found.')
  }
}
