import { Router } from 'express'
import { catchAsync } from '~/lib/utils/middleware'
import ChatController from '~/features/chat/chat.controller'
import JwtService from '~/lib/services/jwt'
import Config from '~/config'
import { joinRoomValidator } from '~/features/chat/chat.validator'
import { authenticate, validateBody } from './middleware'

const router = Router()

{
  // * Chat Routes
  const jwtService = new JwtService(Config.jwt.secret)
  const chatController = new ChatController(jwtService)
  const auth = authenticate((token) => jwtService.verify(token))

  router.post('/chats/join', validateBody(joinRoomValidator), catchAsync(chatController.joinRoom))
  router.get('/chats/messages', auth, catchAsync(chatController.getMessages))
}

export default router
