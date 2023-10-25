import mongoose from 'mongoose'
import request from 'supertest'
import app from '~/app'
import ChatGateway from '~/features/chat/chat.gateway'
import { connectMongoDB } from '~/lib/db/mongo'
import { ChatMessage } from '~/lib/models'
import JwtService from '~/lib/services/jwt'
import { chatGateway } from '~/websocket'

jest.mock('~/websocket.ts', () => {
  const mockedChatGateway = {
    isUsernameAlreadyInRoom: jest.fn(),
  } as unknown as jest.Mocked<ChatGateway>

  return {
    chatGateway: mockedChatGateway,
  }
})

jest.mock('~/lib/services/jwt.ts', () => {
  const ActualJwtService = jest.requireActual('~/lib/services/jwt.ts').default
  const jwtService = new ActualJwtService('anysecret')
  jwtService.verify = jest.fn()

  return jest.fn().mockImplementation(() => jwtService)
})

describe('POST /chats/join', () => {
  const mockedChatGateway = chatGateway as jest.Mocked<ChatGateway>
  beforeEach(() => {
    mockedChatGateway.isUsernameAlreadyInRoom.mockReset()
  })

  it('OK successfully return token', async () => {
    mockedChatGateway.isUsernameAlreadyInRoom.mockResolvedValue(false)

    const res = await request(app).post('/chats/join').send({
      username: 'user',
      roomID: 'room',
    })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      token: expect.any(String),
    })
  })

  it('FAIL return 422 when payload is not valid', async () => {
    const res = await request(app).post('/chats/join').send({
      username: '',
      roomID: '',
    })

    expect(res.status).toBe(422)
    expect(res.body).toEqual(
      expect.objectContaining({
        errors: {
          username: expect.any(String),
          roomID: expect.any(String),
        },
      }),
    )
  })

  it('FAIL return 422 when username is already in room', async () => {
    mockedChatGateway.isUsernameAlreadyInRoom.mockResolvedValue(true)

    const res = await request(app).post('/chats/join').send({
      username: 'user',
      roomID: 'room',
    })

    expect(res.status).toBe(422)
    expect(res.body).toEqual(
      expect.objectContaining({
        errors: {
          username: 'Username is already in the room',
        },
      }),
    )
  })
})

describe('GET /chats/messages', () => {
  const MockJwtService = JwtService as jest.MockedClass<typeof JwtService>
  const mockedJwtService = new MockJwtService('anysecret') as jest.Mocked<JwtService>
  beforeEach(() => {
    mockedJwtService.verify.mockReset()
  })
  beforeAll(async () => {
    await connectMongoDB()
    await ChatMessage.deleteMany({})
  })
  afterAll(async () => {
    await mongoose.disconnect()
  })

  it('OK successfully return messages', async () => {
    await ChatMessage.insertMany([
      { username: 'user', roomID: 'room', text: 'hello' },
      { username: 'user2', roomID: 'room', text: 'world' },
      { username: 'user2', roomID: 'other_room', text: 'world' },
    ])

    mockedJwtService.verify.mockReturnValue({ username: 'user', roomID: 'room' })

    const res = await request(app).get('/chats/messages').set('Authorization', 'Bearer anytoken')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            username: 'user',
            roomID: 'room',
            text: 'hello',
          }),
          expect.objectContaining({
            username: 'user2',
            roomID: 'room',
            text: 'world',
          }),
        ]),
      }),
    )
  })
})
