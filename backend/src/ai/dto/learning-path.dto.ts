import { IsString, IsOptional } from 'class-validator';

export class LearningPathDto {
  @IsString()
  careerPath: string;

  @IsString()
  currentSkills: string;

  @IsOptional()
  @IsString()
  timeframe?: string;
}
