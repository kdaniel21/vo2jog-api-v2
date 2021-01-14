import Router from 'koa-router'
import validate from 'koa-joi-validate'
import Joi from 'joi'
import { container } from 'tsyringe'
import validateJwt from '@auth/api/middleware/validate-jwt'
import AuthController from '@auth/api/auth.controller'

const router = new Router()

export default (api: Router) => {
  const authController: AuthController = container.resolve(AuthController)

  // POST /login
  const loginValidator = validate({
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  })
  router.post('/login', loginValidator, ctx => authController.login(ctx))

  // POST /register
  const registerValidator = validate({
    body: {
      email: Joi.string().email().required(),
      name: Joi.string().required(),
      password: Joi.string().min(8).required(),
      passwordConfirm: Joi.string().required().equal(Joi.ref('password')),
    },
  })
  router.post('/register', registerValidator, ctx => authController.register(ctx))

  // POST /logout
  router.post('/logout', validateJwt, authController.logout)

  // POST /forgot-password
  const forgotPasswordValidator = validate({
    body: { email: Joi.string().email().required() },
  })
  router.post('/forgot-password', forgotPasswordValidator, ctx =>
    authController.forgotPassword(ctx),
  )

  // POST/reset-password/:token
  const resetPasswordValidator = validate({
    body: {
      password: Joi.string().min(8).required(),
      passwordConfirm: Joi.string().required().equal(Joi.ref('password')),
    },
  })
  router.post('/reset-password/:token', resetPasswordValidator, ctx =>
    authController.resetPassword(ctx),
  )

  api.use('/auth', router.routes(), router.allowedMethods())
}
