import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PdvApiKeyGuard } from '../guards/pdv-api-key.guard';
import { PdvService } from '../pdv.service';
import { PdvCheckoutService } from '../pdv-checkout.service';
import { CreateCheckoutDto } from '../dto/create-checkout.dto';

@ApiTags('pdv/display')
@Controller('pdv')
@UseGuards(PdvApiKeyGuard)
@ApiHeader({ name: 'x-pdv-api-key', required: true, description: 'PDV API Key' })
@ApiHeader({ name: 'x-pdv-api-secret', required: true, description: 'PDV API Secret' })
export class PdvDisplayController {
  constructor(
    private readonly pdvService: PdvService,
    private readonly checkoutService: PdvCheckoutService,
  ) {}

  @Get(':id/products')
  @ApiOperation({ summary: 'Listar produtos do PDV (para display)' })
  @ApiResponse({ status: 200, description: 'Lista de produtos' })
  async getProducts(@Param('id') pdvId: string, @Req() req: any) {
    // Verify the authenticated PDV matches the requested one
    if (req.pdv.id !== pdvId) {
      return { success: false, error: 'PDV não autorizado' };
    }

    const products = await this.pdvService.getProducts(pdvId);

    // Group by category
    const categories: Record<string, any[]> = {};
    for (const product of products) {
      const cat = product.category || 'Outros';
      if (!categories[cat]) categories[cat] = [];
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      categories[cat].push({
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl
          ? (product.imageUrl.startsWith('http') ? product.imageUrl : `${baseUrl}${product.imageUrl}`)
          : null,
        pricePoints: product.pricePoints,
        priceMoney: Number(product.priceMoney),
        stock: product.stock,
        inStock: product.stock > 0,
      });
    }

    return {
      success: true,
      data: {
        pdvName: req.pdv.name,
        categories,
        totalProducts: products.length,
      },
    };
  }

  @Post(':id/checkout')
  @ApiOperation({ summary: 'Criar checkout (gera QR Code)' })
  @ApiResponse({ status: 201, description: 'Checkout criado' })
  async createCheckout(
    @Param('id') pdvId: string,
    @Body() dto: CreateCheckoutDto,
    @Req() req: any,
  ) {
    if (req.pdv.id !== pdvId) {
      return { success: false, error: 'PDV não autorizado' };
    }

    const checkout = await this.checkoutService.createCheckout(pdvId, dto);

    return {
      success: true,
      data: checkout,
    };
  }

  @Get('checkout/:code/status')
  @ApiOperation({ summary: 'Status do checkout (polling)' })
  @ApiResponse({ status: 200, description: 'Status do checkout' })
  async getCheckoutStatus(@Param('code') code: string) {
    const status = await this.checkoutService.getCheckoutStatus(code);

    return {
      success: true,
      data: status,
    };
  }

  @Post(':id/checkout/:code/cancel')
  @ApiOperation({ summary: 'Cancelar checkout' })
  @ApiResponse({ status: 200, description: 'Checkout cancelado' })
  async cancelCheckout(
    @Param('id') pdvId: string,
    @Param('code') code: string,
    @Req() req: any,
  ) {
    if (req.pdv.id !== pdvId) {
      return { success: false, error: 'PDV não autorizado' };
    }

    await this.checkoutService.cancelCheckout(code);

    return {
      success: true,
      message: 'Checkout cancelado',
    };
  }
}
