import faker from 'faker'
import includeTokens from '@auth/api/middleware/include-tokens'

describe('Include tokens middleware', () => {
  const nextFunction = jest.fn()
  const contextMock: any = {
    request: {},
    cookies: {
      get: jest.fn(),
    },
    state: {},
  }

  it('should include both access and refresh token', () => {
    const refreshToken = faker.random.uuid()
    const accessToken = faker.random.uuid()
    contextMock.cookies.get.mockReturnValueOnce(refreshToken)
    contextMock.request.headers.authorization = `Bearer ${accessToken}`

    includeTokens(contextMock, nextFunction)

    expect(contextMock.state.auth.refreshToken).toBe(refreshToken)
    expect(contextMock.state.auth.accessToken).toBe(accessToken)
    expect(nextFunction).toBeCalledTimes(1)
  })
})
