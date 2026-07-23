import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: 'http://localhost:5173' },
})
export class MonitoringGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MonitoringGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Called by the worker whenever a check happens
  emitCheckResult(monitorId: string, data: any) {
    this.server.emit(`monitor:${monitorId}:check`, data);
  }

  // Called by the worker whenever an incident opens/resolves
  emitIncidentUpdate(monitorId: string, data: any) {
    this.server.emit(`monitor:${monitorId}:incident`, data);
  }
}