import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/types';
import { PdvCheckoutService } from '../pdv-checkout.service';
import { PayCheckoutDto } from '../dto/pay-checkout.dto';

@ApiTags('wallet/pdv')
@Controller('wallet/pdv')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PdvWalletController {
  constructor(private readonly checkoutService: PdvCheckoutService) {}

  @Get('checkout/:code')
  @ApiOperation({ summary: 'Detalhes do checkout (após escanear QR)' })
  @ApiParam({ name: 'code', description: 'Código do checkout' })
  @ApiResponse({ status: 200, description: 'Detalhes do checkout' })
  async getCheckoutDetails(
    @Param('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const details = await this.checkoutService.getCheckoutDetails(code, user.sub);

    return {
      success: true,
      data: details,
    };
  }

  @Post('checkout/:code/pay')
  @ApiOperation({ summary: 'Pagar checkout com pontos' })
  @ApiParam({ name: 'code', description: 'Código do checkout' })
  @ApiResponse({ status: 200, description: 'Pagamento processado' })
  async payWithPoints(
    @Param('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.checkoutService.payWithPoints(code, user.sub);

    return {
      success: true,
      data: result,
      message: 'Pagamento realizado com sucesso!',
    };
  }

  @Post('checkout/:code/pix')
  @ApiOperation({ summary: 'Iniciar pagamento PIX' })
  @ApiParam({ name: 'code', description: 'Código do checkout' })
  @ApiResponse({ status: 200, description: 'QR Code PIX gerado' })
  async initiatePixPayment(
    @Param('code') code: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.checkoutService.initiatePixPayment(code, user.sub);

    return {
      success: true,
      data: result,
      message: 'QR Code PIX gerado. Pague em até 30 minutos.',
    };
  }

  @Get('checkout/:code/pix/status')
  @ApiOperation({ summary: 'Status do pagamento PIX' })
  @ApiParam({ name: 'code', description: 'Código do checkout' })
  @ApiResponse({ status: 200, description: 'Status do PIX' })
  async getPixStatus(@Param('code') code: string) {
    const status = await this.checkoutService.getPixStatus(code);

    return {
      success: true,
      data: status,
    };
  }

  @Post('checkout/:code/cancel')
  @ApiOperation({ summary: 'Cancelar checkout' })
  @ApiParam({ name: 'code', description: 'Código do checkout' })
  @ApiResponse({ status: 200, description: 'Checkout cancelado' })
  async cancelCheckout(@Param('code') code: string) {
    await this.checkoutService.cancelCheckout(code);

    return {
      success: true,
      message: 'Checkout cancelado',
    };
  }
}
