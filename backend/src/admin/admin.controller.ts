import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('sessions')
  async getAllSessions() {
    return this.adminService.getAllSessions();
  }

  @Get('recommendations')
  async getAllRecommendations() {
    return this.adminService.getAllRecommendations();
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() body: { role: string },
  ) {
    return this.adminService.updateUserRole(userId, body.role);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Get('stats/resources')
  async getResourceStats() {
    return this.adminService.getResourceStats();
  }

  @Get('mentors/performance')
  async getAllMentorsPerformance() {
    return this.adminService.getAllMentorsPerformance();
  }

  @Get('mentors/:id/performance')
  async getMentorPerformance(@Param('id') mentorId: string) {
    return this.adminService.getMentorPerformance(mentorId);
  }

  @Get('applications')
  async getMentorApplications() {
      return this.adminService.getMentorApplications();
  }

  @Put('applications/:id/review')
  async reviewMentorApplication(@Param('id') id: string, @Body() body: { status: string }) {
      return this.adminService.reviewMentorApplication(id, body.status);
  }

  @Get('sessions/:id/ghost-token')
  async getSessionTokenForGhost(@Param('id') sessionId: string) {
    return this.adminService.getSessionTokenForGhost(sessionId);
  }
}
