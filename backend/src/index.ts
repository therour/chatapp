import mongoose from 'mongoose'
import * as http from 'node:http'
import app from './app'
import Config from './config'
import { connectMongoDB } from './lib/db/mongo'
import logger from './lib/utils/logger'
import io, { disconnectAdapterConnection, prepareAdapterConnection } from './websocket'

const connectDatabase = async () => {
  logger.info('Connecting to Database...')
  await connectMongoDB()
  await prepareAdapterConnection()
}

const disconnectDatabase = () => {
  return Promise.allSettled([mongoose.disconnect(), disconnectAdapterConnection()])
}

const startServer = async () => {
  const server = http.createServer(app)
  io.listen(server)

  return server.listen(Config.port, Config.host, () => {
    logger.info(`Listening on ${Config.host + ':' + Config.port}`)
  })
}

let server: http.Server | undefined

/**
 * Run Server
 */

connectDatabase()
  .then(startServer)
  .then((serverInstance) => {
    server = serverInstance
  })

const exitHandler = () => {
  if (server) {
    server.close(() => {
      disconnectDatabase().then(() => {
        process.exit()
      })
    })
  } else {
    disconnectDatabase().then(() => {
      process.exit()
    })
  }
}

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error)
  exitHandler()
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)

process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (server) {
    server.close(() => disconnectDatabase())
  }
})
