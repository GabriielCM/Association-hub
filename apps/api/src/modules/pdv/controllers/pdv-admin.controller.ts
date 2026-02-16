import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/types';
import { sanitizeFilename, getFileExtension } from '../../../common/utils';
import { PdvService } from '../pdv.service';
import { CreatePdvDto, UpdatePdvDto } from '../dto/create-pdv.dto';
import {
  CreatePdvProductDto,
  UpdatePdvProductDto,
  UpdateStockDto,
} from '../dto/create-pdv-product.dto';

@ApiTags('admin/pdv')
@Controller('admin/pdv')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class PdvAdminController {
  constructor(private readonly pdvService: PdvService) {}

  // ===============================
  // PDV CRUD
  // ===============================

  @Get()
  @ApiOperation({ summary: 'Listar PDVs' })
  @ApiResponse({ status: 200, description: 'Lista de PDVs' })
  async getPdvs(@CurrentUser() user: JwtPayload) {
    const pdvs = await this.pdvService.getPdvs(user.associationId);

    return {
      success: true,
      data: pdvs,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Criar PDV' })
  @ApiResponse({ status: 201, description: 'PDV criado com credenciais' })
  async createPdv(@Body() dto: CreatePdvDto, @CurrentUser() user: JwtPayload) {
    const pdv = await this.pdvService.createPdv(user.associationId, dto);

    return {
      success: true,
      data: pdv,
      message: 'PDV criado. IMPORTANTE: Guarde o apiSecret, ele não será exibido novamente!',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do PDV' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiResponse({ status: 200, description: 'Detalhes do PDV' })
  async getPdv(@Param('id') id: string) {
    const pdv = await this.pdvService.getPdvById(id);

    return {
      success: true,
      data: pdv,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar PDV' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiResponse({ status: 200, description: 'PDV atualizado' })
  async updatePdv(@Param('id') id: string, @Body() dto: UpdatePdvDto) {
    const pdv = await this.pdvService.updatePdv(id, dto);

    return {
      success: true,
      data: pdv,
      message: 'PDV atualizado',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar PDV' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiResponse({ status: 200, description: 'PDV desativado' })
  async deletePdv(@Param('id') id: string) {
    const pdv = await this.pdvService.deletePdv(id);

    return {
      success: true,
      data: pdv,
      message: 'PDV desativado',
    };
  }

  @Post(':id/regenerate-credentials')
  @ApiOperation({ summary: 'Regenerar credenciais do PDV' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiResponse({ status: 200, description: 'Novas credenciais geradas' })
  async regenerateCredentials(@Param('id') id: string) {
    const credentials = await this.pdvService.regenerateApiCredentials(id);

    return {
      success: true,
      data: credentials,
      message: 'Credenciais regeneradas. IMPORTANTE: Guarde o apiSecret!',
    };
  }

  // ===============================
  // Products
  // ===============================

  @Get(':id/products')
  @ApiOperation({ summary: 'Listar produtos do PDV' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de produtos' })
  async getProducts(
    @Param('id') pdvId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const products = await this.pdvService.getProducts(
      pdvId,
      includeInactive === 'true',
    );

    return {
      success: true,
      data: products,
    };
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Adicionar produto ao PDV' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiResponse({ status: 201, description: 'Produto adicionado' })
  async addProduct(@Param('id') pdvId: string, @Body() dto: CreatePdvProductDto) {
    const product = await this.pdvService.addProduct(pdvId, dto);

    return {
      success: true,
      data: product,
      message: 'Produto adicionado',
    };
  }

  @Put(':id/products/:productId')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado' })
  async updateProduct(
    @Param('productId') productId: string,
    @Body() dto: UpdatePdvProductDto,
  ) {
    const product = await this.pdvService.updateProduct(productId, dto);

    return {
      success: true,
      data: product,
      message: 'Produto atualizado',
    };
  }

  @Post(':id/products/:productId/image')
  @ApiOperation({ summary: 'Upload de imagem do produto' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagem do produto (max 5MB, jpg/png/webp)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagem atualizada' })
  @ApiResponse({ status: 400, description: 'Arquivo inválido' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploadsDir = join(process.cwd(), 'uploads', 'pdv-products', productId);
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = getFileExtension(sanitizeFilename(file.originalname));
    const fileName = `img-${Date.now()}${ext}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, file.buffer);

    const imageUrl = `/uploads/pdv-products/${productId}/${fileName}`;
    const product = await this.pdvService.updateProduct(productId, { imageUrl });

    return {
      success: true,
      data: product,
      message: 'Imagem do produto atualizada',
    };
  }

  @Delete(':id/products/:productId')
  @ApiOperation({ summary: 'Remover produto' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiResponse({ status: 200, description: 'Produto removido' })
  async deleteProduct(@Param('productId') productId: string) {
    const product = await this.pdvService.deleteProduct(productId);

    return {
      success: true,
      data: product,
      message: 'Produto desativado',
    };
  }

  // ===============================
  // Stock
  // ===============================

  @Get(':id/stock')
  @ApiOperation({ summary: 'Ver estoque do PDV' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiResponse({ status: 200, description: 'Estoque do PDV' })
  async getStock(@Param('id') pdvId: string) {
    const stock = await this.pdvService.getStock(pdvId);

    return {
      success: true,
      data: stock,
    };
  }

  @Put(':id/stock')
  @ApiOperation({ summary: 'Atualizar estoque' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiResponse({ status: 200, description: 'Estoque atualizado' })
  async updateStock(@Body() dto: UpdateStockDto) {
    const product = await this.pdvService.updateStock(dto);

    return {
      success: true,
      data: product,
      message: 'Estoque atualizado',
    };
  }

  // ===============================
  // Sales Reports
  // ===============================

  @Get(':id/sales')
  @ApiOperation({ summary: 'Relatório de vendas do PDV' })
  @ApiParam({ name: 'id', description: 'ID do PDV' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Relatório de vendas' })
  async getSalesReport(
    @Param('id') pdvId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const report = await this.pdvService.getSalesReport(
      pdvId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      success: true,
      data: report,
    };
  }
}
