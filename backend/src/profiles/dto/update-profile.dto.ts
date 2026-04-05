import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  skills?: string; // JSON string

  @IsOptional()
  @IsString()
  interests?: string; // JSON string

  @IsOptional()
  @IsString()
  goals?: string;
}
