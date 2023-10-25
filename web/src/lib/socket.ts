import { ManagerOptions, Socket, SocketOptions, io } from 'socket.io-client'
import { ChatMessage } from '@/types'

type ServerToClientEventMap = {
  'room:joined': (username: string) => void
  'room:message': (message: ChatMessage) => void
  'room:error': (err: Error) => void
}
interface ClientMessageSendCallback {
  (err: Error): void
  (id: string): void
}
type ClientToServerEventMap = {
  'message:send': (message: string, cb: ClientMessageSendCallback) => void
}

export type IOSocket = Socket<ServerToClientEventMap, ClientToServerEventMap>

const defaultSocketOpts: Partial<ManagerOptions & SocketOptions> = {
  autoConnect: false,
  timeout: 10000,
  auth: {
    token: undefined,
    lastMessageAt: undefined,
  },
}

export function createSocket(namespace: string = '/'): IOSocket {
  const socket = io(import.meta.env.VITE_WS_URI + namespace, defaultSocketOpts)

  return socket
}
