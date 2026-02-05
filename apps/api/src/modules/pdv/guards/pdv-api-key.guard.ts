import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PdvApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract API key from header
    const apiKey = request.headers['x-pdv-api-key'];
    const apiSecret = request.headers['x-pdv-api-secret'];

    if (!apiKey || !apiSecret) {
      throw new UnauthorizedException('API Key e Secret são obrigatórios');
    }

    // Find PDV by API key
    const pdv = await this.prisma.pdv.findUnique({
      where: { apiKey },
    });

    if (!pdv) {
      throw new UnauthorizedException('PDV não encontrado');
    }

    if (pdv.status !== 'ACTIVE') {
      throw new UnauthorizedException('PDV não está ativo');
    }

    // Verify API secret
    const isValidSecret = await bcrypt.compare(apiSecret, pdv.apiSecret);
    if (!isValidSecret) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Attach PDV to request for use in controllers
    request.pdv = pdv;

    return true;
  }
}
