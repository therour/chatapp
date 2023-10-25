import { create } from 'zustand'
import Api from '@/api'
import { createSocket } from '@/lib/socket'
import { ChatMessage, ChatMessageState } from '@/types'
import { SessionStore } from './session'

type ChatStore = {
  session?: SessionStore
  status: 'disconnected' | 'connecting' | 'connected'
  fetchingMessages: boolean
  messages: ChatMessageState[]
  start: (session: SessionStore) => void
  exit: () => void
  sendMessage: (text: string) => void
}

const socket = createSocket('/chat')
let getMessageAbortController: AbortController | undefined = new AbortController()

export const useChatStore = create<ChatStore>((set, get) => {
  const handleSocketConnected = () => {
    set({ status: 'connected' })
  }

  const handleSocketDisconnected = () => {
    set({ status: 'disconnected' })
  }

  const handleRoomMessage = (data: ChatMessage) => {
    if (socket) {
      ;(socket.auth as Record<string, unknown>).lastMessageAt = data.createdAt
    }
    set((prev) => ({
      messages: [...prev.messages, { ...data, seen: false }],
    }))
  }

  return {
    session: undefined,
    socket: undefined,
    status: 'disconnected',
    fetchingMessages: false,
    messages: [],
    async start(session) {
      ;(socket.auth as Record<string, unknown>).token = session.token

      socket.connect()
      socket.on('connect', handleSocketConnected)
      socket.on('disconnect', handleSocketDisconnected)
      socket.on('room:message', handleRoomMessage)
      socket.on('connect_error', (err) => {
        console.error('error connecting to Chat Websocket', err)
      })

      set({ session, status: 'connecting', fetchingMessages: true })

      getMessageAbortController ??= new AbortController()
      Api.chatroom.getMessages({ signal: getMessageAbortController.signal }).then((res) => {
        const messages = res.data.map((m) => ({ ...m, seen: true }))
        if (messages.length > 0) {
          ;(socket.auth as Record<string, unknown>).lastMessageAt = messages[messages.length - 1].createdAt
        }
        set({ messages: messages, fetchingMessages: false })
      })
    },
    exit() {
      if (socket) {
        socket.disconnect()
        socket.offAny()
      }
      if (getMessageAbortController) {
        getMessageAbortController.abort()
        getMessageAbortController = undefined
      }

      set({ session: undefined, fetchingMessages: false, messages: [], status: 'disconnected' })
    },
    async sendMessage(text: string) {
      const { session } = get()
      if (!session || !socket.connected) {
        throw new Error('chatroom hooks must be used after calling start()')
      }

      const temporaryId = Date.now()

      const message: ChatMessageState = {
        temporaryId,
        username: session.username,
        text,
        seen: true,
      }
      set((state) => {
        return { messages: [...state.messages, message] }
      })

      const messageId = await socket.emitWithAck('message:send', message.text)

      // sync message id from server
      const { messages } = get()
      const temporarymessage = messages.find((m) => m.temporaryId === temporaryId)
      if (temporarymessage) {
        temporarymessage.id = messageId
        set({ messages: [...messages] })
      }
    },
  }
})
