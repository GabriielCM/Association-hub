import { IsString, IsOptional, IsArray, ArrayMaxSize, MaxLength, MinLength } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  attachmentIds?: string[];
}

export class RateChatDto {
  rating: number; // 1-5

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class TransferChatDto {
  @IsString()
  toAgentId: string;
}
