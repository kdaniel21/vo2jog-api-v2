import supertest from 'supertest'
import Koa from 'koa'
import faker from 'faker'
import { container } from 'tsyringe'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import loader from '@loaders'
import config from '@config'
import { User } from '../entities/user.entity'
import { EntityManager, EntityRepository } from '@mikro-orm/core'
import { RefreshToken } from '../entities/refresh-token.entity'

describe('/auth endpoint', () => {
  const BASE_ENDPOINT = '/api/v2/auth'

  const app = new Koa()
  let request: supertest.SuperTest<supertest.Test>
  let em: EntityManager

  let userRepository: EntityRepository<User>
  let refreshTokenRepository: EntityRepository<RefreshToken>

  const fakeUserPassword = faker.internet.password()
  let fakeUser: User

  beforeAll(async () => {
    // Load app
    await loader(app)
    request = supertest(app.callback())

    // Load repositories
    em = container.resolve('em')
    userRepository = container.resolve('userRepository')
    refreshTokenRepository = container.resolve('refreshTokenRepository')

    // Fake existing user
    fakeUser = new User(faker.internet.email(), fakeUserPassword, faker.name.findName())
    await userRepository.persistAndFlush(fakeUser)
  })

  afterAll(async () => {
    await userRepository.removeAndFlush(fakeUser)
    console.log('deleted user')
  })

  describe('POST /login', () => {
    const loginEndpoint = `${BASE_ENDPOINT}/login`

    it('should login users with the correct credentials', async () => {
      const { email } = fakeUser
      const res = await request
        .post(loginEndpoint)
        .send({ email, password: fakeUserPassword })

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
      const newUserRecord = await userRepository.findOne({ email })

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

  describe('POST /refresh', () => {
    const refreshEndpoint = `${BASE_ENDPOINT}/refresh`

    it('should send new access and refresh tokens', async () => {
      const validRefreshToken = faker.random.uuid()
      const hashedToken = crypto
        .createHash('sha256')
        .update(validRefreshToken)
        .digest('hex')
        .toString()
      const refreshTokenRecord = new RefreshToken(
        hashedToken,
        faker.date.future(),
        fakeUser,
      )
      await refreshTokenRepository.persistAndFlush(refreshTokenRecord)

      const res = await request
        .post(refreshEndpoint)
        .send({ refreshToken: validRefreshToken })

      expect(res.status).toBe(200)
      expect(res.body).toContainKeys(['accessToken', 'refreshToken'])
      expect(res.body.refreshToken).not.toBe(validRefreshToken)

      // Cleanup
      await refreshTokenRepository.removeAndFlush(refreshTokenRecord)
    })

    it('should send an error when using invalid refresh token', async () => {
      const invalidRefreshToken = faker.random.uuid()

      const res = await request
        .post(refreshEndpoint)
        .send({ refreshToken: invalidRefreshToken })

      expect(res.status).toBe(401)
      expect(res.body).not.toContainKeys(['accessToken', 'refreshToken'])
    })
  })

  describe('GET /user', () => {
    const userEndpoint = `${BASE_ENDPOINT}/user`

    it('should return the validated user', async () => {
      const accessToken = jwt.sign({ user: { id: fakeUser.id } }, config.auth.jwtSecret)

      const res = await request
        .get(userEndpoint)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.user.id).toEqual(fakeUser.id)
      expect(res.body.user.email).toEqual(fakeUser.email)
    })

    it('should throw an error when using invalid access token', async () => {
      const invalidAccessToken = faker.random.uuid()

      const res = await request
        .get(userEndpoint)
        .set('Authorization', `Bearer ${invalidAccessToken}`)

      expect(res.status).toBe(401)
      expect(res.body).not.toHaveProperty('user')
    })
  })

  // TODO Implement it with middleware authentication
  describe.skip('POST /logout', () => {
    const logoutEndpoint = `${BASE_ENDPOINT}/logout`

    it('should logout user', async () => {
      // Fake existing token
      const fakeRefreshToken = new RefreshToken(
        faker.random.uuid(),
        faker.date.future(),
        fakeUser,
      )
      await refreshTokenRepository.persistAndFlush(fakeRefreshToken)

      const res = await request.post(logoutEndpoint).send()

      expect(res.status).toBe(204)

      await refreshTokenRepository.removeAndFlush(fakeRefreshToken)
    })
  })

  describe('POST /forgot-password', () => {
    const forgotPasswordEndpoint = `${BASE_ENDPOINT}/forgot-password`

    it('should create forgot password token for existing user', async () => {
      const { email } = fakeUser
      const res = await request.post(forgotPasswordEndpoint).send({ email })

      // Make sure that it is queried from the DB and not from cache
      // Because the underlying service uses nativeUpdate
      em.clear()
      const userRecord = await userRepository.findOne({ email })

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
      const token = faker.random.uuid()
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex').toString()
      const validToken = {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiresAt: faker.date.future(),
      }
      const { email } = fakeUser
      await userRepository.nativeUpdate({ email }, { ...validToken })

      const password = faker.internet.password()
      const res = await request
        .post(`${resetPasswordEndpoint}/${token}`)
        .send({ password, passwordConfirm: password })

      em.clear()
      const updatedUserRecord = await userRepository.findOne({ email })
      const isPasswordChanged = await updatedUserRecord?.isPasswordCorrect(password)

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
