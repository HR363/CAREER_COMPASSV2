import { IsString, IsOptional } from 'class-validator';

export class CareerRecommendationDto {
  @IsString()
  skills: string;

  @IsString()
  interests: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  goals?: string;
}
