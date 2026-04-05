import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AgoraService } from '../agora/agora.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private agoraService: AgoraService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalMentors,
      totalStudents,
      totalSessions,
      activeSessions,
      completedSessions,
      totalRecommendations,
      pendingApplications
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'MENTOR' } }),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.session.count(),
      this.prisma.session.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.session.count({ where: { status: 'COMPLETED' } }),
      this.prisma.recommendation.count(),
      this.prisma.mentorApplication.count({ where: { status: 'PENDING' } })
    ]);

    return {
      users: {
        total: totalUsers,
        mentors: totalMentors,
        students: totalStudents,
      },
      sessions: {
        total: totalSessions,
        active: activeSessions,
        completed: completedSessions,
      },
      recommendations: {
        total: totalRecommendations,
      },
      applications: {
        pending: pendingApplications,
      }
    };
  }

  async getMentorApplications() {
    return this.prisma.mentorApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async reviewMentorApplication(applicationId: string, status: string) {
    const application = await this.prisma.mentorApplication.update({
      where: { id: applicationId },
      data: { status }
    });

    if (status === 'APPROVED') {
      await this.prisma.user.update({
        where: { id: application.userId },
        data: { role: 'MENTOR' }
      });
    }

    return application;
  }

  async getMentorPerformance(mentorId: string) {
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
      include: {
        mentorSessions: true,
      }
    });
    if (!mentor) {
        throw new Error('Mentor not found');
    }

    const sessions = mentor.mentorSessions;
    const completed = sessions.filter(s => s.status === 'COMPLETED').length;
    const canceled = sessions.filter(s => s.status === 'CANCELLED').length;
    const scheduled = sessions.filter(s => s.status === 'SCHEDULED').length;
    const total = sessions.length;

    return {
        mentorId,
        name: mentor.name,
        stats: {
            total,
            completed,
            canceled,
            scheduled,
            completionRate: total > 0 ? (completed / total) * 100 : 0
        }
    };
  }

  async getAllMentorsPerformance() {
    const mentors = await this.prisma.user.findMany({
        where: { role: 'MENTOR' },
        include: { mentorSessions: true }
    });

    return mentors.map(mentor => {
        const total = mentor.mentorSessions.length;
        const completed = mentor.mentorSessions.filter(s => s.status === 'COMPLETED').length;
        const canceled = mentor.mentorSessions.filter(s => s.status === 'CANCELLED').length;
        
        return {
            id: mentor.id,
            name: mentor.name,
            totalSessions: total,
            completedSessions: completed,
            canceledSessions: canceled,
            completionRate: total > 0 ? (completed / total) * 100 : 0
        };
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
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
          },
        },
        _count: {
          select: {
            mentorSessions: true,
            studentSessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAllSessions() {
    return this.prisma.session.findMany({
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
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  async getAllRecommendations() {
    return this.prisma.recommendation.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getResourceStats() {
    return this.prisma.resource.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });
  }

  async getSessionTokenForGhost(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }
    
    // Ghost mode uses audience role and dynamic uid (0 allows Agora to assign or generates new)
    const token = this.agoraService.generateRtcToken(session.roomId, 0, 'subscriber');
    
    return {
      token,
      roomId: session.roomId,
    };
  }
}
