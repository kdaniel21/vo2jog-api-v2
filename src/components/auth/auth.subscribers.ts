import EventEmitter from 'eventemitter3'

export const authEvents = {
  register: 'onUserRegister',
  login: 'onUserLogin',
}

export default () => {
  const authSubscriber = new EventEmitter()

  // authSubscriber.on(authEvents.login, async (payload: { user: User }) => {
  //   // Do something here
  // })

  return authSubscriber
}
