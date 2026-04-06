import { IsString, IsDateString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class ScheduleSessionDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  requestIds: string[];

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  topic?: string;
}
