import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { MentorshipService } from './mentorship.service';
import { ScheduleSessionDto } from './dto/schedule-session.dto';
import { SessionRequestDto } from './dto/session-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { config as dotenvConfig } from 'dotenv';
import * as fs from 'fs';

dotenvConfig();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@Controller('mentorship')
@UseGuards(JwtAuthGuard)
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  // ==================== RESOURCES ====================

  @Get('resources')
  async getMyResources(@CurrentUser() user: any) {
    return this.mentorshipService.getMyResources(user.id);
  }

  @Post('resources')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async addResource(
    @Body() body: { title: string; link?: string; category: string },
    @CurrentUser() user: any,
    @UploadedFile() file?: any,
  ) {
    let link = body.link;
    if (file) {
      try {
          const isRaw = !file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/');
          const result = await cloudinary.uploader.upload(file.path, { resource_type: isRaw ? 'raw' : 'auto' });
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        throw new BadRequestException('Failed to upload file to remote storage.');
      }
    }
    
    if (!link) {
      throw new BadRequestException('Provide either a valid link or upload a file.');
    }

    return this.mentorshipService.addResource(user.id, {
      title: body.title,
      link,
      category: body.category,
    });
  }

  @Put('resources/:id')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async updateResource(
    @Param('id') resourceId: string,
    @Body() body: { title?: string; link?: string; category?: string },
    @CurrentUser() user: any,
    @UploadedFile() file?: any,
  ) {
    const payload: any = { title: body.title, category: body.category };
    if (file) {
      try {
        const isRaw = !file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/');
        const result = await cloudinary.uploader.upload(file.path, { resource_type: isRaw ? 'raw' : 'auto' });
        payload.link = result.secure_url;
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        throw new BadRequestException('Failed to upload file to remote storage.');
      }
    } else if (body.link) {
      payload.link = body.link;
    }
    return this.mentorshipService.updateResource(user.id, resourceId, payload);
  }

  @Delete('resources/:id')
  async deleteResource(
    @Param('id') resourceId: string,
    @CurrentUser() user: any,
  ) {
    return this.mentorshipService.deleteResource(user.id, resourceId);
  }

  // ==================== REQUESTS ====================

  @Post('requests')
  async requestSession(
    @Body() sessionRequestDto: SessionRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.mentorshipService.requestSession(user.id, sessionRequestDto);
  }

  @Get('requests')
  async getRequests(@CurrentUser() user: any) {
    return this.mentorshipService.getRequests(user.id, user.role);
  }

  // ==================== SESSIONS ====================

  @Post('schedule')
  async scheduleSession(
    @Body() scheduleSessionDto: ScheduleSessionDto,
    @CurrentUser() user: any,
  ) {
    return this.mentorshipService.scheduleSession(user.id, scheduleSessionDto);
  }

  @Get('sessions')
  async getSessions(@CurrentUser() user: any) {
    return this.mentorshipService.getSessions(user.id, user.role);
  }

  @Get('sessions/:id')
  async getSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.mentorshipService.getSession(sessionId, user.id, user.role);
  }

  @Post('sessions/:id/join')
  async joinSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.mentorshipService.joinSession(sessionId, user.id);
  }

  @Put('sessions/:id/end')
  async endSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.mentorshipService.endSession(sessionId, user.id, user.role);
  }

  @Put('sessions/:id/cancel')
  async cancelSession(
    @Param('id') sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.mentorshipService.cancelSession(sessionId, user.id, user.role);
  }

  @Get('sessions/:id/token')
  async getVideoCallToken(
    @Param('id') sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.mentorshipService.getVideoCallToken(sessionId, user.id);
  }
}
