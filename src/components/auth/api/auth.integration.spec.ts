import supertest from 'supertest'
import Koa from 'koa'
import faker from 'faker'
import { container } from 'tsyringe'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import loader from '@loaders'

describe('/auth endpoint', () => {
  const BASE_ENDPOINT = '/api/v2/auth'

  const app = new Koa()
  loader(app)
  const request = supertest(app.callback())

  const prismaClient: PrismaClient = container.resolve('prisma')

  const fakeUser = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }

  beforeAll(async () => {
    // Fake existing user
    await prismaClient.user.create({ data: { ...fakeUser } })
  })

  afterAll(async () => {
    await prismaClient.user.delete({ where: { email: fakeUser.email } })
  })

  describe('POST /login', () => {
    const loginEndpoint = `${BASE_ENDPOINT}/login`

    it('should login users with the correct credentials', async () => {
      const { email, password } = fakeUser
      const res = await request.post(loginEndpoint).send({ email, password })

      expect(res.status).toBe(200)
      expect(res.body).toContainKeys(['accessToken', 'refreshToken', 'user'])
      // TODO Never send user password back to the client
    })

    it('should send validation error when no password was provided', async () => {
      const res = await request.post(loginEndpoint).send({ email: faker.internet.email() })

      expect(res.status).toBe(400)
      expect(res.body).not.toContainKeys(['accessToken', 'user', 'refreshToken'])
    })

    it('should reject login attempt with invalid credentials', async () => {
      const res = await request
        .post(loginEndpoint)
        .send({ email: fakeUser.email, password: faker.internet.password() })

      expect(res.status).toBe(401)
      expect(res.body).not.toContainKeys(['accessToken', 'user', 'refreshToken'])
    })
  })

  describe('POST /register', () => {
    const registerEndpoint = `${BASE_ENDPOINT}/register`

    const password = faker.internet.password()
    const newUser = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      password,
      passwordConfirm: password,
    }
    it('should register a new user', async () => {
      const res = await request.post(registerEndpoint).send(newUser)

      const { email } = newUser
      const newUserRecord = await prismaClient.user.findUnique({ where: { email } })

      expect(res.status).toBe(201)
      expect(res.body).toContainKeys(['accessToken', 'user', 'refreshToken'])
      expect(newUserRecord).toBeTruthy()
    })

    it('should reject not matching password confirm', async () => {
      const res = await request
        .post(registerEndpoint)
        .send({ ...newUser, passwordConfirm: faker.internet.password() })

      expect(res.status).toBe(400)
    })

    it('should reject existing email address', async () => {
      const res = await request.post(registerEndpoint).send({
        ...newUser,
        email: fakeUser.email,
      })

      expect(res.status).toBe(403)
    })
  })

  // TODO Implement it with middleware authentication
  describe.skip('POST /logout', () => {
    const logoutEndpoint = `${BASE_ENDPOINT}/logout`

    it('should logout user', async () => {
      // Fake existing token
      const fakeRefreshToken = {
        token: faker.random.uuid(),
        expiresAt: faker.date.future(),
        user: { connect: { email: fakeUser.email } },
      }
      await prismaClient.refreshToken.create({ data: fakeRefreshToken })

      const res = await request.post(logoutEndpoint).send()

      expect(res.status).toBe(204)
    })
  })

  describe('POST /forgot-password', () => {
    const forgotPasswordEndpoint = `${BASE_ENDPOINT}/forgot-password`

    it('should create forgot password token for existing user', async () => {
      const { email } = fakeUser
      const res = await request.post(forgotPasswordEndpoint).send({ email })

      const userRecord = await prismaClient.user.findUnique({ where: { email } })

      expect(res.status).toBe(200)
      expect(res.body).not.toHaveProperty('token')
      expect(userRecord?.passwordResetToken).toBeTruthy()
      expect(userRecord?.passwordResetTokenExpiresAt?.getTime()).toBeGreaterThan(Date.now())
    })

    it('should not create token for non-existent user', async () => {
      const res = await request
        .post(forgotPasswordEndpoint)
        .send({ email: faker.internet.email() })

      expect(res.status).toBe(400)
    })

    it('should send validation error when invalid no email address is provided', async () => {
      const res = await request.post(forgotPasswordEndpoint).send()

      expect(res.status).toBe(400)
    })
  })

  describe('POST /reset-password', () => {
    const resetPasswordEndpoint = `${BASE_ENDPOINT}/reset-password`

    it('should change password using valid token', async () => {
      // Mock existing token
      const validToken = {
        passwordResetToken: faker.random.uuid(),
        passwordResetTokenExpiresAt: faker.date.future(),
      }
      const { email } = fakeUser
      await prismaClient.user.update({
        where: { email },
        data: { ...validToken },
      })

      const password = faker.internet.password()
      const res = await request
        .post(`${resetPasswordEndpoint}/${validToken.passwordResetToken}`)
        .send({ password, passwordConfirm: password })

      const updatedUserRecord = await prismaClient.user.findUnique({ where: { email } })
      const isPasswordChanged = await bcrypt.compare(password, updatedUserRecord!.password)

      expect(res.status).toBe(200)
      expect(isPasswordChanged).toBeTrue()
      expect(updatedUserRecord?.passwordResetToken).toBeFalsy()
      expect(updatedUserRecord?.passwordResetTokenExpiresAt).toBeFalsy()
    })

    it('should send validation error when passwords do not match', async () => {
      const randomToken = faker.random.uuid()
      const res = await request.post(`${resetPasswordEndpoint}/${randomToken}`).send({
        password: faker.internet.password(),
        passwordConfirm: faker.internet.password(),
      })

      expect(res.status).toBe(400)
    })

    it('should send error when using invalid token', async () => {
      const invalidToken = faker.random.uuid()
      const password = faker.internet.password()
      const res = await request.post(`${resetPasswordEndpoint}/${invalidToken}`).send({
        password,
        passwordConfirm: password,
      })

      expect(res.status).toBe(401)
    })
  })
})
