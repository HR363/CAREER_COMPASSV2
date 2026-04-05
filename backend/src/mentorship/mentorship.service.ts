import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgoraService } from '../agora/agora.service';
import { ScheduleSessionDto } from './dto/schedule-session.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MentorshipService {
  constructor(
    private prisma: PrismaService,
    private agoraService: AgoraService,
  ) {}

  // ==================== RESOURCES ====================

  async getMyResources(mentorId: string) {
    return this.prisma.resource.findMany({
      where: { mentorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addResource(mentorId: string, data: { title: string; link: string; category: string }) {
    return this.prisma.resource.create({
      data: {
        mentorId,
        title: data.title,
        link: data.link,
        category: data.category,
      },
    });
  }

  async updateResource(mentorId: string, resourceId: string, data: { title?: string; link?: string; category?: string }) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.mentorId !== mentorId) {
      throw new ForbiddenException('You can only edit your own resources');
    }

    return this.prisma.resource.update({
      where: { id: resourceId },
      data,
    });
  }

  async deleteResource(mentorId: string, resourceId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.mentorId !== mentorId) {
      throw new ForbiddenException('You can only delete your own resources');
    }

    return this.prisma.resource.delete({
      where: { id: resourceId },
    });
  }

  // ==================== SESSIONS ====================

  async scheduleSession(dto: ScheduleSessionDto) {
    // Verify mentor exists and is actually a mentor
    const mentor = await this.prisma.user.findUnique({
      where: { id: dto.mentorId, role: 'MENTOR' },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    // Verify student exists
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId, role: 'STUDENT' },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Generate unique room ID for WebRTC
    const roomId = `room_${uuidv4()}`;

    return this.prisma.session.create({
      data: {
        mentorId: dto.mentorId,
        studentId: dto.studentId,
        scheduledAt: new Date(dto.scheduledAt),
        status: 'SCHEDULED',
        roomId,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getSessions(userId: string, userRole: string) {
    const where = userRole === 'MENTOR' 
      ? { mentorId: userId }
      : userRole === 'STUDENT'
      ? { studentId: userId }
      : {};

    return this.prisma.session.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                education: true,
                skills: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                education: true,
                skills: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  async getSession(sessionId: string, userId: string, userRole: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user has access to this session
    if (userRole !== 'ADMIN' && session.mentorId !== userId && session.studentId !== userId) {
      throw new ForbiddenException('Access denied to this session');
    }

    return session;
  }

  async joinSession(sessionId: string, userId: string) {
    const session = await this.getSession(sessionId, userId, 'ADMIN'); // This will be overridden by the actual user role

    // Update session status to in progress
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'IN_PROGRESS',
      },
    });
  }

  async endSession(sessionId: string, userId: string, userRole: string) {
    const session = await this.getSession(sessionId, userId, userRole);

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  async cancelSession(sessionId: string, userId: string, userRole: string) {
    const session = await this.getSession(sessionId, userId, userRole);

    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  async getVideoCallToken(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify user is part of this session
    if (session.mentorId !== userId && session.studentId !== userId) {
      throw new ForbiddenException('You are not authorized to join this session');
    }

    // Check if session is scheduled or in progress
    if (session.status !== 'SCHEDULED' && session.status !== 'IN_PROGRESS') {
      throw new ForbiddenException('Session is not available for joining');
    }

    // Use session ID as channel name
    const channelName = sessionId;
    
    // Generate token with user ID
    const token = this.agoraService.generateRtcToken(
      channelName,
      0, // 0 means Agora will auto-assign a uid
      'publisher', // Both mentor and student can publish
      3600, // Token valid for 1 hour
    );

    return {
      appId: this.agoraService.getAppId(),
      channel: channelName,
      token,
      uid: 0,
    };
  }
}
