import { fetchUser } from '@auth/api/middleware/fetch-user'
import { User } from '@components/auth/entities/user.entity'
import faker from 'faker'
import { mocked } from 'ts-jest/utils'
import { container } from 'tsyringe'
jest.mock('tsyringe')

describe('Fetch user middleware', () => {
  const userRepository = {
    findOneOrFail: jest.fn(),
  }
  const loggerMock = {
    info: jest.fn(),
  }

  mocked(container).resolve.mockImplementation(key =>
    key === 'logger' ? loggerMock : userRepository,
  )

  const fakeUser: Partial<User> = {
    id: faker.random.uuid(),
    name: faker.name.findName(),
    email: faker.internet.email(),
  }

  const mockContext = {
    throw: jest.fn(),
    state: { auth: { user: {} } },
  }
  const nextFunction = jest.fn()

  afterEach(() => jest.resetAllMocks())

  it('should fetch the complete user object from the DB', async () => {
    const { id, role } = fakeUser
    mockContext.state.auth.user = { id, role }
    userRepository.findOneOrFail.mockResolvedValueOnce(fakeUser as User)

    await fetchUser(mockContext as any, nextFunction)

    expect(mockContext.state.auth.user).toMatchObject(fakeUser)
    expect(nextFunction).toBeCalledTimes(1)
    expect(mockContext.throw).not.toBeCalled()
  })

  it('should throw an error when user does not exist', async () => {
    mockContext.state.auth.user = { id: faker.random.number(), role: faker.random.word() }
    // findUnique.mockReturnValueOnce(null as any)
    userRepository.findOneOrFail.mockImplementationOnce(() => {
      throw new Error()
    })

    await fetchUser(mockContext as any, nextFunction)

    expect(nextFunction).not.toBeCalled()
    expect(mockContext.throw).toBeCalled()
  })
})
