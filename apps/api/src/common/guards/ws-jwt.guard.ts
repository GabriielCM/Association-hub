import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        throw new WsException('Token not provided');
      }

      const payload = await this.jwtService.verifyAsync(token);

      // Attach user to socket for later use
      (client as any).user = {
        id: payload.sub,
        associationId: payload.associationId,
        role: payload.role,
      };

      return true;
    } catch (error) {
      this.logger.error('WebSocket authentication failed', error);
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: Socket): string | null {
    // Try to get token from handshake auth
    const authToken = client.handshake?.auth?.token;
    if (authToken) {
      return authToken.replace('Bearer ', '');
    }

    // Try to get token from query
    const queryToken = client.handshake?.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken.replace('Bearer ', '');
    }

    // Try to get token from headers
    const headerToken = client.handshake?.headers?.authorization;
    if (headerToken) {
      return headerToken.replace('Bearer ', '');
    }

    return null;
  }
}
