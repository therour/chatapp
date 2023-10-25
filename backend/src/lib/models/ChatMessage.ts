import { Schema, model } from 'mongoose'

export interface IChatMessage {
  text: string
  username: string
  roomID: string
}

export interface JsonChatMessage extends IChatMessage {
  id: string
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    text: { type: String, required: true },
    username: { type: String, required: true },
    roomID: { type: String, required: true },
  },
  { timestamps: true },
)

const ChatMessage = model<IChatMessage>('ChatMessage', chatMessageSchema)

export default ChatMessage
