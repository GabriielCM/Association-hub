import { IsString, IsInt, Min, MinLength, MaxLength } from 'class-validator';

export class ManualCheckinDto {
  @IsString()
  userId: string;

  @IsInt()
  @Min(1)
  checkinNumber: number;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  reason: string;
}
