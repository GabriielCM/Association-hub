import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import type { JwtPayload } from '../../common/types';
import { SpacesService } from './spaces.service';
import {
  SpaceQueryDto,
  SpaceAvailabilityQueryDto,
  SpaceResponseDto,
} from './dto';

@ApiTags('spaces')
@ApiBearerAuth()
@Controller('api/v1/espacos')
@UseGuards(JwtAuthGuard)
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar espaços ativos' })
  @ApiResponse({ status: 200, description: 'Lista de espaços retornada com sucesso' })
  async listSpaces(@CurrentUser() user: JwtPayload, @Query() query: SpaceQueryDto) {
    return this.spacesService.listSpaces(user.associationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um espaço' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 200, description: 'Espaço retornado com sucesso', type: SpaceResponseDto })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado' })
  async getSpace(@Param('id') id: string) {
    return this.spacesService.getSpace(id);
  }

  @Get(':id/disponibilidade')
  @ApiOperation({ summary: 'Obter disponibilidade do espaço' })
  @ApiParam({ name: 'id', description: 'ID do espaço' })
  @ApiResponse({ status: 200, description: 'Disponibilidade retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Espaço não encontrado' })
  async getAvailability(
    @Param('id') id: string,
    @Query() query: SpaceAvailabilityQueryDto,
  ) {
    return this.spacesService.getAvailability(id, query);
  }
}
