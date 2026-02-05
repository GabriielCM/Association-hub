import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FAQService } from '../faq.service';
import { FAQQueryDto } from '../dto/faq.dto';

interface AuthUser {
  id: string;
  associationId: string;
  role: string;
}

@ApiTags('support')
@Controller('support/faq')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FAQController {
  constructor(private readonly faqService: FAQService) {}

  @Get()
  @ApiOperation({ summary: 'Listar FAQs ativos' })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por texto' })
  @ApiResponse({ status: 200, description: 'Lista de FAQs' })
  async listFAQs(@CurrentUser() user: AuthUser, @Query() query: FAQQueryDto) {
    return this.faqService.listFAQs(user.associationId, query);
  }
}
