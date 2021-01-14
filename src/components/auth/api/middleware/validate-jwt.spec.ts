import { mocked } from 'ts-jest/utils'
import faker from 'faker'
import validateJwt from '@auth/api/middleware/validate-jwt'
import jwt from 'jsonwebtoken'
jest.mock('jsonwebtoken')

describe('Validate JWT middleware', () => {
  const mockContext: any = {
    throw: jest.fn(),
    cookies: {
      get: jest.fn(),
    },
    request: {},
    state: {},
  }
  const nextFunction = jest.fn()

  afterEach(() => jest.resetAllMocks())

  it('should validate JWT successfully', () => {
    const user = {
      id: faker.random.uuid(),
      name: faker.name.findName(),
      role: faker.random.word(),
    }
    const refreshToken = faker.random.uuid()
    const accessToken = faker.random.uuid()

    mocked(jwt).verify.mockImplementationOnce(() => ({ user }))
    mockContext.cookies.get.mockReturnValueOnce(refreshToken)
    mockContext.request = { headers: { authorization: `Bearer ${accessToken}` } }

    validateJwt(mockContext as any, nextFunction)

    expect(nextFunction).toBeCalledTimes(1)
    expect(mockContext.state.auth.user).toMatchObject(user)
    expect(mockContext.state.auth.accessToken).toEqual(accessToken)
    expect(mockContext.state.auth.refreshToken).toEqual(refreshToken)
  })

  it('should throw an error for invalid JWT token', () => {
    const accessToken = faker.random.uuid()
    mocked(jwt).verify.mockImplementationOnce(() => {
      throw new Error()
    })
    mockContext.request = { headers: { authorization: `Bearer ${accessToken}` } }

    validateJwt(mockContext as any, nextFunction)

    expect(nextFunction).not.toBeCalled()
    expect(mockContext.throw).toBeCalled()
  })
})
