import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { CareerRecommendationDto } from './dto/career-recommendation.dto';
import { LearningPathDto } from './dto/learning-path.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recommend-career')
  async recommendCareer(
    @Body() careerRecommendationDto: CareerRecommendationDto,
    @CurrentUser() user: any,
  ) {
    return this.aiService.generateCareerRecommendations(careerRecommendationDto, user.id);
  }

  @Post('learning-path')
  async generateLearningPath(
    @Body() learningPathDto: LearningPathDto,
    @CurrentUser() user: any,
  ) {
    return this.aiService.generateLearningPath(learningPathDto, user.id);
  }

  @Get('mentors')
  async getMentorRecommendations(@CurrentUser() user: any) {
    return this.aiService.getMentorRecommendations(user.id);
  }

  @Post('chat')
  async chatWithAI(
    @Body() body: { message: string; context?: any },
    @CurrentUser() user: any,
  ) {
    return this.aiService.chatWithAI(body.message, body.context);
  }
}
