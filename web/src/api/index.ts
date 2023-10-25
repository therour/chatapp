import { AxiosRequestConfig } from 'axios'
import { ChatMessage } from '@/types'
import request from './request'

type ChatRoomJoinPayload = {
  username: string
  roomID: string
}

type ChatRoomJoinResponse = {
  message: 'OK'
  token: string
}

const Api = {
  chatroom: {
    async join(payload: ChatRoomJoinPayload, opts: AxiosRequestConfig = {}) {
      const res = await request.post<ChatRoomJoinResponse>('/chats/join', payload, opts)
      return res.data
    },
    async getMessages(opts: AxiosRequestConfig = {}) {
      const res = await request.get<{ data: ChatMessage[] }>('/chats/messages', opts)
      return res.data
    },
  },

  setBearerToken(token?: string) {
    if (token) {
      request.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      request.defaults.headers.common.Authorization = undefined
    }
  },
}

export default Api
