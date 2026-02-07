import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { JwtPayload } from '../../common/types';
import { PartnersService } from './partners.service';
import {
  BenefitsQueryDto,
  NearbyQueryDto,
  CreatePartnerDto,
  UpdatePartnerDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';

// ===========================================
// USER CONTROLLER - BENEFITS
// ===========================================

@ApiTags('Benefits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar parceiros/benefícios' })
  @ApiResponse({ status: 200, description: 'Parceiros retornados com sucesso' })
  async listBenefits(@CurrentUser() user: JwtPayload, @Query() query: BenefitsQueryDto) {
    const data = await this.partnersService.listBenefits(user.associationId, user.sub, query);
    return { success: true, data };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorias de parceiros' })
  @ApiResponse({ status: 200, description: 'Categorias retornadas com sucesso' })
  async listCategories(@CurrentUser() user: JwtPayload) {
    const data = await this.partnersService.listCategories(user.associationId);
    return { success: true, data };
  }

  @Post('nearby')
  @ApiOperation({ summary: 'Buscar parceiros próximos' })
  @ApiResponse({ status: 200, description: 'Parceiros próximos retornados' })
  async getNearbyPartners(@CurrentUser() user: JwtPayload, @Body() query: NearbyQueryDto) {
    const data = await this.partnersService.getNearbyPartners(user.associationId, user.sub, query);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um parceiro' })
  @ApiResponse({ status: 200, description: 'Parceiro retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Parceiro não encontrado' })
  async getPartnerDetails(@Param('id') partnerId: string, @CurrentUser() user: JwtPayload) {
    const data = await this.partnersService.getPartnerDetails(partnerId, user.sub);
    return { success: true, data };
  }
}

// ===========================================
// ADMIN CONTROLLER - PARTNERS
// ===========================================

@ApiTags('Admin - Partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/partners')
export class AdminPartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os parceiros (admin)' })
  @ApiResponse({ status: 200, description: 'Parceiros retornados com sucesso' })
  async listPartners(@CurrentUser() user: JwtPayload, @Query() query: BenefitsQueryDto) {
    const data = await this.partnersService.listAdminPartners(user.associationId, query);
    return { success: true, data };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar todas as categorias (admin)' })
  @ApiResponse({ status: 200, description: 'Categorias retornadas com sucesso' })
  async listCategories(@CurrentUser() user: JwtPayload) {
    const data = await this.partnersService.listAdminCategories(user.associationId);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes completos de um parceiro (admin)' })
  @ApiResponse({ status: 200, description: 'Parceiro retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Parceiro não encontrado' })
  async getPartner(@Param('id') partnerId: string, @CurrentUser() user: JwtPayload) {
    const data = await this.partnersService.getAdminPartnerDetail(partnerId, user.associationId);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Criar parceiro' })
  @ApiResponse({ status: 201, description: 'Parceiro criado com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async createPartner(@CurrentUser() user: JwtPayload, @Body() dto: CreatePartnerDto) {
    const data = await this.partnersService.createPartner(user.associationId, dto);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar parceiro' })
  @ApiResponse({ status: 200, description: 'Parceiro atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Parceiro não encontrado' })
  async updatePartner(
    @Param('id') partnerId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePartnerDto,
  ) {
    const data = await this.partnersService.updatePartner(partnerId, user.associationId, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar parceiro' })
  @ApiResponse({ status: 200, description: 'Parceiro desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Parceiro não encontrado' })
  async deletePartner(@Param('id') partnerId: string, @CurrentUser() user: JwtPayload) {
    await this.partnersService.deletePartner(partnerId, user.associationId);
    return { success: true, message: 'Parceiro desativado com sucesso' };
  }

  @Post('categories')
  @ApiOperation({ summary: 'Criar categoria de parceiros' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Slug já existe' })
  async createCategory(@CurrentUser() user: JwtPayload, @Body() dto: CreateCategoryDto) {
    const data = await this.partnersService.createCategory(user.associationId, dto);
    return { success: true, data };
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async updateCategory(
    @Param('id') categoryId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.partnersService.updateCategory(categoryId, user.associationId, dto);
    return { success: true, data };
  }
}
