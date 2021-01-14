import authSubscriberLoader from '@auth/auth.subscribers'

export default () => ({
  authSubscriber: authSubscriberLoader(),
})
