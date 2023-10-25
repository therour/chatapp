import Config from '~/config'
import pino from 'pino'
import pinoHttp from 'pino-http'

const levelByEnvironment = {
  production: 'info',
  development: 'debug',
  test: 'silent',
}

const logger = pino({
  level: levelByEnvironment[Config.environment],
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label }
    },
    bindings({ hostname, ...bindings }) {
      /* istanbul ignore next */
      return {
        ...bindings,
        hostname: Config.environment !== 'production' ? undefined : hostname,
      }
    },
  },
})

const FILTER_HEADERS = ['authorization', 'user-agent', 'accept'] as const

export const requestLogger = pinoHttp({
  logger: logger.child({ name: 'http' }),
  wrapSerializers: true,
  serializers: {
    req(req) {
      return {
        locals: req.locals,
        method: req.method,
        url: req.url,
        headers: Object.keys(req.headers).reduce(
          (headers, header) => {
            if (!FILTER_HEADERS.includes(header as (typeof FILTER_HEADERS)[number])) {
              // eslint-disable-next-line security/detect-object-injection
              headers[header] = req.headers[header]
            }
            return headers
          },
          {} as Record<string, unknown>,
        ),
      }
    },
    res() {
      return undefined
    },
  },
  customSuccessMessage(req, res, responseTime) {
    return `${req.method} ${req.url} ${res.statusCode} (${responseTime}ms)`
  },
})

export default logger
