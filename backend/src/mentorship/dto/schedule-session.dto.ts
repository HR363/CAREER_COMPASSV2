import { IsString, IsDateString, IsOptional } from 'class-validator';

export class ScheduleSessionDto {
  @IsString()
  mentorId: string;

  @IsString()
  studentId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  description?: string;
}
