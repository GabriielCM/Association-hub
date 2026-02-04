import { IsString, IsInt, IsNumber, Min } from 'class-validator';

export class CheckinDto {
  @IsString()
  eventId: string;

  @IsInt()
  @Min(1)
  checkinNumber: number;

  @IsString()
  securityToken: string;

  @IsNumber()
  timestamp: number;
}
