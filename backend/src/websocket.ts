import { createAdapter } from '@socket.io/redis-streams-adapter'
import * as socketIO from 'socket.io'
import redis from 'redis'
import Config from './config'
import JwtService from './lib/services/jwt'
import ChatGateway from './features/chat/chat.gateway'

let redisAdapterClient: redis.RedisClientType | undefined = undefined
let adapter: undefined | ReturnType<typeof createAdapter> = undefined
if (Config.socketio.adapter === 'redis') {
  redisAdapterClient = redis.createClient({ url: Config.socketio.redis_adapter_uri })
  adapter = createAdapter(redisAdapterClient)
}

export const prepareAdapterConnection = async () => {
  if (redisAdapterClient) {
    await redisAdapterClient.connect()
  }
}

export const disconnectAdapterConnection = async () => {
  if (redisAdapterClient) {
    await redisAdapterClient.disconnect()
  }
}

const io = new socketIO.Server({
  adapter,
  cors: {
    origin: Config.cors.origin,
  },
})

const jwtService = new JwtService(Config.jwt.secret)
const chatGateway = new ChatGateway(jwtService)

chatGateway.mount(io.of('/chat'))

export { chatGateway }
export default io
