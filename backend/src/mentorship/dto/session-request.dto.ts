import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SessionRequestDto {
  @IsString()
  @IsNotEmpty()
  mentorId: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsOptional()
  description?: string;
}
