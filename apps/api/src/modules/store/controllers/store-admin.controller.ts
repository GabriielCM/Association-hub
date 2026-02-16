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
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CategoriesService } from '../services/categories.service';
import { ProductsService } from '../services/products.service';
import { ReviewsService } from '../services/reviews.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateVariantDto,
  UpdateVariantDto,
  SetPromotionDto,
} from '../dto/product.dto';
import { ModerateReviewDto } from '../dto/review.dto';

@ApiTags('Store - Admin')
@Controller('admin/store')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class StoreAdminController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  // =====================
  // CATEGORIAS
  // =====================

  @Get('categories')
  @ApiOperation({ summary: 'Listar todas as categorias (incluindo inativas)' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async getAllCategories(@Request() req: any) {
    return this.categoriesService.getCategories(req.user.associationId, true);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Criar categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada' })
  @ApiResponse({ status: 409, description: 'Slug já existe' })
  async createCategory(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(req.user.associationId, dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Excluir categoria' })
  @ApiResponse({ status: 200, description: 'Categoria excluída' })
  @ApiResponse({ status: 400, description: 'Categoria possui produtos' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  @Post('categories/reorder')
  @ApiOperation({ summary: 'Reordenar categorias' })
  @ApiResponse({ status: 200, description: 'Categorias reordenadas' })
  async reorderCategories(@Body() body: { categoryIds: string[] }) {
    const result = await this.categoriesService.reorderCategories(body.categoryIds);
    return { success: true, data: result };
  }

  // =====================
  // PRODUTOS
  // =====================

  @Get('products')
  @ApiOperation({ summary: 'Listar todos os produtos (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de produtos' })
  async getAllProducts() {
    return this.productsService.findAllAdmin();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Detalhes do produto (admin)' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async getProduct(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Post('products')
  @ApiOperation({ summary: 'Criar produto' })
  @ApiResponse({ status: 201, description: 'Produto criado' })
  @ApiResponse({ status: 409, description: 'Slug já existe' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Excluir produto' })
  @ApiResponse({ status: 200, description: 'Produto excluído' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  // =====================
  // VARIANTES
  // =====================

  @Post('products/:productId/variants')
  @ApiOperation({ summary: 'Criar variante do produto' })
  @ApiResponse({ status: 201, description: 'Variante criada' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  @ApiResponse({ status: 409, description: 'SKU já existe' })
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.createVariant(productId, dto);
  }

  @Patch('products/:productId/variants/:variantId')
  @ApiOperation({ summary: 'Atualizar variante' })
  @ApiResponse({ status: 200, description: 'Variante atualizada' })
  @ApiResponse({ status: 404, description: 'Variante não encontrada' })
  async updateVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariantById(productId, variantId, dto);
  }

  @Delete('products/:productId/variants/:variantId')
  @ApiOperation({ summary: 'Excluir variante' })
  @ApiResponse({ status: 200, description: 'Variante excluída' })
  @ApiResponse({ status: 404, description: 'Variante não encontrada' })
  async deleteVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productsService.deleteVariantById(productId, variantId);
  }

  // =====================
  // PROMOÇÕES
  // =====================

  @Post('products/:id/promotion')
  @ApiOperation({ summary: 'Definir promoção do produto' })
  @ApiResponse({ status: 200, description: 'Promoção definida' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async setPromotion(@Param('id') id: string, @Body() dto: SetPromotionDto) {
    return this.productsService.setPromotion(id, dto);
  }

  @Delete('products/:id/promotion')
  @ApiOperation({ summary: 'Remover promoção do produto' })
  @ApiResponse({ status: 200, description: 'Promoção removida' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async removePromotion(@Param('id') id: string) {
    return this.productsService.removePromotion(id);
  }

  // =====================
  // ESTOQUE
  // =====================

  @Patch('products/:id/stock')
  @ApiOperation({ summary: 'Atualizar estoque do produto' })
  @ApiResponse({ status: 200, description: 'Estoque atualizado' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async updateStock(@Param('id') id: string, @Body() body: { stockCount: number }) {
    return this.productsService.updateStock(id, body.stockCount);
  }

  @Patch('products/:productId/variants/:variantId/stock')
  @ApiOperation({ summary: 'Atualizar estoque da variante' })
  @ApiResponse({ status: 200, description: 'Estoque atualizado' })
  @ApiResponse({ status: 404, description: 'Variante não encontrada' })
  async updateVariantStock(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() body: { stockCount: number },
  ) {
    return this.productsService.updateVariantStock(productId, variantId, body.stockCount);
  }

  @Get('products/low-stock')
  @ApiOperation({ summary: 'Listar produtos com estoque baixo' })
  @ApiResponse({ status: 200, description: 'Produtos com estoque baixo' })
  async getLowStockProducts(@Request() req: any) {
    const products = await this.productsService.getLowStockProducts(req.user.associationId);
    return { success: true, data: products };
  }

  // =====================
  // REVIEWS (Moderação)
  // =====================

  @Get('reviews/pending')
  @ApiOperation({ summary: 'Listar avaliações pendentes' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações pendentes' })
  async getPendingReviews() {
    return this.reviewsService.getPendingReviews();
  }

  @Patch('reviews/:id/moderate')
  @ApiOperation({ summary: 'Moderar avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação moderada' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  async moderateReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.reviewsService.moderateReview(id, req.user.id, dto);
  }
}
