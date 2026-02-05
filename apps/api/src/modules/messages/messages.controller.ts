import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types';
import { MessagesService } from './messages.service';
import { AddReactionDto } from './dto/add-reaction.dto';

@ApiTags('Mensagens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({ status: 204, description: 'Mensagem excluída' })
  @ApiResponse({ status: 404, description: 'Mensagem não encontrada' })
  async delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.messagesService.deleteMessage(user.sub, id);
  }

  @Post(':id/reactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar reação à mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({ status: 201, description: 'Reação adicionada' })
  async addReaction(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: AddReactionDto
  ) {
    await this.messagesService.addReaction(user.sub, id, dto.emoji);
    return { success: true };
  }

  @Delete(':id/reactions/:emoji')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover reação da mensagem' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiParam({ name: 'emoji', description: 'Emoji da reação' })
  @ApiResponse({ status: 204, description: 'Reação removida' })
  async removeReaction(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Param('emoji') emoji: string
  ) {
    await this.messagesService.removeReaction(user.sub, id, emoji);
  }
}
