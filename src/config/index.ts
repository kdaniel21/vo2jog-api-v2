import dotenv from 'dotenv'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const envFound = dotenv.config()
if (envFound.error) throw new Error('Could not find .env file!')

export default {
  port: parseInt(process.env.PORT || '3000'),
  production: process.env.NODE_ENV === 'production',
  development: process.env.NODE_ENV === 'development',
  testing: process.env.NODE_ENV === 'test',

  // Logging
  logs: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Database connection
  db: {
    url: process.env.DB_URL,
  },

  api: {
    prefix: process.env.API_PREFIX,
  },

  auth: {
    saltRounds: +process.env.SALT_ROUNDS,
    jwtSecret: process.env.JWT_SECRET,
    jwtLifetime: process.env.JWT_LIFETIME,
    refreshTokenLength: +process.env.REFRESH_TOKEN_LENGTH,
    refreshTokenLifetime: +process.env.REFRESH_TOKEN_LIFETIME,
    passwordResetLifetime: +process.env.PASSWORD_RESET_LIFETIME,
  },
}
