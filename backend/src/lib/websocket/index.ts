import socketIO from 'socket.io'
import logger from '~/lib/utils/logger'

type EventsMap = Record<string, unknown>

export abstract class WebsocketGateway<
  ClientEvents extends EventsMap,
  ServerEvents extends EventsMap,
  ServerToServerEvents extends EventsMap,
  SocketData = unknown,
> {
  server!: socketIO.Namespace<ClientEvents, ServerEvents, ServerToServerEvents, SocketData>

  mount(server: socketIO.Namespace) {
    this.server = server
    this.init()
  }

  abstract init(): void
}

export abstract class SocketHandler<
  ClientEvents extends EventsMap,
  ServerEvents extends EventsMap,
  ServerToServerEvents extends EventsMap,
  SocketData = unknown,
> {
  constructor(
    protected readonly socket: socketIO.Socket<ClientEvents, ServerEvents, ServerToServerEvents, SocketData>,
  ) {
    this.socket = socket
    this.register()
  }

  safe<A extends unknown[], R>(cb: (...args: A) => R | Promise<R>): (...args: A) => Promise<void | Awaited<R>> {
    return (...args: A) => {
      return Promise.resolve<R>(cb(...args)).catch((err) => this.onError(err))
    }
  }

  onError(err: unknown) {
    logger.error(err)
  }

  abstract register(): void
}
