import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';
import { FavoritesService } from '../services/favorites.service';
import { ReviewsService } from '../services/reviews.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';
import {
  ValidateCheckoutDto,
  ProcessCheckoutDto,
} from '../dto/checkout.dto';
import { CreateReviewDto } from '../dto/review.dto';

@ApiTags('Store - Usuário')
@Controller('store')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StoreUserController {
  constructor(
    private readonly cartService: CartService,
    private readonly checkoutService: CheckoutService,
    private readonly favoritesService: FavoritesService,
    private readonly reviewsService: ReviewsService,
  ) {}

  // =====================
  // CARRINHO
  // =====================

  @Get('cart')
  @ApiOperation({ summary: 'Ver carrinho do usuário' })
  @ApiResponse({ status: 200, description: 'Carrinho atual' })
  async getCart(@Request() req: any) {
    return this.cartService.getOrCreateCart(req.user.id);
  }

  @Post('cart/items')
  @ApiOperation({ summary: 'Adicionar item ao carrinho' })
  @ApiResponse({ status: 201, description: 'Item adicionado' })
  @ApiResponse({ status: 400, description: 'Produto indisponível ou estoque insuficiente' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async addToCart(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Patch('cart/items/:itemId')
  @ApiOperation({ summary: 'Atualizar quantidade do item' })
  @ApiResponse({ status: 200, description: 'Item atualizado' })
  @ApiResponse({ status: 400, description: 'Estoque insuficiente' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  async updateCartItem(
    @Request() req: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, itemId, dto);
  }

  @Delete('cart/items/:itemId')
  @ApiOperation({ summary: 'Remover item do carrinho' })
  @ApiResponse({ status: 200, description: 'Item removido' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  async removeCartItem(@Request() req: any, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  @Delete('cart')
  @ApiOperation({ summary: 'Limpar carrinho' })
  @ApiResponse({ status: 200, description: 'Carrinho limpo' })
  async clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.id);
  }

  // =====================
  // CHECKOUT
  // =====================

  @Post('checkout/validate')
  @ApiOperation({ summary: 'Validar carrinho para checkout' })
  @ApiResponse({ status: 200, description: 'Validação do carrinho' })
  async validateCheckout(@Request() req: any, @Body() dto: ValidateCheckoutDto) {
    return this.checkoutService.validateCheckout(req.user.id, dto.subscriptionPlanId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Processar checkout' })
  @ApiResponse({ status: 201, description: 'Pedido criado' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou carrinho inválido' })
  async processCheckout(@Request() req: any, @Body() dto: ProcessCheckoutDto) {
    return this.checkoutService.processCheckout(req.user.id, dto);
  }

  // =====================
  // FAVORITOS
  // =====================

  @Get('favorites')
  @ApiOperation({ summary: 'Listar favoritos do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de favoritos' })
  async getFavorites(@Request() req: any) {
    return this.favoritesService.getFavorites(req.user.id);
  }

  @Get('favorites/:productId/check')
  @ApiOperation({ summary: 'Verificar se produto está nos favoritos' })
  @ApiResponse({ status: 200, description: 'Status do favorito' })
  async checkFavorite(@Request() req: any, @Param('productId') productId: string) {
    const isFavorited = await this.favoritesService.isFavorited(req.user.id, productId);
    return { isFavorited };
  }

  @Post('favorites/:productId')
  @ApiOperation({ summary: 'Adicionar produto aos favoritos' })
  @ApiResponse({ status: 201, description: 'Adicionado aos favoritos' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 409, description: 'Produto já está nos favoritos' })
  async addFavorite(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.addFavorite(req.user.id, productId);
  }

  @Delete('favorites/:productId')
  @ApiOperation({ summary: 'Remover produto dos favoritos' })
  @ApiResponse({ status: 200, description: 'Removido dos favoritos' })
  @ApiResponse({ status: 404, description: 'Produto não está nos favoritos' })
  async removeFavorite(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.removeFavorite(req.user.id, productId);
  }

  @Post('favorites/:productId/toggle')
  @ApiOperation({ summary: 'Alternar favorito (add/remove)' })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  async toggleFavorite(@Request() req: any, @Param('productId') productId: string) {
    return this.favoritesService.toggleFavorite(req.user.id, productId);
  }

  // =====================
  // REVIEWS
  // =====================

  @Post('products/:productId/reviews')
  @ApiOperation({ summary: 'Criar avaliação de produto' })
  @ApiResponse({ status: 201, description: 'Avaliação criada (pendente moderação)' })
  @ApiResponse({ status: 400, description: 'Usuário não comprou o produto' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 409, description: 'Usuário já avaliou este produto' })
  async createReview(
    @Request() req: any,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(req.user.id, productId, dto);
  }
}
