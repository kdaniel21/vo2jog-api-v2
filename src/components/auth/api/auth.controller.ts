import { Context } from 'koa'
import { inject, injectable } from 'tsyringe'
import { Logger } from 'pino'
import AuthService from '@auth/auth.service'

@injectable()
export default class AuthController {
  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject('logger') private logger: Logger,
  ) {}

  async login(ctx: Context) {
    this.logger.info('Signing in with body %s', ctx.request.body)
    const { email, password } = ctx.request.body
    const userCredentials = await this.authService.login({ email, password })

    ctx.body = { ...userCredentials }
  }

  async register(ctx: Context) {
    this.logger.info('Signing up with body %s', ctx.request.body)
    const { email, name, password } = ctx.request.body
    const userCredentials = await this.authService.register({ email, password, name })

    ctx.body = { ...userCredentials }
    ctx.status = 201
  }

  async logout(ctx: Context) {
    const { id, refreshToken }: { id: number; refreshToken: string } = ctx.state.auth
    this.logger.info('Signing out with user id %s', id)

    await this.authService.logout({ userId: id, refreshToken })
  }

  async forgotPassword(ctx: Context) {
    const { email }: { email: string } = ctx.request.body
    this.logger.info('Resetting password for email address %s', email)

    await this.authService.createPasswordResetToken(email)

    ctx.body = { message: 'Password reset email was successfully sent!' }
  }

  async resetPassword(ctx: Context) {
    // Get token from body if necessary
    if (ctx.request.body.token) ctx.params = ctx.request.body.token

    const { password }: { password: string } = ctx.request.body
    const { token }: { token: string } = ctx.params

    await this.authService.resetPasswordUsingToken({ token, newPassword: password })

    ctx.body = { message: 'Password updated successfully!' }
  }
}
