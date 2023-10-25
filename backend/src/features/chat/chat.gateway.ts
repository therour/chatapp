import { SocketHandler, WebsocketGateway } from '~/lib/websocket/index'
import { ChatMessage } from '~/lib/models/index'
import { type JsonChatMessage } from '~/lib/models/ChatMessage'
import JwtService from '~/lib/services/jwt'
import AsyncLock from 'async-lock'

type ServerEvents = {
  'room:message': (message: JsonChatMessage) => void
}
type ClientEvents = {
  'message:send': (text: string, cb: (id: string) => void) => void
}
type SocketData = {
  username: string
  roomID: string
}

const lock = new AsyncLock()

class ChatGateway extends WebsocketGateway<ClientEvents, ServerEvents, never, SocketData> {
  private roomUsersMap: Map<string, Set<string>> = new Map()

  constructor(public readonly jwtService: JwtService) {
    super()
  }

  async isUsernameAlreadyInRoom(username: string, roomID: string) {
    const ok = await lock.acquire('roomUsersMap', () => {
      return this.roomUsersMap.has(roomID) && this.roomUsersMap.get(roomID)?.has(username)
    })

    return ok
  }

  init() {
    this.server.use((socket, next) => {
      if (!socket.handshake.auth.token) {
        next(new Error('Authentication error'))
        return
      }

      try {
        const { username, roomID } = this.jwtService.verify(socket.handshake.auth.token) as {
          username: string
          roomID: string
        }
        socket.data = { username, roomID }
      } catch (err) {
        next(new Error('Invalid token'))
        return
      }

      this.isUsernameAlreadyInRoom(socket.data.username, socket.data.roomID).then(
        (yes) => {
          if (yes) {
            next(new Error('the username is already in room'))
          } else {
            next()
          }
        },
        (err) => next(err),
      )
    })

    this.server.on('connection', async (socket) => {
      const { roomID, username } = socket.data

      // * Join roomID
      await lock.acquire('roomUsersMap', () => {
        socket.join(roomID)
        if (!this.roomUsersMap.has(roomID)) {
          this.roomUsersMap.set(roomID, new Set())
        }
        this.roomUsersMap.get(roomID)?.add(username)
      })

      // * Handle disconnect
      socket.on('disconnect', async () => {
        await lock.acquire('roomUsersMap', () => {
          if (this.roomUsersMap.has(roomID)) {
            this.roomUsersMap.get(roomID)?.delete(username)
          }
        })
      })

      // * Handle reconnection: fetch missed messages
      const lastMessageAt = socket.handshake.auth.lastMessageAt
      if (lastMessageAt) {
        ChatMessage.find({ roomID, createdAt: { $gt: lastMessageAt } }).then((messages) => {
          messages.forEach((message) => {
            socket.emit('room:message', message.toJSON())
          })
        })
      }

      // registerListeners
      new ChatSocketHandler(socket)
    })
  }
}

class ChatSocketHandler extends SocketHandler<ClientEvents, ServerEvents, never, SocketData> {
  register(): void {
    this.socket.on('message:send', this.safe(this.handleClientMessage.bind(this)))
  }

  async handleClientMessage(text: string, cb: (id: string) => void) {
    const { username, roomID } = this.socket.data
    const chatMessage = new ChatMessage({
      text: text,
      username: username,
      roomID: roomID,
    })
    await chatMessage.save()

    this.socket.broadcast.to(roomID).emit('room:message', chatMessage.toJSON())

    cb(chatMessage.id)
  }
}

export default ChatGateway
