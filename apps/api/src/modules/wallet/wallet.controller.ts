import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/types';
import { WalletService } from './wallet.service';
import { QrScannerService } from './qr-scanner.service';
import { ScanQrDto, PdvPaymentDto, WalletSummaryQueryDto } from './dto';

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly qrScannerService: QrScannerService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obter dashboard da carteira' })
  @ApiResponse({ status: 200, description: 'Dashboard retornado com sucesso' })
  async getDashboard(@CurrentUser() user: JwtPayload) {
    const data = await this.walletService.getDashboard(user.sub);
    return { data };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo de ganhos/gastos por período' })
  @ApiResponse({ status: 200, description: 'Resumo retornado com sucesso' })
  async getSummary(@CurrentUser() user: JwtPayload, @Query() query: WalletSummaryQueryDto) {
    const data = await this.walletService.getSummary(user.sub, query.period!);
    return { data };
  }

  @Post('scan')
  @ApiOperation({ summary: 'Processar QR Code escaneado' })
  @ApiResponse({ status: 200, description: 'QR Code processado' })
  @ApiResponse({ status: 400, description: 'QR Code inválido' })
  async scanQrCode(@CurrentUser() user: JwtPayload, @Body() dto: ScanQrDto) {
    const result = await this.qrScannerService.processQrCode(
      dto.qrCodeData,
      dto.qrCodeHash,
      user.sub,
    );
    return { data: result };
  }

  @Get('pdv/checkout/:code')
  @ApiOperation({ summary: 'Obter detalhes de um checkout PDV' })
  @ApiResponse({ status: 200, description: 'Detalhes retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Checkout não encontrado ou expirado' })
  async getCheckoutDetails(@Param('code') checkoutCode: string, @CurrentUser() user: JwtPayload) {
    const data = await this.walletService.getCheckoutDetails(checkoutCode, user.sub);
    return { data };
  }

  @Post('pdv/pay')
  @ApiOperation({ summary: 'Confirmar pagamento PDV' })
  @ApiResponse({ status: 200, description: 'Pagamento realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou checkout inválido' })
  async processPdvPayment(@CurrentUser() user: JwtPayload, @Body() dto: PdvPaymentDto) {
    const result = await this.walletService.processPdvPayment(dto.checkoutCode, user.sub);
    return result;
  }
}
