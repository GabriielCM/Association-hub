import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { ProductsService } from '../services/products.service';
import { ProductQueryDto } from '../dto/product.dto';

@ApiTags('Store - Público')
@Controller('store')
@ApiHeader({ name: 'x-association-id', required: true, description: 'ID da associação' })
export class StoreController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  // =====================
  // CATEGORIAS
  // =====================

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias ativas' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async getCategories(@Headers('x-association-id') associationId: string) {
    const data = await this.categoriesService.getCategories(associationId);
    return { success: true, data };
  }

  @Get('categories/:slug')
  @ApiOperation({ summary: 'Detalhes de uma categoria' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async getCategoryBySlug(
    @Headers('x-association-id') associationId: string,
    @Param('slug') slug: string,
  ) {
    const data = await this.categoriesService.getCategoryBySlug(associationId, slug);
    return { success: true, data };
  }

  // =====================
  // PRODUTOS
  // =====================

  @Get('products')
  @ApiOperation({ summary: 'Listar produtos com filtros' })
  @ApiResponse({ status: 200, description: 'Lista paginada de produtos' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'type', required: false, enum: ['PHYSICAL', 'VOUCHER', 'SERVICE'] })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por nome' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'promotional', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getProducts(
    @Headers('x-association-id') associationId: string,
    @Query() query: ProductQueryDto,
  ) {
    const data = await this.productsService.findAll(query, associationId);
    return { success: true, data };
  }

  @Get('products/featured')
  @ApiOperation({ summary: 'Listar produtos em destaque' })
  @ApiResponse({ status: 200, description: 'Lista de produtos em destaque' })
  async getFeaturedProducts(@Headers('x-association-id') associationId: string) {
    const result = await this.productsService.findAll({ featured: true, limit: 10 }, associationId);
    return { success: true, data: result.data };
  }

  @Get('products/promotional')
  @ApiOperation({ summary: 'Listar produtos promocionais' })
  @ApiResponse({ status: 200, description: 'Lista de produtos em promoção' })
  async getPromotionalProducts(@Headers('x-association-id') associationId: string) {
    const result = await this.productsService.findAll({ promotional: true, limit: 20 }, associationId);
    return { success: true, data: result.data };
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Detalhes de um produto' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async getProductBySlug(@Param('slug') slug: string) {
    const data = await this.productsService.findBySlug(slug);
    return { success: true, data };
  }

  @Get('products/:id/reviews')
  @ApiOperation({ summary: 'Listar avaliações de um produto' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações aprovadas' })
  async getProductReviews(@Param('id') productId: string) {
    const data = await this.productsService.getProductReviews(productId);
    return { success: true, data };
  }
}
