import mongoose from 'mongoose'
import Config from '~/config'

export const connectMongoDB = async () => await mongoose.connect(Config.db.mongo_uri)
