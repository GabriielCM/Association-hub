import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/types';
import { PdvService } from '../pdv.service';
import { CreatePdvCategoryDto, UpdatePdvCategoryDto } from '../dto/pdv-category.dto';

@ApiTags('admin/pdv-categories')
@Controller('admin/pdv-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class PdvCategoryController {
  constructor(private readonly pdvService: PdvService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias de PDV' })
  @ApiResponse({ status: 200, description: 'Lista de categorias' })
  async getCategories(@CurrentUser() user: JwtPayload) {
    const categories = await this.pdvService.getCategories(user.associationId);

    return {
      success: true,
      data: categories,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Criar categoria de PDV' })
  @ApiResponse({ status: 201, description: 'Categoria criada' })
  async createCategory(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePdvCategoryDto,
  ) {
    const category = await this.pdvService.createCategory(
      user.associationId,
      dto.name,
    );

    return {
      success: true,
      data: category,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar categoria de PDV' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdatePdvCategoryDto,
  ) {
    const category = await this.pdvService.updateCategory(id, dto.name);

    return {
      success: true,
      data: category,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir categoria de PDV' })
  @ApiParam({ name: 'id', description: 'ID da categoria' })
  @ApiResponse({ status: 200, description: 'Categoria excluída' })
  async deleteCategory(@Param('id') id: string) {
    await this.pdvService.deleteCategory(id);

    return {
      success: true,
      message: 'Categoria excluída',
    };
  }
}
