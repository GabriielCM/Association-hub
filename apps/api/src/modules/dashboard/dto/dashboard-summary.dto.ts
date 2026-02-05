import { ApiProperty } from '@nestjs/swagger';

export class UserSummaryDto {
  @ApiProperty({ description: 'Nome do usuário (primeiro nome)' })
  name: string;

  @ApiProperty({ description: 'URL do avatar', nullable: true })
  avatar_url: string | null;

  @ApiProperty({ description: 'Saldo de pontos atual' })
  points: number;

  @ApiProperty({ description: 'Variação de pontos hoje' })
  points_today: number;

  @ApiProperty({ description: 'Gráfico dos últimos 7 dias', type: [Number] })
  points_chart: number[];
}

export class DashboardSummaryResponseDto {
  @ApiProperty({ type: UserSummaryDto })
  user: UserSummaryDto;

  @ApiProperty({ description: 'Quantidade de notificações não lidas' })
  unread_notifications: number;

  @ApiProperty({ description: 'Se existem stories não vistos' })
  has_stories: boolean;

  @ApiProperty({ description: 'Preview do feed', type: 'array' })
  feed_preview: any[];
}
