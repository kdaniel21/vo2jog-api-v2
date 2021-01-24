import faker from 'faker'
import bcrypt from 'bcrypt'
import AuthService from '@auth/auth.service'
import config from '@config'
import { AppError } from '@utils/app-error'
import dbLoader from '@loaders/database'

describe.only('Auth Service', () => {
  const fakeUserCredentials = {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
  const fakeUser = {
    ...fakeUserCredentials,
    name: faker.name.findName(),
  }

  const fakeUserEntry = {
    ...fakeUser,
    id: faker.random.uuid(),
    password: bcrypt.hashSync(fakeUserCredentials.password, config.auth.saltRounds),
    refreshTokens: { add: jest.fn() },
  }

  // DEPENDENCIES
  const userRepository = {
    findOne: jest.fn(),
    count: jest.fn(),
    persistAndFlush: jest.fn(),
    nativeUpdate: jest.fn(),
  }
  const refreshTokenRepository = {
    nativeDelete: jest.fn(),
    findOne: jest.fn(),
    persistAndFlush: jest.fn(),
  }

  const logger = {
    info: jest.fn(),
  }
  const authSubscriber = {
    emit: jest.fn(),
  }
  const mailerService = {}

  // Services
  let authService: AuthService

  // HOOKS
  beforeAll(async () => {
    // Initialize MikroORM so that entities can be used
    await dbLoader()
  })

  beforeEach(async () => {
    authService = new AuthService(
      userRepository as any,
      refreshTokenRepository as any,
      logger as any,
      authSubscriber as any,
      mailerService as any,
    )

    jest.resetAllMocks()
  })

  // TESTS
  describe('Login feature', () => {
    it('should login with valid credentials', async () => {
      userRepository.findOne.mockResolvedValueOnce(fakeUserEntry)

      const { user, accessToken, refreshToken } = await authService.login(
        fakeUserCredentials,
      )

      expect(user).toMatchObject(fakeUserEntry)
      expect(accessToken).toBeTruthy()
      expect(refreshToken).toBeTruthy()
    })

    it('should throw an error when using invalid email', () => {
      const invalidCredentials = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      }

      expect(async () => await authService.login(invalidCredentials)).rejects.toThrow()
    })

    it('should throw an error when using valid email but invalid password', () => {
      const credentials = {
        email: fakeUserCredentials.email,
        password: faker.internet.password(),
      }

      expect(async () => await authService.login(credentials)).rejects.toThrow()
    })
  })

  describe('Register feature', () => {
    it('should create a new user', async () => {
      userRepository.count.mockResolvedValueOnce(0)

      const { user, accessToken, refreshToken } = await authService.register(fakeUser)

      expect(user.email).toBe(fakeUser.email)
      expect(user.id).toBeTruthy()
      expect(refreshToken).toBeTruthy()
      expect(accessToken).toBeTruthy()
    })

    it('should reject registration with existing email', () => {
      userRepository.count.mockResolvedValueOnce(1)

      expect(async () => await authService.register(fakeUser)).rejects.toThrow()
    })
  })

  describe('Refresh access tokens feature', () => {
    it('should generate new JWT and refresh tokens', async () => {
      const validRefreshToken = faker.random.uuid()
      const refreshTokenRecord = {
        id: faker.random.number(),
        token: faker.random.uuid(),
        expiresAt: faker.date.future(),
        user: { id: faker.random.uuid(), ...fakeUser },
      }
      refreshTokenRepository.findOne.mockResolvedValueOnce(refreshTokenRecord)
      const updateRefreshToken = refreshTokenRepository.persistAndFlush

      const { refreshToken, accessToken } = await authService.refreshTokens(
        validRefreshToken,
      )

      expect(accessToken).toBeTruthy()
      expect(refreshToken).toBeTruthy()
      expect(updateRefreshToken).toBeCalled()
    })

    it('should throw an error when using invalid refresh token', () => {
      const invalidRefreshToken = 'invalid'
      refreshTokenRepository.findOne.mockResolvedValueOnce(null)
      const updateRefreshToken = refreshTokenRepository.persistAndFlush

      expect(
        async () => await authService.refreshTokens(invalidRefreshToken),
      ).rejects.toThrowError(AppError)
      expect(updateRefreshToken).not.toBeCalled()
    })
  })

  describe('Logout feature', () => {
    it('should remove refresh token from database', async () => {
      const removeToken = refreshTokenRepository.nativeDelete
      await authService.logout({
        userId: faker.random.uuid(),
        refreshToken: faker.random.alphaNumeric(),
      })

      expect(removeToken).toBeCalled()
    })
  })

  describe('Create password reset token', () => {
    it('should generate password reset token and send it via email', async () => {
      const updateUser = userRepository.nativeUpdate
      updateUser.mockResolvedValue(1)

      await authService.createPasswordResetToken(fakeUser.email)

      expect(updateUser).toBeCalled()
      // TODO expect email service to be called
    })
  })
})
