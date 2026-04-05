import { Controller, Get, Param, UseGuards, Query, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get('mentors')
  async getMentors() {
    return this.usersService.getMentors();
  }

  @Get('mentors/:id')
  async getMentorById(@Param('id') id: string) {
    return this.usersService.getMentorById(id);
  }

  @Get('students')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MENTOR')
  async getStudents() {
    return this.usersService.getStudents();
  }

  @Post('apply-mentor')
  async applyToBeMentor(
    @CurrentUser() user: any,
    @Body() body: { reason: string; resumeUrl?: string }
  ) {
    return this.usersService.applyToBeMentor(user.id, body);
  }
}
