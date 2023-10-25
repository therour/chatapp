export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean,
    stack?: string,
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export class ApiValidationError extends ApiError {
  errors: Record<string, string>
  constructor(errors: Record<string, string>, statusCode = 422, message = 'Invalid data') {
    super(statusCode, message, true)
    this.errors = errors
  }
}
