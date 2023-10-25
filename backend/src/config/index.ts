import env, { environment } from './env'

const Config = {
  environment,
  port: env.PORT,
  host: env.HOST,
  cors: {
    origin: env.CORS_ORIGIN,
  },
  socketio: {
    adapter: env.SOCKETIO_ADAPTER,
    redis_adapter_uri: env.SOCKETIO_REDIS_URI,
  },
  db: {
    mongo_uri: env.MONGO_URI,
  },
  jwt: {
    secret: env.JWT_SECRET,
  },
}

export default Config
