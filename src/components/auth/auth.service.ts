import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { addSeconds } from 'date-fns'
import { PrismaClient, User } from '@prisma/client'
import EventEmitter from 'eventemitter3'
import { inject, injectable } from 'tsyringe'
import { Logger } from 'pino'
import { IUserCredentialsDTO, IUserRegisterDTO } from '@interfaces/IUser'
import config from '@config'
import { authEvents } from '@auth/auth.subscribers'
import MailerService from '@mailer/mailer.service'
import { AppError } from '@utils/app-error'

@injectable()
export default class AuthService {
  constructor(
    @inject('prisma') private prisma: PrismaClient,
    @inject('logger') private logger: Logger,
    @inject('authSubscriber') private authSubscriber: EventEmitter,
    private mailerService: MailerService,
  ) {}

  public async login(
    userCredentialsDTO: IUserCredentialsDTO,
  ): Promise<{ user: User; refreshToken: string; accessToken: string }> {
    const { email, password } = userCredentialsDTO

    this.logger.info('Attempting login with user %s', email)
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new AppError('Invalid email or password.', 401)

    this.logger.info('Checking password for user %s', email)
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) throw new AppError('Invalid email or password', 401)

    const accessToken = this.generateJWT(user)
    const refreshToken = await this.generateRefreshToken(user)

    this.authSubscriber.emit(authEvents.login, { user })

    return { user, accessToken, refreshToken }
  }

  public async register(
    userDTO: IUserRegisterDTO,
  ): Promise<{ user: User; refreshToken: string; accessToken: string }> {
    const { name, email, password } = userDTO

    this.logger.info('Checking email address availability for %s', email)
    const isEmailRegistered = await this.prisma.user.count({ where: { email } })
    if (isEmailRegistered) throw new AppError('Email address already registered.', 403)

    const user = await this.prisma.user.create({
      data: { name, email, password },
    })

    const accessToken = this.generateJWT(user)
    const refreshToken = await this.generateRefreshToken(user)

    this.authSubscriber.emit(authEvents.register)

    return { user, accessToken, refreshToken }
  }

  public logout({ userId, refreshToken }: { userId: number; refreshToken: string }) {
    const hashedToken = this.hashToken(refreshToken)
    return this.prisma.refreshToken.deleteMany({
      where: { token: hashedToken, userId },
    })
  }

  public async createPasswordResetToken(email: string): Promise<void> {
    this.logger.info('Attempting creating password reset token for email %s', email)
    const { token, hashedToken } = this.generateHashedTokenPair()
    const expiresAt = addSeconds(new Date(), config.auth.passwordResetLifetime)

    const updated = await this.prisma.user.updateMany({
      where: { email },
      data: { passwordResetToken: hashedToken, passwordResetTokenExpiresAt: expiresAt },
    })
    if (updated && !updated.count) throw new AppError('Email address does not exist', 400)

    // TODO: Send Email
  }

  public async resetPasswordUsingToken({
    token,
    newPassword,
  }: {
    token: string
    newPassword: string
  }): Promise<void> {
    try {
      if (!token) throw new Error()

      this.logger.info('Attempting to reset password with using token %s', token)

      const updated = await this.prisma.user.updateMany({
        where: {
          passwordResetToken: token,
          passwordResetTokenExpiresAt: { gte: new Date() },
        },
        data: {
          password: newPassword,
          passwordResetToken: null,
          passwordResetTokenExpiresAt: null,
        },
      })
      if (updated && !updated.count) throw new Error()
    } catch {
      throw new AppError('Invalid or expired token.', 401)
    }
  }

  private async generateRefreshToken({ id, email }: User): Promise<string> {
    this.logger.info('Generating refresh token for user %s', email)

    const { token, hashedToken } = this.generateHashedTokenPair()
    const expiresAt = addSeconds(new Date(), config.auth.refreshTokenLifetime)

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        expiresAt,
        user: {
          connect: { id },
        },
      },
    })

    return token
  }

  private generateJWT({ id, email, role }: User): string {
    this.logger.info('Generating JWT token for user %s', email)
    return jwt.sign({ user: { id, role } }, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtLifetime,
    })
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex').toString()
  }

  private generateHashedTokenPair(): { token: string; hashedToken: string } {
    const token = crypto.randomBytes(config.auth.refreshTokenLength).toString('hex')
    const hashedToken = this.hashToken(token)

    return { token, hashedToken }
  }
}
