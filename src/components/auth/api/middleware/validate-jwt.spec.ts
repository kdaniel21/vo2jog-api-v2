import { mocked } from 'ts-jest/utils'
import faker from 'faker'
import { validateJwt } from '@auth/api/middleware/validate-jwt'
import jwt from 'jsonwebtoken'
import { container } from 'tsyringe'
jest.mock('jsonwebtoken')
jest.mock('tsyringe')

describe('Validate JWT middleware', () => {
  const mockContext: any = {
    throw: jest.fn(),
    cookies: {
      get: jest.fn(),
    },
    request: {},
    state: {},
  }
  const loggerMock = {
    info: jest.fn(),
  }
  const nextFunction = jest.fn()

  mocked(container).resolve.mockReturnValue(loggerMock)

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
    mockContext.state.auth = { refreshToken, accessToken }

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
    mockContext.state.auth = { accessToken }

    validateJwt(mockContext as any, nextFunction)

    expect(nextFunction).not.toBeCalled()
    expect(mockContext.throw).toBeCalled()
  })
})
