import mongoose from 'mongoose'

mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc, converted) => {
    delete converted._id
    delete converted.__v
  },
})

export { default as ChatMessage } from './ChatMessage'
