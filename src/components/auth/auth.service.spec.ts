import faker from 'faker'
import bcrypt from 'bcrypt'
import AuthService from '@auth/auth.service'
import config from '@config'

describe('Auth Service', () => {
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
    userId: faker.random.number(),
    password: bcrypt.hashSync(fakeUserCredentials.password, config.auth.saltRounds),
  }

  // DEPENDENCIES
  const prismaClient = {
    user: {
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
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

  beforeEach(() => {
    authService = new AuthService(
      prismaClient as any,
      logger as any,
      authSubscriber as any,
      mailerService as any,
    )

    jest.resetAllMocks()
  })

  // TESTS
  describe('Login feature', () => {
    it('should login with valid credentials', async () => {
      prismaClient.user.findUnique.mockResolvedValueOnce(fakeUserEntry)

      const { user, accessToken, refreshToken } = await authService.login(
        fakeUserCredentials,
      )

      expect(user).toMatchObject(fakeUserEntry)
      // expect(user).not.toHaveProperty('password')
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
      prismaClient.user.create.mockResolvedValueOnce(fakeUserEntry)
      prismaClient.user.count.mockResolvedValueOnce(0)

      const { user, accessToken, refreshToken } = await authService.register(fakeUser)

      expect(user).toMatchObject(fakeUserEntry)
      expect(refreshToken).toBeTruthy()
      expect(accessToken).toBeTruthy()
    })

    it('should reject registration with existing email', () => {
      prismaClient.user.count.mockResolvedValueOnce(1)

      expect(async () => await authService.register(fakeUser)).rejects.toThrow()
    })
  })

  describe('Logout feature', () => {
    it('should remove refresh token from database', async () => {
      const removeToken = prismaClient.refreshToken.deleteMany
      await authService.logout({
        userId: faker.random.number(),
        refreshToken: faker.random.alphaNumeric(),
      })

      expect(removeToken).toBeCalled()
    })
  })

  describe('Create password reset token', () => {
    it('should generate password reset token and send it via email', async () => {
      await authService.createPasswordResetToken(fakeUser.email)

      expect(prismaClient.user.updateMany).toBeCalled()
      // TODO expect email service to be called
    })
  })
})
