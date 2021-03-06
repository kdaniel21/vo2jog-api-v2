import { Context } from 'koa'
import { inject, injectable } from 'tsyringe'
import { Logger } from 'pino'
import AuthService from '@auth/auth.service'
import { AppError } from '@utils/app-error'
import { User } from '../entities/user.entity'

@injectable()
export default class AuthController {
  constructor(
    @inject(AuthService) private authService: AuthService,
    @inject('logger') private logger: Logger,
  ) {}

  async login(ctx: Context) {
    this.logger.info('Signing in')
    const { email, password } = ctx.request.body
    const userCredentials = await this.authService.login({ email, password })

    ctx.body = { ...userCredentials }
  }

  async refreshAccessToken(ctx: Context) {
    const { refreshToken } = ctx.state.auth
    ctx.assert(refreshToken, 400, 'No refresh token was provided.')

    this.logger.info('Generating new access token...')

    const newTokens: {
      accessToken: string
      refreshToken: string
    } = await this.authService.refreshTokens(refreshToken)

    ctx.body = { ...newTokens }
  }

  async retrieveUser(ctx: Context) {
    const { user }: { user: User } = ctx.state.auth

    this.logger.info('Retrieving user %s', user.email)

    ctx.body = { user }
  }

  async register(ctx: Context) {
    const { email, name, password } = ctx.request.body
    this.logger.info('Signing up with email %s', email)
    const userCredentials = await this.authService.register({ email, password, name })

    ctx.body = { ...userCredentials }
    ctx.status = 201
  }

  async logout(ctx: Context) {
    const {
      user: { id },
      refreshToken,
    }: { user: User; refreshToken: string } = ctx.state.auth
    this.logger.info('Signing out with user id %s', id)

    await this.authService.logout({ userId: id, refreshToken })

    ctx.status = 204
  }

  async forgotPassword(ctx: Context) {
    const { email }: { email: string } = ctx.request.body
    this.logger.info('Resetting password for email address %s', email)

    await this.authService.createPasswordResetToken(email)

    ctx.body = { message: 'Password reset email was successfully sent!' }
  }

  async resetPassword(ctx: Context) {
    const { password }: { password: string } = ctx.request.body
    const token: string = ctx.request.body.token || ctx.params.token

    await this.authService.resetPasswordUsingToken({ token, newPassword: password })

    ctx.body = { message: 'Password updated successfully!' }
  }
}
