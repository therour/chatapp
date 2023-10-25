import * as http from 'node:http'
import { type AddressInfo } from 'node:net'
import io, { chatGateway } from '~/websocket'
import { io as ioc, Socket as ClientSocket, type ManagerOptions, type SocketOptions } from 'socket.io-client'
import { Socket as ServerSocket } from 'socket.io'
import JwtService from '~/lib/services/jwt'
import Config from '~/config'
import mongoose from 'mongoose'
import { connectMongoDB } from '~/lib/db/mongo'
import { ChatMessage } from '~/lib/models'

describe('ChatGateway', () => {
  let wsUrl: string = ''

  const createChatSocket = (opts: Partial<ManagerOptions & SocketOptions> = {}) => {
    return ioc(`${wsUrl}/chat`, { ...opts, reconnection: false })
  }

  beforeAll(async () => {
    await connectMongoDB()
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  beforeEach(async () => {
    const httpServer = http.createServer()
    io.attach(httpServer)
    return new Promise<void>((resolve) => {
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port
        wsUrl = `http://localhost:${port}`

        resolve()
      })
    })
  })

  afterEach(async () => {
    await new Promise((resolve) => io.close(resolve))
    await ChatMessage.deleteMany({})
  })

  test('Client can connect', async () => {
    const token = createToken('user', 'room')
    const socket = createChatSocket({ auth: { token } })

    await expect(waitForConnected(socket)).resolves.not.toThrow()

    expect(socket.connected).toBe(true)
    socket.disconnect()
  })

  test('Client cannot connect without auth token', async () => {
    const socket = createChatSocket({})

    await expect(waitForConnected(socket)).rejects.toThrow('Authentication error')
    socket.disconnect()
  })

  test('Client cannot connect with invalid auth token', async () => {
    const socket = createChatSocket({ auth: { token: 'invalid token' } })

    await expect(waitForConnected(socket)).rejects.toThrow('Invalid token')

    socket.disconnect()
  })

  test('Connected client will join :roomID:', async () => {
    const socket = createChatSocket({ auth: { token: createToken('user', 'roomID') } })
    await expect(waitForConnected(socket)).resolves.not.toThrow()

    await expect(chatGateway.isUsernameAlreadyInRoom('user', 'roomID')).resolves.toBe(true)
    socket.disconnect()
  })

  test('Client cannot connect if the same user already joined the room', async () => {
    const socket = createChatSocket({ auth: { token: createToken('user', 'roomID') } })
    await expect(waitForConnected(socket)).resolves.not.toThrow()

    const otherSocket = createChatSocket({ auth: { token: createToken('user', 'roomID') } })
    await expect(waitForConnected(otherSocket)).rejects.toThrow('the username is already in room')

    socket.disconnect()
    otherSocket.disconnect()
  })

  test('Client can send message', async () => {
    const socket = createChatSocket({ auth: { token: createToken('user', 'roomID') } })
    await expect(waitForConnected(socket)).resolves.not.toThrow()

    const messageId = await socket.emitWithAck('message:send', 'Hello')
    expect(messageId).toEqual(expect.any(String))
    expect(mongoose.isValidObjectId(messageId)).toBe(true)
    await expect(ChatMessage.findById(messageId)).resolves.toEqual(
      expect.objectContaining({ text: 'Hello', username: 'user', roomID: 'roomID' }),
    )

    socket.disconnect()
  })

  test('Server will broadcast message to all clients in the room', async () => {
    const senderSocket = createChatSocket({ auth: { token: createToken('sender', 'room') } })
    const user1Socket = createChatSocket({ auth: { token: createToken('user1', 'room') } })
    const user2Socket = createChatSocket({ auth: { token: createToken('user2', 'room') } })
    const otherSocket = createChatSocket({ auth: { token: createToken('anotherRoomUser', 'anotherRoom') } })

    await expect(
      Promise.all([
        waitForConnected(senderSocket),
        waitForConnected(user1Socket),
        waitForConnected(user2Socket),
        waitForConnected(otherSocket),
      ]),
    ).resolves.not.toThrow()

    const receiverListeners = [waitFor(user1Socket, 'room:message'), waitFor(user2Socket, 'room:message')]
    const otherListener = waitFor(otherSocket, 'room:message', 1000) // wait for 1 second

    const messageId = await senderSocket.emitWithAck('message:send', 'Hello')
    await Promise.all(receiverListeners.map((l) => l.promise))

    receiverListeners.forEach((listener) => {
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ id: messageId, text: 'Hello', username: 'sender' }),
      )
    })

    await expect(otherListener.promise).rejects.toThrow('Timeout waiting for room:message')
    expect(otherListener).not.toHaveBeenCalled()

    user1Socket.disconnect()
    user2Socket.disconnect()
    otherSocket.disconnect()
    senderSocket.disconnect()
  })

  test('Client can disconnect', async () => {
    const socket = createChatSocket({ auth: { token: createToken('user', 'room') } })
    await expect(waitForConnected(socket)).resolves.not.toThrow()

    const disconnected = waitFor(socket, 'disconnect')

    socket.disconnect()
    await expect(disconnected.promise).resolves.not.toThrow()
    await expect(chatGateway.isUsernameAlreadyInRoom('user', 'roomID')).resolves.toBe(false)
  })
})

const createToken = (username: string, roomID: string) => {
  const jwtService = new JwtService(Config.jwt.secret)
  return jwtService.sign({ username, roomID }, { expiresIn: '1h' })
}

const waitFor = function (socket: ClientSocket | ServerSocket, event: string, timeout: number = 5000) {
  const listener = jest.fn() as jest.Mock & { promise: Promise<jest.Mock> }
  listener.promise = new Promise<jest.Mock>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      socket.off(event, done)
      reject(new Error(`Timeout waiting for ${event}`))
    }, timeout)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const done = (...v: any[]) => {
      clearTimeout(timeoutId)
      listener(...v)
      resolve(listener)
    }

    socket.once(event, done)
  })
  return listener
}

const waitForConnected = async (socket: ClientSocket) => {
  if (socket.connected) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve)
    socket.once('connect_error', (err) => {
      reject(err)
    })
  })
}
