import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    const where = role ? { role } : {};
    
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            education: true,
            skills: true,
            interests: true,
            goals: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            education: true,
            skills: true,
            interests: true,
            goals: true,
          },
        },
        resources: true,
      },
    });
  }

  async getMentors() {
    return this.prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            education: true,
            skills: true,
            interests: true,
          },
        },
        resources: true,
      },
    });
  }

  async getMentorById(mentorId: string) {
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId, role: 'MENTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            education: true,
            skills: true,
            interests: true,
            goals: true,
          },
        },
        resources: {
          select: {
            id: true,
            title: true,
            link: true,
            category: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    return mentor;
  }

  async getStudents() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        profile: {
          select: {
            education: true,
            skills: true,
            interests: true,
            goals: true,
          },
        },
      },
    });
  }

  async applyToBeMentor(userId: string, data: { reason: string; resumeUrl?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'MENTOR' || user.role === 'ADMIN') {
        throw new Error('User is already a mentor or admin');
    }
    
    return this.prisma.mentorApplication.upsert({
        where: { userId },
        update: {
            reason: data.reason,
            resumeUrl: data.resumeUrl,
            status: 'PENDING', // resets status on reapplication
        },
        create: {
            userId,
            reason: data.reason,
            resumeUrl: data.resumeUrl,
        }
    });
  }
}
