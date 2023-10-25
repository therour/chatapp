import type { Request, Response } from 'express'
import { ChatMessage } from '~/lib/models/index'
import JwtService from '~/lib/services/jwt'
import { ApiValidationError } from '~/lib/utils/errors'
import { chatGateway } from '~/websocket'

export default class ChatController {
  constructor(private readonly jwt: JwtService) {
    this.jwt = jwt
  }

  joinRoom = async (req: Request, res: Response) => {
    const { roomID, username } = req.validatedData as { roomID: string; username: string }

    if (await chatGateway.isUsernameAlreadyInRoom(username, roomID)) {
      throw new ApiValidationError({ username: 'Username is already in the room' })
    }

    const token = this.jwt.sign({ username, roomID }, { expiresIn: '5y' })
    res.json({ token })
  }

  getMessages = async (req: Request, res: Response) => {
    const { roomID } = res.locals.session
    const messages = await ChatMessage.find({ roomID })
    return res.json({ message: 'OK', data: messages })
  }
}
