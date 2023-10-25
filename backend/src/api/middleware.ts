import express from 'express'
import { ApiError, ApiValidationError } from '~/lib/utils/errors'
import type { AsyncCheckFunction, CheckFunctionOptions, SyncCheckFunction } from 'fastest-validator'
import logger from '~/lib/utils/logger'

const convertError = (err: unknown) => {
  if (err instanceof ApiError) {
    return err
  }

  const statusCode = 500
  const message = err instanceof Error ? err.message : 'Internal Server Error'
  return new ApiError(statusCode, message, false, err instanceof Error ? err.stack : undefined)
}

export const errorHandler: express.ErrorRequestHandler = (err, req, res, _next) => {
  const error = convertError(err)
  const { statusCode, stack, isOperational } = error

  if (!isOperational) {
    logger.error(stack)
  }

  res.status(statusCode).json({
    message: isOperational ? error.message : 'Internal Server Error',
    errors: error instanceof ApiValidationError ? error.errors : undefined,
  })
}

export const authenticate: (authorizer: (token: string) => unknown) => express.RequestHandler =
  (tokenAuthorizer) => (req, res, next) => {
    const headerAuthorization = req.headers.authorization
    const token = headerAuthorization?.split(' ')?.[1]
    if (!headerAuthorization || !headerAuthorization.startsWith('Bearer ') || !token) {
      next(new ApiError(401, 'Unauthorized', true))
      return
    }

    try {
      const payload = tokenAuthorizer(token)
      res.locals.session = payload
      next()
    } catch (err) {
      next(err)
    }
  }

export const validateBody =
  (validator: SyncCheckFunction | AsyncCheckFunction, opts: CheckFunctionOptions = {}): express.RequestHandler =>
  async (req, _res, next) => {
    const data = structuredClone(req.body)
    const result = validator.async ? await validator(data, opts) : validator(data, opts)

    if (result === true) {
      req.validatedData = data
      next()
      return
    }

    const errors = result.reduce(
      (obj, { field, message }) => {
        if (message) {
          // eslint-disable-next-line security/detect-object-injection
          obj[field] = message
        }
        return obj
      },
      {} as Record<string, string>,
    )
    next(new ApiValidationError(errors))
  }
