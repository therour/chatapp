import cors from 'cors'
import express from 'express'
import { errorHandler } from './api/middleware'
import router from './api/router'
import Config from './config'
import { requestLogger } from './lib/utils/logger'

const app = express()

app.use(requestLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: Config.cors.origin }))
app.use('/', router)

app.use(errorHandler)

export default app
