import Validator, { type ValidationError } from 'fastest-validator'

const v = new Validator({
  defaults: {
    string: { empty: false },
  },
})

export const environment = (process.env.NODE_ENV || 'development') as 'test' | 'development' | 'production'

const env = {
  NODE_ENV: environment,
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '127.0.0.1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || (environment === 'development' ? '*' : undefined),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  SOCKETIO_ADAPTER: process.env.SOCKETIO_ADAPTER || 'memory',
  SOCKETIO_REDIS_URI: process.env.SOCKETIO_REDIS_URI || undefined,
}

const ok = v.compile({
  NODE_ENV: { type: 'enum', values: ['test', 'development', 'production'] },
  PORT: { type: 'number', convert: true, required: true },
  HOST: { type: 'string', empty: false, required: true },
  CORS_ORIGIN: { type: 'string', required: true },
  MONGO_URI: { type: 'string', required: true },
  JWT_SECRET: { type: 'string', required: true },
  SOCKETIO_ADAPTER: { type: 'enum', required: true, values: ['memory', 'redis'] },
  SOCKETIO_REDIS_URI: { type: 'string', required: false, optional: true },
})(env)

export default env as unknown as {
  PORT: number
  HOST: string
  CORS_ORIGIN: string
  MONGO_URI: string
  JWT_SECRET: string
  SOCKETIO_ADAPTER: 'redis' | 'memory'
  SOCKETIO_REDIS_URI: string | undefined
}

/**
 * Validate environment variables
 */

if (environment !== 'test' && ok !== true) {
  console.error('Invalid environment variables')
  const validationErrors = ok as ValidationError[]
  validationErrors.forEach((error) => {
    console.error(error.message)
  })
  process.exit(1)
}
