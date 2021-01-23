import crypto from 'crypto'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { addSeconds } from 'date-fns'
import EventEmitter from 'eventemitter3'
import { inject, injectable } from 'tsyringe'
import { Logger } from 'pino'
import config from '@config'
import { authEvents } from '@auth/auth.subscribers'
import MailerService from '@mailer/mailer.service'
import { AppError } from '@utils/app-error'
import { EntityRepository } from '@mikro-orm/core'
import { User, UserRole } from './entities/user.entity'
import { IUserCredentialsDto } from './dtos/user-credentials.dto'
import { RefreshToken } from './entities/refresh-token.entity'
import { IUserRegisterDto } from './dtos/user-register.dto'

@injectable()
export default class AuthService {
  constructor(
    @inject('userRepository') private userRepository: EntityRepository<User>,
    @inject('refreshTokenRepository')
    private refreshTokenRepository: EntityRepository<RefreshToken>,
    @inject('logger') private logger: Logger,
    @inject('authSubscriber') private authSubscriber: EventEmitter,
    @inject(MailerService) private mailerService: MailerService,
  ) {}

  public async login(
    userCredentials: IUserCredentialsDto,
  ): Promise<{ user: User; refreshToken: string; accessToken: string }> {
    const { email, password } = userCredentials

    this.logger.info('Attempting login with user %s', email)

    const user = await this.userRepository.findOne({ email })
    if (!user) throw new AppError('Invalid email or password.', 401)

    this.logger.info('Checking password for user %s', email)
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) throw new AppError('Invalid email or password', 401)

    const accessToken = this.generateJWT(user)
    const refreshToken = await this.generateNewRefreshToken(user)

    this.authSubscriber.emit(authEvents.login, { user })

    return { user, accessToken, refreshToken }
  }

  public async register(
    userData: IUserRegisterDto,
  ): Promise<{ user: User; refreshToken: string; accessToken: string }> {
    const { name, email, password } = userData

    this.logger.info('Checking email address availability for %s', email)
    const isEmailRegistered = await this.userRepository.count({ email })
    if (isEmailRegistered) throw new AppError('Email address already registered.', 403)

    const user = new User(email, password, name)
    await this.userRepository.persistAndFlush(user)

    const accessToken = this.generateJWT(user)
    const refreshToken = await this.generateNewRefreshToken(user)

    this.authSubscriber.emit(authEvents.register)

    return { user, accessToken, refreshToken }
  }

  public async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshTokenRecord = await this.getValidRefreshToken(refreshToken)
    if (!refreshTokenRecord) throw new AppError('Invalid refresh token.', 401)

    // Replace refresh token
    const newRefreshToken = await this.replaceExistingRefreshToken(refreshTokenRecord)
    const { id, email, role } = refreshTokenRecord.user
    const newAccessToken = this.generateJWT({ id, email, role })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  public async logout({
    userId,
    refreshToken,
  }: {
    userId: string
    refreshToken: string
  }): Promise<void> {
    const hashedToken = this.hashToken(refreshToken)
    const count = await this.refreshTokenRepository.nativeDelete({
      token: hashedToken,
      user: userId,
    })
    if (count === 0) throw new AppError('Invalid refresh token.', 401)
  }

  public async createPasswordResetToken(email: string): Promise<void> {
    this.logger.info('Attempting creating password reset token for email %s', email)
    const { token, hashedToken } = this.generateHashedTokenPair()
    const expiresAt = addSeconds(new Date(), config.auth.passwordResetLifetime)

    const count = await this.userRepository.nativeUpdate(
      { email },
      { passwordResetToken: hashedToken, passwordResetTokenExpiresAt: expiresAt },
    )
    if (!count) throw new AppError('Email address does not exist', 400)

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

      this.logger.info('Attempting to reset password')

      const hashedToken = this.hashToken(token)
      const count = await this.userRepository.nativeUpdate(
        {
          passwordResetToken: hashedToken,
          passwordResetTokenExpiresAt: { $gte: new Date() },
        },
        {
          password: newPassword,
          passwordResetToken: null,
          passwordResetTokenExpiresAt: null,
        },
      )
      if (!count) throw new Error()
    } catch {
      throw new AppError('Invalid or expired token.', 401)
    }
  }

  /**
   *
   * @param refreshToken: valid refresh token
   * @returns refreshToken w/ the necessary user fields to create a new JWT
   */
  private async getValidRefreshToken(refreshToken: string): Promise<RefreshToken | null> {
    const hashedRefreshToken = this.hashToken(refreshToken)
    return this.refreshTokenRepository.findOne(
      { token: hashedRefreshToken, expiresAt: { $gte: new Date() } },
      ['user'],
    )
  }

  private async replaceExistingRefreshToken(refreshToken: RefreshToken): Promise<string> {
    const { token, hashedToken } = this.generateHashedTokenPair()

    refreshToken.token = hashedToken
    await this.refreshTokenRepository.persistAndFlush(refreshToken)

    return token
  }

  private async generateNewRefreshToken(user: User): Promise<string> {
    this.logger.info('Generating refresh token for user %s', user.email)

    const { token, hashedToken } = this.generateHashedTokenPair()
    const expiresAt = addSeconds(new Date(), config.auth.refreshTokenLifetime)

    const refreshToken = new RefreshToken(hashedToken, expiresAt, user)
    user.refreshTokens.add(refreshToken)
    await this.userRepository.persistAndFlush(user)

    return token
  }

  private generateJWT({
    id,
    email,
    role,
  }: {
    id: string
    email: string
    role: UserRole
  }): string {
    this.logger.info('Generating JWT token for user %s', email)
    return jwt.sign({ user: { id, email, role } }, config.auth.jwtSecret, {
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
