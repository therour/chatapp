import socketIO from 'socket.io'

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

  abstract register(): void
}
