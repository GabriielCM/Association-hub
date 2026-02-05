import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FAQService } from '../faq.service';
import { CreateFAQDto, UpdateFAQDto, ReorderFAQDto } from '../dto/faq.dto';

interface AuthUser {
  id: string;
  associationId: string;
  role: string;
}

@ApiTags('admin/support')
@Controller('admin/support/faq')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminFAQController {
  constructor(private readonly faqService: FAQService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as FAQs (incluindo inativas)' })
  @ApiResponse({ status: 200, description: 'Lista de FAQs' })
  async listFAQs(@CurrentUser() user: AuthUser) {
    return this.faqService.listAllFAQs(user.associationId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova FAQ' })
  @ApiResponse({ status: 201, description: 'FAQ criada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createFAQ(@CurrentUser() user: AuthUser, @Body() dto: CreateFAQDto) {
    return this.faqService.createFAQ(user.associationId, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reordenar FAQs' })
  @ApiResponse({ status: 200, description: 'FAQs reordenadas' })
  async reorderFAQs(@CurrentUser() user: AuthUser, @Body() dto: ReorderFAQDto) {
    return this.faqService.reorderFAQs(user.associationId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar FAQ' })
  @ApiParam({ name: 'id', description: 'ID da FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ atualizada' })
  @ApiResponse({ status: 404, description: 'FAQ não encontrada' })
  async updateFAQ(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateFAQDto,
  ) {
    return this.faqService.updateFAQ(id, user.associationId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir FAQ' })
  @ApiParam({ name: 'id', description: 'ID da FAQ' })
  @ApiResponse({ status: 204, description: 'FAQ excluída' })
  @ApiResponse({ status: 404, description: 'FAQ não encontrada' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFAQ(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.faqService.deleteFAQ(id, user.associationId);
  }
}
