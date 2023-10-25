export type ChatMessage = {
  id: string
  username: string
  text: string
  createdAt: string
}
export type ChatMessageState = Omit<ChatMessage, 'id' | 'createdAt'> & {
  temporaryId?: number
  id?: string
  seen: boolean
}
