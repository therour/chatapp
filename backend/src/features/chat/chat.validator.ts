import Validator from 'fastest-validator'

const validator = new Validator()

export const joinRoomValidator = validator.compile({
  username: { type: 'string', required: true, empty: false, max: 100, trim: true },
  roomID: { type: 'string', required: true, empty: false, max: 100, trim: true },
})
